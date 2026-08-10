import {
  handleError,
  HttpError,
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
    requireText(body, ["name", "email", "whatsapp", "tour", "date", "language"]);

    const people = Number(body.people);
    if (!Number.isInteger(people) || people < 1) {
      throw new HttpError(400, "People must be a positive integer");
    }

    const booking = {
      id: `BK-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      status: "new",
      createdAt: new Date().toISOString(),
      name: textField(body, "name", 120),
      email: textField(body, "email", 254),
      whatsapp: textField(body, "whatsapp", 40),
      tour: textField(body, "tour", 120),
      date: textField(body, "date", 40),
      people,
      language: textField(body, "language", 80),
      pickup: textField(body, "pickup", 240, false),
      comments: textField(body, "comments", 2_000, false),
    };
    validateEmail(booking.email);

    await db.prepare(`
      INSERT INTO bookings
        (id, status, created_at, name, email, whatsapp, tour, date, people, language, pickup, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      booking.id,
      booking.status,
      booking.createdAt,
      booking.name,
      booking.email,
      booking.whatsapp,
      booking.tour,
      booking.date,
      booking.people,
      booking.language,
      booking.pickup,
      booking.comments,
    ).run();

    return json({ ok: true, booking }, 201);
  } catch (error) {
    return handleError(error, request);
  }
}
