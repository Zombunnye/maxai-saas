import { useEffect, useState } from "react";
import api from "../lib/api";

// ─── WHY: Празна форма-шаблон за нов план
const EMPTY_PLAN = {
  key: "", name: "", description: "",
  prices: { gbp: 0, eur: 0, usd: 0 },
  limits: { chatbots: 1, conversationsPerMonth: 100, removeBranding: false, whiteLabel: false, apiAccess: false },
  sortOrder: 0, isFeatured: false, isActive: true,
};

export default function PlansManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // plan обект или null
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const res = await api.get("/plans/all");
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(plan) {
    setEditing(JSON.parse(JSON.stringify(plan))); // deep copy
    setIsNew(false);
  }

  function startNew() {
    setEditing(JSON.parse(JSON.stringify(EMPTY_PLAN)));
    setIsNew(true);
  }

  function setField(path, value) {
    setEditing((e) => {
      const copy = { ...e };
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      if (isNew) {
        await api.post("/plans", editing);
        setMessage("✅ Plan created");
      } else {
        await api.put(`/plans/${editing._id}`, editing);
        setMessage("✅ Plan updated");
      }
      setEditing(null);
      load();
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Save failed"));
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  }

  async function remove(plan) {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await api.delete(`/plans/${plan._id}`);
      setMessage("✅ Plan deleted");
      load();
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Delete failed"));
    }
    setTimeout(() => setMessage(""), 4000);
  }

  if (loading) return <div className="page-loading">Loading plans…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Plans & Pricing</h1>
          <p className="page-sub">Manage subscription plans — changes apply everywhere instantly</p>
        </div>
        <button className="primary-btn" onClick={startNew}>+ New Plan</button>
      </div>

      {message && <div className="plans-message">{message}</div>}

      {/* ── EDIT FORM ── */}
      {editing && (
        <div className="panel" style={{ marginBottom: "24px", border: "1.5px solid var(--purple)" }}>
          <div className="panel-header">
            <h2 className="panel-title">{isNew ? "Create New Plan" : `Edit: ${editing.name}`}</h2>
          </div>

          <div className="plan-form-grid">
            <div>
              <label className="field-label">Key (unique, lowercase)</label>
              <input className="training-input" value={editing.key} disabled={!isNew}
                placeholder="e.g. pro" onChange={(e) => setField("key", e.target.value)} />

              <label className="field-label">Display Name</label>
              <input className="training-input" value={editing.name}
                placeholder="e.g. Pro" onChange={(e) => setField("name", e.target.value)} />

              <label className="field-label">Description</label>
              <input className="training-input" value={editing.description}
                placeholder="e.g. For growing businesses" onChange={(e) => setField("description", e.target.value)} />

              <div className="checks-row">
                <label className="check-label">
                  <input type="checkbox" checked={editing.isFeatured}
                    onChange={(e) => setField("isFeatured", e.target.checked)} />
                  ⭐ Featured ("Most popular")
                </label>
                <label className="check-label">
                  <input type="checkbox" checked={editing.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)} />
                  👁️ Visible on landing page
                </label>
              </div>
            </div>

            <div>
              <label className="field-label">Prices per month</label>
              <div className="price-inputs">
                <div className="price-input-group">
                  <span className="price-symbol">£</span>
                  <input type="number" className="training-input price-num" value={editing.prices.gbp}
                    onChange={(e) => setField("prices.gbp", Number(e.target.value))} />
                </div>
                <div className="price-input-group">
                  <span className="price-symbol">€</span>
                  <input type="number" className="training-input price-num" value={editing.prices.eur}
                    onChange={(e) => setField("prices.eur", Number(e.target.value))} />
                </div>
                <div className="price-input-group">
                  <span className="price-symbol">$</span>
                  <input type="number" className="training-input price-num" value={editing.prices.usd}
                    onChange={(e) => setField("prices.usd", Number(e.target.value))} />
                </div>
              </div>

              <label className="field-label">Limits (-1 = unlimited)</label>
              <div className="limits-row">
                <div>
                  <span className="limit-label">Chatbots</span>
                  <input type="number" className="training-input price-num" value={editing.limits.chatbots}
                    onChange={(e) => setField("limits.chatbots", Number(e.target.value))} />
                </div>
                <div>
                  <span className="limit-label">Convs/month</span>
                  <input type="number" className="training-input price-num" value={editing.limits.conversationsPerMonth}
                    onChange={(e) => setField("limits.conversationsPerMonth", Number(e.target.value))} />
                </div>
              </div>

              <div className="checks-row">
                <label className="check-label">
                  <input type="checkbox" checked={editing.limits.removeBranding}
                    onChange={(e) => setField("limits.removeBranding", e.target.checked)} />
                  Remove branding
                </label>
                <label className="check-label">
                  <input type="checkbox" checked={editing.limits.whiteLabel}
                    onChange={(e) => setField("limits.whiteLabel", e.target.checked)} />
                  White-label
                </label>
                <label className="check-label">
                  <input type="checkbox" checked={editing.limits.apiAccess}
                    onChange={(e) => setField("limits.apiAccess", e.target.checked)} />
                  API access
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="primary-btn" onClick={save} disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create Plan" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* ── PLANS LIST ── */}
      <div className="plans-cards">
        {plans.map((p) => (
          <div key={p._id} className={`plan-admin-card ${!p.isActive ? "plan-hidden" : ""}`}>
            <div className="plan-admin-top">
              <div>
                <span className="plan-admin-name">{p.name}</span>
                {p.isFeatured && <span className="badge badge-green" style={{ marginLeft: "8px" }}>⭐ Featured</span>}
                {!p.isActive && <span className="badge badge-red" style={{ marginLeft: "8px" }}>Hidden</span>}
              </div>
              <span className="plan-admin-key">{p.key}</span>
            </div>

            <div className="plan-admin-prices">
              <span>£{p.prices?.gbp ?? 0}</span>
              <span>€{p.prices?.eur ?? 0}</span>
              <span>${p.prices?.usd ?? 0}</span>
              <span className="muted">/mo</span>
            </div>

            <div className="plan-admin-limits">
              <div>🤖 {p.limits?.chatbots === -1 ? "Unlimited" : p.limits?.chatbots} chatbot(s)</div>
              <div>💬 {p.limits?.conversationsPerMonth === -1 ? "Unlimited" : p.limits?.conversationsPerMonth} convs/mo</div>
              {p.limits?.removeBranding && <div>✓ No branding</div>}
              {p.limits?.whiteLabel && <div>✓ White-label</div>}
              {p.limits?.apiAccess && <div>✓ API access</div>}
            </div>

            <div className="plan-admin-actions">
              <button className="expand-btn" onClick={() => startEdit(p)}>✏️ Edit</button>
              <button className="expand-btn" style={{ color: "#f87171" }} onClick={() => remove(p)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
