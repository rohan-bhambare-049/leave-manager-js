import { useEffect, useState } from "react";
import AddEmployee from "./components/AddEmployee.jsx";
import ApplyLeave from "./components/ApplyLeave.jsx";
import LeaveList from "./components/LeaveList.jsx";
import LeaveSummary from "./components/LeaveSummary.jsx";
import HrLogin from "./components/HrLogin.jsx";
import { getEmployees } from "./api.js";

export default function App() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [hr, setHr] = useState(null);
  const [loadError, setLoadError] = useState("");

  // Load the employee list once when the page opens.
  async function loadEmployees() {
    try {
      const list = await getEmployees();
      setEmployees(list);
      setLoadError("");
    } catch (err) {
      setLoadError("Could not reach the server. Please start the backend and refresh.");
    }
  }

  useEffect(() => {
    loadEmployees();
    const savedHr = localStorage.getItem("hr");
    if (savedHr) {
      setHr(JSON.parse(savedHr));
    }
  }, []);

  function handleLogin(data) {
    setHr(data);
    localStorage.setItem("hr", JSON.stringify(data));
  }

  function handleLogout() {
    setHr(null);
    localStorage.removeItem("hr");
  }

  return (
    <div className="page">
      <h1 className="title">Online Free Leave Manager</h1>
      <p className="subtitle">A small app to add employees, apply for leaves and let HR approve them</p>

      {loadError ? <div className="message bad">{loadError}</div> : null}

      <div className="tabs">
        <button
          className={tab === "employees" ? "tab active" : "tab"}
          onClick={() => setTab("employees")}
        >
          Add Employee
        </button>
        <button
          className={tab === "apply" ? "tab active" : "tab"}
          onClick={() => setTab("apply")}
        >
          Apply For Leave
        </button>
        <button className={tab === "list" ? "tab active" : "tab"} onClick={() => setTab("list")}>
          All Leave Requests
        </button>
        <button
          className={tab === "summary" ? "tab active" : "tab"}
          onClick={() => setTab("summary")}
        >
          Leave Summary
        </button>
        <button className={tab === "hr" ? "tab active" : "tab"} onClick={() => setTab("hr")}>
          HR Login
        </button>
      </div>

      {tab === "employees" ? <AddEmployee onAdded={loadEmployees} /> : null}
      {tab === "apply" ? <ApplyLeave employees={employees} /> : null}
      {tab === "list" ? <LeaveList employees={employees} hr={hr} /> : null}
      {tab === "summary" ? <LeaveSummary employees={employees} /> : null}
      {tab === "hr" ? <HrLogin hr={hr} onLogin={handleLogin} onLogout={handleLogout} /> : null}

      <p className="footer">Made only for Demo Purpose</p>
    </div>
  );
}
