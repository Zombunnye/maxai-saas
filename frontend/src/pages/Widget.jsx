import { useState } from "react";

export default function Widget({ user }) {
  const [copied, setCopied] = useState(false);

  // ─── WHY: tenantId се вгражда в embed кода, за да знае
  // backend-ът кой бизнес собственик получава leads-овете и разговорите.
  const tenantId = user?.tenantId || "YOUR_TENANT_ID";

  const embedCode = `<!-- MaxAI Chatbot Widget -->
<script>
  window.MAXAI_CONFIG = {
    tenantId: "${tenantId}",
    primaryColor: "#7c3aed",
    greeting: "Hi! How can I help you today?"
  };
</script>
<script src="https://cdn.maxai.app/widget.js" async></script>`;

  function copyCode() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Widget & Embed</h1>
          <p className="page-sub">Install the MaxAI chatbot on your website</p>
        </div>
      </div>

      <div className="widget-grid">
        {/* Step 1 */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Installation</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Copy the embed code</div>
                <div className="step-sub">Click the button below to copy your unique snippet</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Paste before <code>&lt;/body&gt;</code></div>
                <div className="step-sub">Add it to every page you want the chatbot to appear</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <div className="step-title">That's it!</div>
                <div className="step-sub">The chatbot appears automatically as a floating button</div>
              </div>
            </div>
          </div>

          <div className="code-block">
            <pre className="code-pre">{embedCode}</pre>
          </div>

          <button
            className={`primary-btn copy-btn ${copied ? "copied" : ""}`}
            onClick={copyCode}
          >
            {copied ? "✓ Copied!" : "Copy Embed Code"}
          </button>
        </div>

        {/* Info */}
        <div>
          <div className="panel info-panel">
            <h2 className="panel-title">Your Tenant ID</h2>
            <div className="tenant-id-box">{tenantId}</div>
            <p className="info-text">
              This ID uniquely identifies your account. All conversations and leads captured by your widget are stored under this ID.
            </p>
          </div>

          <div className="panel info-panel" style={{ marginTop: "20px" }}>
            <h2 className="panel-title">What the widget does</h2>
            <ul className="feature-list">
              <li>✅ AI-powered chat on your website</li>
              <li>✅ Captures visitor contact details as Leads</li>
              <li>✅ Logs every conversation to your dashboard</li>
              <li>✅ Works on any website — Wordpress, Wix, custom HTML</li>
              <li>✅ No coding required after installation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
