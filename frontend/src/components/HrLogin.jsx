import { useState } from "react";
import { login } from "../api.js";

export default function HrLogin({ hr, onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    try {
      const data = await login(email, password);
      if (data.user.role !== "hr") {
        setMessage({ type: "bad", text: "This account is not an HR account" });
        return;
      }
      onLogin(data);
      setMessage({ type: "good", text: "Welcome " + data.user.name });
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    }
  }

  if (hr) {
    return (
      <div className="card">
        <h2>HR login</h2>
        <p>
          You are logged in as {hr.user.name} ({hr.user.email}). Now you can approve or reject leave
          requests in the All Leave Requests tab.
        </p>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>HR login</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        If you used the seed script then the HR email is hr@company.com and the password is hr12345
      </p>

      {message ? <div className={"message " + message.type}>{message.text}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hr@company.com" />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
