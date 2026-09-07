import { useEffect, useState } from "react";
import { getLeaves, updateLeaveStatus } from "../api.js";

export default function LeaveList({ employees, hr }) {
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadLeaves() {
    setLoading(true);
    setMessage(null);
    try {
      const list = await getLeaves({ employee_id: employeeId, status });
      setLeaves(list);
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function changeStatus(id, newStatus) {
    setMessage(null);
    try {
      await updateLeaveStatus(id, newStatus, hr.token);
      setMessage({ type: "good", text: "Request number " + id + " is now " + newStatus });
      loadLeaves();
    } catch (err) {
      setMessage({ type: "bad", text: err.message });
    }
  }

  return (
    <div className="card">
      <h2>All leave requests</h2>

      {message ? <div className={"message " + message.type}>{message.text}</div> : null}

      <div className="row">
        <div className="field">
          <label>Filter by employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Everyone</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id}. {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Filter by status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="field">
          <label>&nbsp;</label>
          <button onClick={loadLeaves} disabled={loading}>
            {loading ? "Loading" : "Show results"}
          </button>
        </div>
      </div>

      {!hr ? (
        <p style={{ fontSize: "14px", color: "#666" }}>
          Only HR can approve or reject. Please open the HR Login tab to login first.
        </p>
      ) : null}

      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Employee</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            {hr ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={hr ? 7 : 6}>No leave requests found</td>
            </tr>
          ) : null}

          {leaves.map((leave) => (
            <tr key={leave.id}>
              <td>{leave.id}</td>
              <td>{leave.employee_name}</td>
              <td>{leave.leave_type}</td>
              <td>{String(leave.from_date).slice(0, 10)}</td>
              <td>{String(leave.to_date).slice(0, 10)}</td>
              <td>{leave.status}</td>
              {hr ? (
                <td>
                  {leave.status === "pending" ? (
                    <>
                      <button className="approve" onClick={() => changeStatus(leave.id, "approved")}>
                        Approve
                      </button>{" "}
                      <button className="reject" onClick={() => changeStatus(leave.id, "rejected")}>
                        Reject
                      </button>
                    </>
                  ) : (
                    "Already " + leave.status
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
