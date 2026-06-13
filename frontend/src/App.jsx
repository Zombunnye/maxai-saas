import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Leads from "./pages/Leads";
import Widget from "./pages/Widget";
import Sidebar from "./components/Sidebar";
import "./App.css";

// ─── WHY: Използваме прост string state за routing вместо react-router-dom,
// за да не добавяме нова зависимост. Приложението е single-tenant dashboard
// без дълбоко URL нестване — прост state е достатъчен.

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [authView, setAuthView] = useState("login"); // "login" | "register"

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("maxai_user");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(userData) {
    setUser(userData);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("maxai_token");
    localStorage.removeItem("maxai_user");
    setUser(null);
    setAuthView("login");
  }

  // Auth screens
  if (!user) {
    return authView === "login" ? (
      <Login onLogin={handleLogin} onSwitch={() => setAuthView("register")} />
    ) : (
      <Register onSuccess={() => setAuthView("login")} onSwitch={() => setAuthView("login")} />
    );
  }

  // Page map
  const pages = {
    dashboard: <Dashboard user={user} />,
    conversations: <Conversations />,
    leads: <Leads />,
    widget: <Widget user={user} />,
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}
