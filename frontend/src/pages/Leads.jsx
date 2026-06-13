import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/leads")
      .then((res) => setLeads(res.data.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading leads…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads CRM</h1>
          <p className="page-sub">{leads.length} leads captured from your chatbot</p>
        </div>
        <button className="primary-btn" onClick={() => {
          const csv = ["Name,Email,Phone,Message,Source,Date",
            ...leads.map(l => `${l.name},${l.email},${l.phone},${l.message},${l.source},${new Date(l.createdAt).toLocaleDateString()}`)
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "leads.csv"; a.click();
        }}>
          Export CSV ↓
        </button>
      </div>

      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state">No leads yet. Leads appear when visitors submit your chatbot widget form.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Source</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l._id}>
                  <td><strong>{l.name}</strong></td>
                  <td><a className="email-link" href={`mailto:${l.email}`}>{l.email}</a></td>
                  <td className="muted">{l.phone || "—"}</td>
                  <td className="truncate-cell muted">{l.message || "—"}</td>
                  <td><span className="badge badge-blue">{l.source}</span></td>
                  <td className="muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-green">New</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
