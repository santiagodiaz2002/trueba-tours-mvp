import http from "http";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const DATA_DIR = path.join(__dirname, "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const PROVIDERS_FILE = path.join(DATA_DIR, "providers.json");

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-admin-password",
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function ensureFile(filePath) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

async function readJson(filePath) {
  await ensureFile(filePath);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content || "[]");
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function id(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !body[field] || String(body[field]).trim() === "");
  return missing.length ? `Missing required fields: ${missing.join(", ")}` : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { ok: true });
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, service: "trueba-tours-backend" });
    }

    if (req.method === "POST" && url.pathname === "/api/bookings") {
      const body = await readBody(req);
      const error = requireFields(body, ["name", "email", "whatsapp", "tour", "date", "people", "language"]);
      if (error) return sendJson(res, 400, { error });

      const booking = {
        id: id("BK"),
        status: "new",
        createdAt: new Date().toISOString(),
        name: String(body.name).trim(),
        email: String(body.email).trim(),
        whatsapp: String(body.whatsapp).trim(),
        tour: String(body.tour).trim(),
        date: String(body.date).trim(),
        people: Number(body.people),
        language: String(body.language).trim(),
        pickup: String(body.pickup || "").trim(),
        comments: String(body.comments || "").trim(),
      };

      const bookings = await readJson(BOOKINGS_FILE);
      bookings.unshift(booking);
      await writeJson(BOOKINGS_FILE, bookings);
      return sendJson(res, 201, { ok: true, booking });
    }

    if (req.method === "POST" && url.pathname === "/api/providers") {
      const body = await readBody(req);
      const error = requireFields(body, ["name", "email", "whatsapp", "role"]);
      if (error) return sendJson(res, 400, { error });

      const provider = {
        id: id("PR"),
        status: "pending_review",
        createdAt: new Date().toISOString(),
        name: String(body.name).trim(),
        email: String(body.email).trim(),
        whatsapp: String(body.whatsapp).trim(),
        role: String(body.role).trim(),
        languages: String(body.languages || "").trim(),
        experience: String(body.experience || "").trim(),
      };

      const providers = await readJson(PROVIDERS_FILE);
      providers.unshift(provider);
      await writeJson(PROVIDERS_FILE, providers);
      return sendJson(res, 201, { ok: true, provider });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/summary") {
      if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
        return sendJson(res, 401, { error: "Invalid admin password" });
      }
      const bookings = await readJson(BOOKINGS_FILE);
      const providers = await readJson(PROVIDERS_FILE);
      return sendJson(res, 200, { bookings, providers });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`TrueBA Tours backend running on http://localhost:${PORT}`);
});
