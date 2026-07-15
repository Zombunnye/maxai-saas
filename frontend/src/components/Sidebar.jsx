// ─── WHY: Admin Panel се показва САМО ако user.role === "admin".
// Обикновените клиенти изобщо не виждат тази опция.

const NAV = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "conversations", icon: "💬", label: "Conversations" },
  { id: "leads", icon: "👤", label: "Leads CRM" },
  { id: "training", icon: "🎓", label: "Bot Training" },
  { id: "widget", icon: "⚙️", label: "Widget & Embed" },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  const navItems = [...NAV];

  if (user?.role === "admin") {
    navItems.push({ id: "admin", icon: "👑", label: "Admin Panel" });
  }

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
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""} ${item.id === "admin" ? "nav-admin" : ""}`}
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
            <div className="user-plan">{user?.role === "admin" ? "👑 Admin" : "Free Plan"}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
