import { useState } from "react";
import { getSummary } from "../api.js";

export default function LeaveSummary({ employees }) {
  const [employeeId, setEmployeeId] = useState("");
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadSummary() {
    setMessage(null);
    setSummary(null);

    if (!employeeId) {
      setMessage({ type: "bad", text: "Please pick an employee first" });
      return;
    }

    try {
      const data = await getSummary(employeeId);
      setSummary(data);
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    }
  }

  const types = summary ? Object.keys(summary.by_type) : [];

  return (
    <div className="card">
      <h2>Leave summary</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        This shows the total approved leave days of one person, grouped by the type of leave.
      </p>

      {message ? <div className={"message " + message.type}>{message.text}</div> : null}

      <div className="row">
        <div className="field">
          <label>Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Choose an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id}. {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>&nbsp;</label>
          <button onClick={loadSummary}>Show summary</button>
        </div>
      </div>

      {summary ? (
        <div>
          <h3>
            {summary.employee_name} has taken {summary.total_days} approved leave days in total
          </h3>

          <table>
            <thead>
              <tr>
                <th>Leave type</th>
                <th>Number of requests</th>
                <th>Total days</th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 ? (
                <tr>
                  <td colSpan={3}>No approved leaves yet</td>
                </tr>
              ) : null}

              {types.map((type) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{summary.by_type[type].total_requests}</td>
                  <td>{summary.by_type[type].total_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
