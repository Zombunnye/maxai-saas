import { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [convs, setConvs] = useState({});
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [statsRes, tenantsRes, plansRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/tenants"),
        api.get("/plans/all"),
      ]);
      setStats(statsRes.data.stats);
      setTenants(tenantsRes.data.tenants || []);
      setPlans(plansRes.data.plans || []);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleTenant(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!convs[id]) {
      try {
        const res = await api.get(`/admin/tenants/${id}/conversations`);
        setConvs((c) => ({ ...c, [id]: res.data.conversations || [] }));
      } catch (err) { console.error(err); }
    }
  }

  // ─── WHY: Директна смяна на план от dropdown-а — без модали,
  // без излишни стъпки. Избираш → записва се → refresh на списъка.
  async function changePlan(tenantId, newPlan) {
    try {
      const res = await api.put(`/admin/tenants/${tenantId}/plan`, { plan: newPlan });
      setMessage("✅ " + res.data.message);
      load();
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Failed to change plan"));
    }
    setTimeout(() => setMessage(""), 4000);
  }

  if (loading) return <div className="page-loading">Loading admin panel…</div>;

  const statCards = [
    { label: "Total Businesses", value: stats?.totalTenants ?? 0, color: "#7c3aed" },
    { label: "Total Conversations", value: stats?.totalConversations ?? 0, color: "#0ea5e9" },
    { label: "Total Leads", value: stats?.totalLeads ?? 0, color: "#059669" },
    { label: "Last 7 Days", value: stats?.recentConversations ?? 0, color: "#f59e0b" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👑 Admin Panel</h1>
          <p className="page-sub">Platform overview — all registered businesses</p>
        </div>
      </div>

      {message && <div className="plans-message">{message}</div>}

      <div className="stat-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label} style={{ "--accent": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-glow" />
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Registered Businesses</h2>
          <span className="panel-count">{tenants.length} total</span>
        </div>

        {tenants.length === 0 ? (
          <div className="empty-state">No businesses registered yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Convs</th>
                <th>Leads</th>
                <th>Registered</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <>
                  <tr key={t.id}>
                    <td><strong>{t.businessName}</strong></td>
                    <td>
                      <div>{t.ownerName}</div>
                      <div className="muted" style={{ fontSize: "11px" }}>{t.ownerEmail}</div>
                    </td>
                    <td>
                      {/* ─── Dropdown за смяна на план ─── */}
                      <select
                        className="plan-select"
                        value={t.plan}
                        onChange={(e) => changePlan(t.id, e.target.value)}
                      >
                        {plans.map((p) => (
                          <option key={p.key} value={p.key}>{p.name} (£{p.prices?.gbp ?? 0})</option>
                        ))}
                      </select>
                    </td>
                    <td>{t.conversations}</td>
                    <td>{t.leads}</td>
                    <td className="muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge ${t.status === "active" ? "badge-green" : "badge-red"}`}>{t.status}</span></td>
                    <td>
                      <button className="expand-btn" onClick={() => toggleTenant(t.id)}>
                        {expanded === t.id ? "▲ Hide" : "▼ View chats"}
                      </button>
                    </td>
                  </tr>
                  {expanded === t.id && (
                    <tr key={t.id + "-detail"}>
                      <td colSpan={8} className="tenant-detail">
                        {!convs[t.id] ? (
                          <div className="muted" style={{ padding: "12px" }}>Loading…</div>
                        ) : convs[t.id].length === 0 ? (
                          <div className="muted" style={{ padding: "12px" }}>No conversations yet.</div>
                        ) : (
                          <div className="mini-convs">
                            {convs[t.id].slice(0, 10).map((c) => (
                              <div className="mini-conv" key={c._id}>
                                <div className="mini-conv-user">👤 {c.userMessage}</div>
                                <div className="mini-conv-ai">🤖 {c.aiReply}</div>
                                <div className="mini-conv-time">{new Date(c.createdAt).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
