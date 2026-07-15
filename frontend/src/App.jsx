import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Leads from "./pages/Leads";
import Widget from "./pages/Widget";
import BotTraining from "./pages/BotTraining";
import AdminPanel from "./pages/AdminPanel";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [authView, setAuthView] = useState("login");

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

  if (!user) {
    return authView === "login" ? (
      <Login onLogin={handleLogin} onSwitch={() => setAuthView("register")} />
    ) : (
      <Register onSuccess={() => setAuthView("login")} onSwitch={() => setAuthView("login")} />
    );
  }

  const pages = {
    dashboard: <Dashboard user={user} />,
    conversations: <Conversations />,
    leads: <Leads />,
    training: <BotTraining />,
    widget: <Widget user={user} />,
    admin: <AdminPanel />,
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
