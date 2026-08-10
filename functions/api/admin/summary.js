import {
  handleError,
  HttpError,
  json,
  requireDatabase,
  verifySecret,
} from "../../../lib/pages-api.js";

export async function onRequestGet({ request, env }) {
  try {
    const db = requireDatabase(env);
    if (!env.ADMIN_PASSWORD) throw new HttpError(500, "ADMIN_PASSWORD is not configured");

    const providedPassword = request.headers.get("x-admin-password") || "";
    if (!(await verifySecret(providedPassword, env.ADMIN_PASSWORD))) {
      throw new HttpError(401, "Invalid admin password");
    }

    const [bookingsResult, providersResult] = await Promise.all([
      db.prepare(`
        SELECT id, status, created_at AS createdAt, name, email, whatsapp,
               tour, date, people, language, pickup, comments
        FROM bookings
        ORDER BY created_at DESC
      `).all(),
      db.prepare(`
        SELECT id, status, created_at AS createdAt, name, email, whatsapp,
               role, languages, experience
        FROM providers
        ORDER BY created_at DESC
      `).all(),
    ]);

    return json({
      bookings: bookingsResult.results || [],
      providers: providersResult.results || [],
    });
  } catch (error) {
    return handleError(error, request);
  }
}
