// Tests for the employee endpoints.
// The database is mocked, so these tests run without a real PostgreSQL.

jest.mock("../src/config/db");

const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

beforeEach(() => {
  db.query.mockReset();
});

describe("POST /employees", () => {
  test("creates an employee and returns 201", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          name: "Rohan Roy",
          department: "Engineering",
          email: "rohan@company.com",
          role: "employee",
          created_at: "2026-09-07T10:00:00.000Z",
        },
      ],
    });

    const res = await request(app).post("/employees").send({
      name: "Rohan Roy",
      department: "Engineering",
      email: "rohan@company.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.email).toBe("rohan@company.com");
    // the password hash should never come back in the response
    expect(res.body.password_hash).toBeUndefined();
  });

  test("returns 400 when the name is missing", async () => {
    const res = await request(app).post("/employees").send({
      department: "Engineering",
      email: "rohan@company.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("name is required");
    expect(db.query).not.toHaveBeenCalled();
  });

  test("returns 400 when the email is not a real email", async () => {
    const res = await request(app).post("/employees").send({
      name: "Rohan Roy",
      department: "Engineering",
      email: "rohan_at_company",
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("email must be a valid email address");
  });

  test("returns 409 when the email is already used", async () => {
    const duplicateError = new Error("duplicate key value violates unique constraint");
    duplicateError.code = "23505";
    db.query.mockRejectedValueOnce(duplicateError);

    const res = await request(app).post("/employees").send({
      name: "Rohan Roy",
      department: "Engineering",
      email: "rohan@company.com",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });
});

describe("GET /employees/:id", () => {
  test("returns 404 when the employee does not exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/employees/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Employee not found");
  });
});

describe("Unknown route", () => {
  test("returns 404 for a route that does not exist", async () => {
    const res = await request(app).get("/something-else");
    expect(res.status).toBe(404);
  });
});
