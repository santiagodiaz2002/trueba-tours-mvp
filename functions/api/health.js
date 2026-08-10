import { json } from "../../lib/pages-api.js";

export function onRequestGet() {
  return json({ ok: true, service: "trueba-tours-backend" });
}
