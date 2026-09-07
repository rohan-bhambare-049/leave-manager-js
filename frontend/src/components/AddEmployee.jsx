import { useState } from "react";
import { createEmployee } from "../api.js";

export default function AddEmployee({ onAdded }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const body = { name, department, email, role };
      if (password) {
        body.password = password;
      }

      const employee = await createEmployee(body);
      setMessage({ type: "good", text: "Employee saved. The new id is " + employee.id });
      setName("");
      setDepartment("");
      setEmail("");
      setRole("employee");
      setPassword("");
      if (onAdded) onAdded();
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>Add a new employee</h2>

      {message ? <div className={"message " + message.type}>{message.text}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohan" />
        </div>

        <div className="field">
          <label>Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Engineering"
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rohan@company.com"
          />
        </div>

        <div className="row">
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <div className="field">
            <label>Password (only needed if this person will login)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least six characters"
            />
          </div>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving" : "Save employee"}
        </button>
      </form>
    </div>
  );
}
