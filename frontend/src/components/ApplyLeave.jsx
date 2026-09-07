import { useState } from "react";
import { createLeave } from "../api.js";

export default function ApplyLeave({ employees }) {
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (!employeeId) {
      setMessage({ type: "bad", text: "Please pick an employee first" });
      return;
    }

    setSaving(true);
    try {
      const leave = await createLeave({
        employee_id: Number(employeeId),
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason,
      });
      setMessage({
        type: "good",
        text: "Leave request sent. Request id is " + leave.id + " and the status is pending",
      });
      setFromDate("");
      setToDate("");
      setReason("");
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>Apply for a leave</h2>

      {message ? <div className={"message " + message.type}>{message.text}</div> : null}

      <form onSubmit={handleSubmit}>
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
            <label>Type of leave</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>From date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="field">
            <label>To date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Reason (you can keep this empty)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Family function at home"
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Sending" : "Send leave request"}
        </button>
      </form>
    </div>
  );
}
