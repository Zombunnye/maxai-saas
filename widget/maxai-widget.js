(function () {
  // ─── CONFIG ────────────────────────────────────────────────────────────────
  // Клиентът конфигурира само тези три реда в своя сайт:
  //   window.MAXAI_CONFIG = { tenantId: "...", primaryColor: "#7c3aed", greeting: "Hi!" };
  const cfg = window.MAXAI_CONFIG || {};
  const TENANT_ID    = cfg.tenantId    || "demo";
  const COLOR        = cfg.primaryColor|| "#7c3aed";
  const GREETING     = cfg.greeting    || "Hello! How can I help you today?";
  const API_URL = cfg.apiUrl || "https://maxai-saas-production.up.railway.app";
 
  // Уникален ID за посетителя — пазим го в sessionStorage
  let visitorId = sessionStorage.getItem("maxai_vid");
  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem("maxai_vid", visitorId);
  }
 
  // ─── STYLES ────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.innerHTML = `
    #maxai-btn {
      position: fixed; right: 24px; bottom: 24px;
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: ${COLOR}; color: white; font-size: 24px;
      cursor: pointer; box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      z-index: 999999; transition: transform 0.2s;
    }
    #maxai-btn:hover { transform: scale(1.08); }
 
    #maxai-win {
      position: fixed; right: 24px; bottom: 96px;
      width: 360px; height: 520px;
      background: white; border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
 
    #maxai-head {
      padding: 16px 18px;
      background: ${COLOR}; color: white;
    }
    #maxai-head h3 { margin: 0; font-size: 16px; font-weight: 700; }
    #maxai-head p  { margin: 3px 0 0; font-size: 12px; opacity: 0.85; }
 
    #maxai-msgs {
      flex: 1; padding: 14px; overflow-y: auto;
      background: #f8fafc; display: flex; flex-direction: column; gap: 8px;
    }
 
    .mx-msg {
      max-width: 80%; padding: 9px 13px; border-radius: 14px;
      font-size: 13.5px; line-height: 1.45;
    }
    .mx-bot  { background: white; border: 1px solid #e2e8f0; color: #0f172a; align-self: flex-start; border-bottom-left-radius: 4px; }
    .mx-user { background: ${COLOR}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .mx-typing { color: #94a3b8; font-style: italic; font-size: 13px; }
 
    #maxai-bar {
      display: flex; gap: 8px; padding: 10px 12px;
      border-top: 1px solid #e2e8f0; background: white;
    }
    #maxai-inp {
      flex: 1; border: 1px solid #cbd5e1; border-radius: 999px;
      padding: 9px 14px; font-size: 13.5px; outline: none;
      transition: border-color 0.15s;
    }
    #maxai-inp:focus { border-color: ${COLOR}; }
    #maxai-snd {
      border: none; border-radius: 999px; padding: 9px 16px;
      background: ${COLOR}; color: white; cursor: pointer; font-size: 13px; font-weight: 600;
    }
 
    .mx-lead-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; align-self: flex-start; max-width: 90%; }
    .mx-lead-wrap strong { font-size: 13px; color: #0f172a; }
    .mx-lead-inp {
      width: 100%; margin-top: 8px; padding: 8px 10px;
      border: 1px solid #cbd5e1; border-radius: 8px;
      font-size: 13px; outline: none;
    }
    .mx-lead-inp:focus { border-color: ${COLOR}; }
    .mx-lead-btn {
      width: 100%; margin-top: 10px; padding: 9px;
      border: none; border-radius: 8px;
      background: ${COLOR}; color: white; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    #maxai-powered {
      text-align: center; font-size: 10px; color: #cbd5e1;
      padding: 4px 0 6px; background: white;
    }
    #maxai-powered a { color: #cbd5e1; text-decoration: none; }
  `;
  document.head.appendChild(style);
 
  // ─── HTML ──────────────────────────────────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "maxai-btn";
  btn.innerHTML = "💬";
 
  const win = document.createElement("div");
  win.id = "maxai-win";
  win.innerHTML = `
    <div id="maxai-head">
      <h3>AI Assistant</h3>
      <p>● Online · Replies instantly</p>
    </div>
    <div id="maxai-msgs"></div>
    <div id="maxai-bar">
      <input id="maxai-inp" placeholder="Type a message…" autocomplete="off" />
      <button id="maxai-snd">Send</button>
    </div>
    <div id="maxai-powered">Powered by <a href="https://maxai.app" target="_blank">MaxAI</a></div>
  `;
 
  document.body.appendChild(win);
  document.body.appendChild(btn);
 
  const msgs  = document.getElementById("maxai-msgs");
  const inp   = document.getElementById("maxai-inp");
  const snd   = document.getElementById("maxai-snd");
 
  // ─── HELPERS ───────────────────────────────────────────────────────────────
  function addMsg(text, type) {
    const d = document.createElement("div");
    d.className = "mx-msg mx-" + type;
    d.innerText = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
 
  function removeTyping() {
    const t = msgs.querySelector(".mx-typing");
    if (t) t.remove();
  }
 
  // ─── LEAD FORM ─────────────────────────────────────────────────────────────
  let leadShown = false;
 
  function shouldShowLead(text) {
    if (leadShown) return false;
    const t = text.toLowerCase();
    return ["price", "cost", "quote", "contact", "help", "interested", "buy", "demo"].some(k => t.includes(k));
  }
 
  function showLeadForm() {
    leadShown = true;
    const wrap = document.createElement("div");
    wrap.className = "mx-lead-wrap";
    wrap.innerHTML = `
      <strong>Want us to follow up with you?</strong>
      <input class="mx-lead-inp" id="ml-name"  placeholder="Your name" />
      <input class="mx-lead-inp" id="ml-email" placeholder="Your email" type="email" />
      <input class="mx-lead-inp" id="ml-phone" placeholder="Phone (optional)" />
      <button class="mx-lead-btn" id="ml-submit">Send my details</button>
    `;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
 
    document.getElementById("ml-submit").addEventListener("click", async () => {
      const name  = document.getElementById("ml-name").value.trim();
      const email = document.getElementById("ml-email").value.trim();
      const phone = document.getElementById("ml-phone").value.trim();
 
      if (!name || !email) {
        alert("Please enter your name and email."); return;
      }
 
      try {
        // ─── WHY: tenantId в body-то — backend-ът знае към кой клиент да запише lead-а
        await fetch(`${API_URL}/api/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId: TENANT_ID, name, email, phone, source: "widget" })
        });
        wrap.remove();
        addMsg("Thanks! We'll be in touch soon. 👋", "bot");
      } catch {
        addMsg("Could not save your details. Please try again.", "bot");
      }
    });
  }
 
  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────
  async function send() {
    const text = inp.value.trim();
    if (!text) return;
 
    addMsg(text, "user");
    inp.value = "";
 
    const typing = addMsg("Typing…", "bot");
    typing.classList.add("mx-typing");
 
    try {
      // ─── WHY: /api/chatbot/message е публичен endpoint — не изисква JWT.
      // tenantId идва от конфига за да изолираме разговорите по клиент.
      const res = await fetch(`${API_URL}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: TENANT_ID, visitorId, message: text })
      });
 
      removeTyping();
 
      const data = await res.json();
      addMsg(data.aiReply || "Sorry, could not reply.", "bot");
 
      if (shouldShowLead(text)) showLeadForm();
 
    } catch {
      removeTyping();
      addMsg("Connection error. Please try again.", "bot");
    }
  }
 
  // ─── EVENTS ────────────────────────────────────────────────────────────────
  btn.addEventListener("click", () => {
    const open = win.style.display === "flex";
    win.style.display = open ? "none" : "flex";
    btn.innerHTML = open ? "💬" : "✕";
    if (!open && msgs.children.length === 0) addMsg(GREETING, "bot");
  });
 
  snd.addEventListener("click", send);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
 
})();