import { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [convs, setConvs] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/tenants"),
        ]);
        setStats(statsRes.data.stats);
        setTenants(tenantsRes.data.tenants || []);
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleTenant(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    // ─── WHY: Зареждаме разговорите lazy — само при отваряне,
    // не наведнъж за всички tenants (би било бавно).
    if (!convs[id]) {
      try {
        const res = await api.get(`/admin/tenants/${id}/conversations`);
        setConvs((c) => ({ ...c, [id]: res.data.conversations || [] }));
      } catch (err) {
        console.error(err);
      }
    }
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
                    <td><span className={`badge ${t.plan === "free" ? "badge-blue" : "badge-green"}`}>{t.plan.toUpperCase()}</span></td>
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
