import {
  handleError,
  json,
  parseJsonObject,
  requireDatabase,
  requireText,
  textField,
  validateEmail,
} from "../../lib/pages-api.js";

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDatabase(env);
    const body = await parseJsonObject(request);
    requireText(body, ["name", "email", "whatsapp", "role"]);

    const provider = {
      id: `PR-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      name: textField(body, "name", 120),
      email: textField(body, "email", 254),
      whatsapp: textField(body, "whatsapp", 40),
      role: textField(body, "role", 80),
      languages: textField(body, "languages", 240, false),
      experience: textField(body, "experience", 4_000, false),
    };
    validateEmail(provider.email);

    await db.prepare(`
      INSERT INTO providers
        (id, status, created_at, name, email, whatsapp, role, languages, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      provider.id,
      provider.status,
      provider.createdAt,
      provider.name,
      provider.email,
      provider.whatsapp,
      provider.role,
      provider.languages,
      provider.experience,
    ).run();

    return json({ ok: true, provider }, 201);
  } catch (error) {
    return handleError(error, request);
  }
}
