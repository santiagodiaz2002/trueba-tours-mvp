const MAX_JSON_BYTES = 16_384;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function parseJsonObject(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BYTES) {
    throw new HttpError(413, "Request body is too large");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BYTES) {
    throw new HttpError(413, "Request body is too large");
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "JSON body must be an object");
  }

  return body;
}

export function requireText(body, fields) {
  const missing = fields.filter((field) => typeof body[field] !== "string" || body[field].trim() === "");
  if (missing.length) {
    throw new HttpError(400, `Missing required fields: ${missing.join(", ")}`);
  }
}

export function textField(body, field, maxLength, required = true) {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `Missing required field: ${field}`);
    return "";
  }
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new HttpError(400, `${field} is too long`);
  return normalized;
}

export function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Email is invalid");
  }
}

export function requireDatabase(env) {
  if (!env.DB) throw new HttpError(500, "D1 binding DB is not configured");
  return env.DB;
}

export async function verifySecret(provided, expected) {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

export function handleError(error, request) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(JSON.stringify({
    message: "Pages Function request failed",
    error: error instanceof Error ? error.message : String(error),
    method: request.method,
    path: new URL(request.url).pathname,
  }));
  return json({ error: "Internal server error" }, 500);
}
