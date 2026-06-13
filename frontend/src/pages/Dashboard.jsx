import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [recentConvs, setRecentConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // ─── WHY: Правим двете заявки паралелно с Promise.all — по-бързо.
        const [dashRes, convRes] = await Promise.all([
          api.get("/dashboard/overview"),
          api.get("/conversations"),
        ]);
        setStats(dashRes.data.stats);
        setRecentConvs((convRes.data.conversations || []).slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  const statCards = [
    { label: "Total Conversations", value: stats?.totalConversations ?? 0, sub: "All time", color: "#7c3aed" },
    { label: "Leads Captured", value: stats?.totalLeads ?? 0, sub: "From widget", color: "#059669" },
    { label: "Last 7 Days", value: stats?.recentConversations ?? 0, sub: "Conversations", color: "#0ea5e9" },
    { label: "Current Plan", value: stats?.plan?.toUpperCase() ?? "FREE", sub: "Upgrade anytime", color: "#f59e0b" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, {user?.name} · {stats?.businessName}</p>
        </div>
        <button className="primary-btn">Upgrade Plan ↗</button>
      </div>

      <div className="stat-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label} style={{ "--accent": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
            <div className="stat-glow" />
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Recent Conversations</h2>
          <span className="panel-count">{recentConvs.length} shown</span>
        </div>

        {recentConvs.length === 0 ? (
          <div className="empty-state">
            No conversations yet. Install the widget to start capturing chats.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Message</th>
                <th>AI Reply</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentConvs.map((c) => (
                <tr key={c._id}>
                  <td><span className="visitor-tag">{c.visitorId}</span></td>
                  <td className="truncate-cell">{c.userMessage}</td>
                  <td className="truncate-cell muted">{c.aiReply}</td>
                  <td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
