// All the calls to the backend are written here in one file,
// so the components stay short and easy to read.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function callApi(path, options = {}) {
  const { headers, ...restOptions } = options;
  const response = await fetch(BASE_URL + path, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.error || data.message)) || "Something went wrong";
    const details = data && data.details ? " : " + data.details.join(", ") : "";
    throw new Error(message + details);
  }

  return data;
}

export function getEmployees() {
  return callApi("/employees");
}

export function createEmployee(body) {
  return callApi("/employees", { method: "POST", body: JSON.stringify(body) });
}

export function createLeave(body) {
  return callApi("/leaves", { method: "POST", body: JSON.stringify(body) });
}

export function getLeaves(filters) {
  const params = new URLSearchParams();
  if (filters.employee_id) params.append("employee_id", filters.employee_id);
  if (filters.status) params.append("status", filters.status);

  const query = params.toString();
  return callApi("/leaves" + (query ? "?" + query : ""));
}

export function updateLeaveStatus(id, status, token) {
  return callApi("/leaves/" + id + "/status", {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
    body: JSON.stringify({ status }),
  });
}

export function getSummary(employeeId) {
  return callApi("/leaves/summary/" + employeeId);
}

export function login(email, password) {
  return callApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
