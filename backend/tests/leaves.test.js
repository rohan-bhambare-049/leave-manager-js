// Tests for the leave endpoints, including the HR only rule.

jest.mock("../src/config/db");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const db = require("../src/config/db");

const hrToken = jwt.sign({ id: 9, email: "hr@company.com", role: "hr" }, process.env.JWT_SECRET);
const employeeToken = jwt.sign(
  { id: 1, email: "rohan@company.com", role: "employee" },
  process.env.JWT_SECRET
);

const employeeRow = {
  id: 1,
  name: "Rohan Roy",
  department: "Engineering",
  email: "rohan@company.com",
  role: "employee",
};

beforeEach(() => {
  db.query.mockReset();
});

describe("POST /leaves", () => {
  test("creates a leave request and returns 201", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [employeeRow] }) // employee exists
      .mockResolvedValueOnce({ rows: [] }) // no clashing leave
      .mockResolvedValueOnce({
        rows: [
          {
            id: 5,
            employee_id: 1,
            leave_type: "casual",
            from_date: "2026-09-10",
            to_date: "2026-09-12",
            status: "pending",
          },
        ],
      });

    const res = await request(app).post("/leaves").send({
      employee_id: 1,
      leave_type: "casual",
      from_date: "2026-09-10",
      to_date: "2026-09-12",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  test("returns 400 when to_date is before from_date", async () => {
    const res = await request(app).post("/leaves").send({
      employee_id: 1,
      leave_type: "casual",
      from_date: "2026-09-12",
      to_date: "2026-09-10",
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("to_date cannot be before from_date");
  });

  test("returns 400 when the leave type is not allowed", async () => {
    const res = await request(app).post("/leaves").send({
      employee_id: 1,
      leave_type: "vacation",
      from_date: "2026-09-10",
      to_date: "2026-09-11",
    });

    expect(res.status).toBe(400);
  });

  test("returns 404 when the employee does not exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/leaves").send({
      employee_id: 404,
      leave_type: "sick",
      from_date: "2026-09-10",
      to_date: "2026-09-11",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Employee not found");
  });

  test("returns 409 when the dates clash with an older request", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [employeeRow] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 3,
            employee_id: 1,
            status: "pending",
            from_date: "2026-09-09",
            to_date: "2026-09-11",
          },
        ],
      });

    const res = await request(app).post("/leaves").send({
      employee_id: 1,
      leave_type: "casual",
      from_date: "2026-09-10",
      to_date: "2026-09-12",
    });

    expect(res.status).toBe(409);
  });
});

describe("GET /leaves", () => {
  test("passes both filters to the database", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/leaves?employee_id=1&status=approved");

    expect(res.status).toBe(200);
    const params = db.query.mock.calls[0][1];
    expect(params).toEqual([1, "approved"]);
  });

  test("returns 400 when the status filter is wrong", async () => {
    const res = await request(app).get("/leaves?status=cancelled");
    expect(res.status).toBe(400);
  });
});

describe("PATCH /leaves/:id/status", () => {
  test("returns 401 when there is no token", async () => {
    const res = await request(app).patch("/leaves/5/status").send({ status: "approved" });
    expect(res.status).toBe(401);
  });

  test("returns 403 when a normal employee tries to approve", async () => {
    const res = await request(app)
      .patch("/leaves/5/status")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
  });

  test("lets HR approve a pending request", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5, employee_id: 1, status: "pending" }] })
      .mockResolvedValueOnce({ rows: [{ id: 5, employee_id: 1, status: "approved" }] });

    const res = await request(app)
      .patch("/leaves/5/status")
      .set("Authorization", `Bearer ${hrToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  test("returns 400 when the status value is wrong", async () => {
    const res = await request(app)
      .patch("/leaves/5/status")
      .set("Authorization", `Bearer ${hrToken}`)
      .send({ status: "maybe" });

    expect(res.status).toBe(400);
  });

  test("returns 409 when the request was already approved", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5, employee_id: 1, status: "approved" }] });

    const res = await request(app)
      .patch("/leaves/5/status")
      .set("Authorization", `Bearer ${hrToken}`)
      .send({ status: "rejected" });

    expect(res.status).toBe(409);
  });
});

describe("GET /leaves/summary/:employee_id", () => {
  test("adds up the approved days for every leave type", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [employeeRow] })
      .mockResolvedValueOnce({
        rows: [
          { leave_type: "casual", total_requests: 2, total_days: 5 },
          { leave_type: "sick", total_requests: 1, total_days: 2 },
        ],
      });

    const res = await request(app).get("/leaves/summary/1");

    expect(res.status).toBe(200);
    expect(res.body.total_days).toBe(7);
    expect(res.body.by_type.casual.total_days).toBe(5);
    expect(res.body.by_type.sick.total_requests).toBe(1);
  });

  test("returns 404 when the employee does not exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/leaves/summary/777");

    expect(res.status).toBe(404);
  });
});
