import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Conversations() {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/conversations")
      .then((res) => setConvs(res.data.conversations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = convs.filter(
    (c) =>
      c.userMessage?.toLowerCase().includes(search.toLowerCase()) ||
      c.visitorId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading conversations…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conversations</h1>
          <p className="page-sub">{convs.length} total conversations</p>
        </div>
      </div>

      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="Search by visitor or message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state">No conversations found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>User Message</th>
                <th>AI Reply</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td><span className="visitor-tag">{c.visitorId}</span></td>
                  <td className="truncate-cell">{c.userMessage}</td>
                  <td className="truncate-cell muted">{c.aiReply}</td>
                  <td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
