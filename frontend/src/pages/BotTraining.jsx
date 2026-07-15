import { useEffect, useState } from "react";
import api from "../lib/api";

const TONES = [
  { id: "professional", label: "💼 Professional", desc: "Polished, formal replies" },
  { id: "friendly", label: "😊 Friendly", desc: "Warm and approachable" },
  { id: "casual", label: "✌️ Casual", desc: "Relaxed, like a friend" },
];

export default function BotTraining() {
  const [form, setForm] = useState({
    description: "", services: "", workingHours: "",
    faq: "", tone: "friendly",
    greeting: "Hi! How can I help you today?",
    primaryColor: "#7c3aed",
  });
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/tenant/config")
      .then((res) => {
        setBusinessName(res.data.businessName || "");
        if (res.data.botConfig) setForm((f) => ({ ...f, ...res.data.botConfig }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setSaved(false); };
  }

  async function save() {
    setSaving(true);
    try {
      await api.put("/tenant/config", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-loading">Loading bot configuration…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 Bot Training</h1>
          <p className="page-sub">Teach your AI assistant about {businessName || "your business"}</p>
        </div>
        <button className="primary-btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="training-grid">
        <div className="panel">
          <h2 className="panel-title" style={{ marginBottom: "16px" }}>Business Knowledge</h2>

          <label className="field-label">What does your business do?</label>
          <textarea className="training-textarea" rows={3}
            placeholder="e.g. We are an Italian restaurant in central London serving authentic pasta, pizza and wine since 2015."
            value={form.description} onChange={set("description")} />

          <label className="field-label">Services & Prices</label>
          <textarea className="training-textarea" rows={4}
            placeholder={"e.g.\nMargherita Pizza — £12\nCarbonara — £14\nHouse wine — £6/glass\nTable booking for groups up to 20"}
            value={form.services} onChange={set("services")} />

          <label className="field-label">Working Hours</label>
          <textarea className="training-textarea" rows={2}
            placeholder="e.g. Mon-Fri 12:00-23:00, Sat-Sun 12:00-00:00"
            value={form.workingHours} onChange={set("workingHours")} />

          <label className="field-label">Frequently Asked Questions</label>
          <textarea className="training-textarea" rows={5}
            placeholder={"e.g.\nQ: Do you deliver?\nA: Yes, via Deliveroo within 3 miles.\n\nQ: Do you have vegan options?\nA: Yes, we have a full vegan menu."}
            value={form.faq} onChange={set("faq")} />
        </div>

        <div>
          <div className="panel">
            <h2 className="panel-title" style={{ marginBottom: "16px" }}>Bot Personality</h2>

            <label className="field-label">Tone of voice</label>
            <div className="tone-grid">
              {TONES.map((t) => (
                <button key={t.id}
                  className={`tone-btn ${form.tone === t.id ? "tone-active" : ""}`}
                  onClick={() => { setForm((f) => ({ ...f, tone: t.id })); setSaved(false); }}>
                  <div className="tone-label">{t.label}</div>
                  <div className="tone-desc">{t.desc}</div>
                </button>
              ))}
            </div>

            <label className="field-label" style={{ marginTop: "16px" }}>Greeting message</label>
            <input className="training-input" value={form.greeting} onChange={set("greeting")} />

            <label className="field-label">Widget colour</label>
            <div className="color-row">
              <input type="color" className="color-picker" value={form.primaryColor}
                onChange={set("primaryColor")} />
              <span className="color-value">{form.primaryColor}</span>
            </div>
          </div>

          <div className="panel" style={{ marginTop: "20px" }}>
            <h2 className="panel-title" style={{ marginBottom: "12px" }}>💡 Tips</h2>
            <ul className="tips-list">
              <li>Be specific with prices — the bot quotes them directly</li>
              <li>Add FAQs your customers actually ask</li>
              <li>The bot only answers about YOUR business</li>
              <li>Changes apply instantly to your live widget</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
