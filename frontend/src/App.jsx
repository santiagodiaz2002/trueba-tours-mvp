import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const tours = [
  {
    id: "essential",
    title: "Buenos Aires Essential Tour",
    duration: "4 hours",
    price: "From USD 60 / person",
    description: "Discover Plaza de Mayo, San Telmo, La Boca, Puerto Madero and Recoleta with a verified local guide.",
    tag: "Best for first-time visitors",
  },
  {
    id: "driver",
    title: "Private City Tour with Driver",
    duration: "4 hours",
    price: "From USD 149 / group",
    description: "A private route through Buenos Aires with pickup, comfortable transport and a local host.",
    tag: "Most comfortable",
  },
  {
    id: "food",
    title: "Food & Local Culture Tour",
    duration: "3 hours",
    price: "From USD 75 / person",
    description: "Taste empanadas, parrilla, wine, coffee and classic porteño flavors with a local guide.",
    tag: "Local favorite",
  },
  {
    id: "tango",
    title: "Tango Night Experience",
    duration: "Evening experience",
    price: "From USD 120 / person",
    description: "Dinner, tango show assistance and optional private transfer for a smooth night out.",
    tag: "Premium night out",
  },
];

const steps = [
  ["01", "Choose your tour", "Pick the experience, date, language and group size."],
  ["02", "We confirm by WhatsApp", "You get fast confirmation, pickup details and payment link."],
  ["03", "Meet your local guide", "Enjoy Buenos Aires with verified guides and drivers."],
];

const benefits = [
  "Verified local guides and drivers",
  "Private and small-group experiences",
  "English, Portuguese and Spanish available",
  "Clear pricing before booking",
  "Fairer pay for the people who run your tour",
  "WhatsApp support before and during the experience",
];

function Button({ children, variant = "primary", href, type = "button", onClick }) {
  const className = variant === "secondary" ? "btn btn-secondary" : "btn";
  if (href) return <a className={className} href={href}>{children}</a>;
  return <button type={type} onClick={onClick} className={className}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function BookingForm({ selectedTour, setSelectedTour }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    tour: selectedTour || "essential",
    date: "",
    people: "2",
    language: "English",
    pickup: "",
    comments: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    if (selectedTour) setForm((prev) => ({ ...prev, tour: selectedTour }));
  }, [selectedTour]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit booking");

      setStatus("success");
      setMessage(`Booking request received. Reference: ${data.booking.id}`);
      setForm({
        name: "",
        email: "",
        whatsapp: "",
        tour: selectedTour || "essential",
        date: "",
        people: "2",
        language: "English",
        pickup: "",
        comments: "",
      });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <form className="form" onSubmit={submit} id="booking-form">
      <div className="form-grid">
        <label>Name<input required name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" /></label>
        <label>Email<input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@email.com" /></label>
        <label>WhatsApp<input required name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+1 555 000 000" /></label>
        <label>Tour<select name="tour" value={form.tour} onChange={(e) => { handleChange(e); setSelectedTour(e.target.value); }}>{tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}</select></label>
        <label>Date<input required type="date" name="date" value={form.date} onChange={handleChange} /></label>
        <label>People<input required min="1" type="number" name="people" value={form.people} onChange={handleChange} /></label>
        <label>Language<select name="language" value={form.language} onChange={handleChange}><option>English</option><option>Portuguese</option><option>Spanish</option></select></label>
        <label>Pickup zone<input name="pickup" value={form.pickup} onChange={handleChange} placeholder="Hotel / Palermo / Recoleta" /></label>
      </div>
      <label>Comments<textarea name="comments" value={form.comments} onChange={handleChange} placeholder="Tell us what you want to see, special needs, arrival time, etc." /></label>
      <Button type="submit">{status === "loading" ? "Sending..." : "Send booking request"}</Button>
      {message && <p className={`status ${status}`}>{message}</p>}
    </form>
  );
}

function ProviderForm() {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", role: "Guide", languages: "", experience: "" });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit application");
      setStatus("success");
      setMessage(`Application received. Reference: ${data.provider.id}`);
      setForm({ name: "", email: "", whatsapp: "", role: "Guide", languages: "", experience: "" });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <form className="provider-form" onSubmit={submit}>
      <input required name="name" value={form.name} onChange={change} placeholder="Full name" />
      <input required type="email" name="email" value={form.email} onChange={change} placeholder="Email" />
      <input required name="whatsapp" value={form.whatsapp} onChange={change} placeholder="WhatsApp" />
      <select name="role" value={form.role} onChange={change}><option>Guide</option><option>Driver</option><option>Guide + Driver</option></select>
      <input name="languages" value={form.languages} onChange={change} placeholder="Languages" />
      <textarea name="experience" value={form.experience} onChange={change} placeholder="Experience, vehicle, certifications, availability" />
      <button className="dark-btn" type="submit">{status === "loading" ? "Sending..." : "Apply now"}</button>
      {message && <p className={`status ${status}`}>{message}</p>}
    </form>
  );
}

function AdminPanel() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadAdmin = async () => {
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/summary`, {
        headers: { "x-admin-password": password },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Admin access failed");
      setData(payload);
    } catch (err) {
      setError(err.message);
      setData(null);
    }
  };

  return (
    <section className="admin-section" id="admin">
      <div className="container">
        <p className="eyebrow">Internal MVP</p>
        <h2>Admin summary</h2>
        <p className="muted">Basic internal view for testing. Default password: <strong>admin123</strong>. Change it in backend/.env.</p>
        <div className="admin-login">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" />
          <button className="dark-btn" onClick={loadAdmin}>Load data</button>
        </div>
        {error && <p className="status error">{error}</p>}
        {data && (
          <div className="admin-grid">
            <Card><h3>{data.bookings.length}</h3><p>Bookings</p></Card>
            <Card><h3>{data.providers.length}</h3><p>Provider applications</p></Card>
            <Card><h3>JSON</h3><p>Stored locally in backend/data</p></Card>
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const [selectedTour, setSelectedTour] = useState("essential");
  const selectedTourName = useMemo(() => tours.find((tour) => tour.id === selectedTour)?.title || tours[0].title, [selectedTour]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="container nav">
          <a href="#top" className="brand"><span>BA</span><strong>TrueBA Tours</strong></a>
          <nav>
            <a href="#tours">Tours</a>
            <a href="#booking-form">Book</a>
            <a href="#guides">For guides</a>
            <a href="#admin">Admin</a>
          </nav>
          <a className="btn" href="https://wa.me/5491111111111" target="_blank" rel="noreferrer">Book by WhatsApp</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="pill">Private tours with verified locals</div>
              <h1>Discover Buenos Aires with locals, not agencies.</h1>
              <p className="lead">Book private city tours, food experiences and transfers with trusted guides and drivers. Clear prices, WhatsApp support and fairer pay for the people who make your trip memorable.</p>
              <div className="actions"><a className="btn" href="#booking-form">Reserve your tour</a><a className="btn btn-secondary" href="#tours">View tours</a></div>
              <div className="trust"><span>★ 4.8+ rated experiences</span><span>🌎 EN / PT / ES</span><span>💳 Secure payment</span></div>
            </div>
            <Card className="featured">
              <div className="featured-inner">
                <div className="featured-head"><div><p>Featured experience</p><h2>Private City Tour</h2></div><span>Popular</span></div>
                <div className="tour-visual"><div className="icon">🚗</div><h3>Buenos Aires in 4 hours</h3><p>Pickup, private route, local insights and flexible stops.</p><div className="mini-grid"><div><strong>4h</strong><small>Duration</small></div><div><strong>1-10</strong><small>People</small></div><div><strong>3</strong><small>Languages</small></div></div></div>
                <div className="price-box"><div><small>Starting at</small><strong>USD 60</strong></div><a href="#booking-form" className="dark-btn">Request now</a></div>
              </div>
            </Card>
          </div>
        </section>

        <section id="tours" className="container section">
          <p className="eyebrow">Experiences</p>
          <h2>Choose your Buenos Aires tour</h2>
          <p className="muted wide">Start with a classic route or request a custom itinerary. Every tour can be private.</p>
          <div className="tour-grid">
            {tours.map((tour) => (
              <Card key={tour.id}>
                <div className="tag">{tour.tag}</div>
                <h3>{tour.title}</h3>
                <p className="small-muted">{tour.duration}</p>
                <p>{tour.description}</p>
                <div className="card-footer"><strong>{tour.price}</strong><a className="btn" href="#booking-form" onClick={() => setSelectedTour(tour.id)}>Ask availability</a></div>
              </Card>
            ))}
          </div>
        </section>

        <section className="light-section" id="how"><div className="container"><p className="eyebrow dark">Simple booking</p><h2>Book in minutes. Enjoy the city with confidence.</h2><div className="step-grid">{steps.map(([number, title, text]) => <div className="step" key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>

        <section className="container split section"><div><p className="eyebrow">Why book with us</p><h2>Better tours. Fairer pay.</h2><p className="muted">Traditional agencies often keep most of the margin. Our platform connects travelers with the people who actually create the experience.</p></div><div className="benefits">{benefits.map((benefit) => <div key={benefit}>✓ {benefit}</div>)}</div></section>

        <section className="booking-section"><div className="container split"><div><p className="eyebrow">Book now</p><h2>Request: {selectedTourName}</h2><p className="muted">This creates a real booking request in the backend. Then you can confirm by WhatsApp and send a payment link.</p></div><Card><BookingForm selectedTour={selectedTour} setSelectedTour={setSelectedTour} /></Card></div></section>

        <section id="guides" className="guides-section"><div className="container split"><div><p className="eyebrow">For guides and drivers</p><h2>Work directly. Earn more.</h2><p className="muted">Apply to become a verified local guide or driver. Receive tour requests, accept the ones that fit your schedule and build your own reputation.</p></div><div className="provider-card"><h3>Apply as a provider</h3><p>We are onboarding English, Portuguese and Spanish-speaking guides, private drivers and local experience hosts in Buenos Aires.</p><ProviderForm /></div></div></section>

        <section className="cta"><h2>Ready to explore Buenos Aires?</h2><p>Tell us your date, group size and preferred language. We will confirm your best available option by WhatsApp.</p><div className="actions center"><a className="btn" href="#booking-form">Book now</a><a className="btn btn-secondary" href="https://wa.me/5491111111111" target="_blank" rel="noreferrer">WhatsApp</a></div></section>

        <AdminPanel />
      </main>

      <footer>© 2026 TrueBA Tours. Private tours in Buenos Aires with verified local guides and drivers.</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
