// ─── WHY: Sidebar е отделен компонент, защото се използва от App.jsx
// и трябва да знае кой page е активен за да оцвети правилния nav item.

const NAV = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "conversations", icon: "💬", label: "Conversations" },
  { id: "leads", icon: "👤", label: "Leads CRM" },
  { id: "widget", icon: "⚙️", label: "Widget & Embed" },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">M</div>
        <div>
          <div className="logo-name">MaxAI</div>
          <div className="logo-sub">AI Chatbot SaaS</div>
        </div>
      </div>

      <div className="sidebar-business">
        {user?.name || "My Account"}
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-pill">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-plan">Free Plan</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
