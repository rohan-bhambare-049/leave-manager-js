// Tests for the bonus login part.

jest.mock("../src/config/db");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const db = require("../src/config/db");

beforeEach(() => {
  db.query.mockReset();
});

describe("POST /auth/login", () => {
  test("gives back a token when the password is correct", async () => {
    const hash = await bcrypt.hash("hr12345", 10);
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 9,
          name: "Priya Sharma",
          department: "Human Resources",
          email: "hr@company.com",
          role: "hr",
          password_hash: hash,
        },
      ],
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "hr@company.com", password: "hr12345" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.role).toBe("hr");
  });

  test("returns 401 when the password is wrong", async () => {
    const hash = await bcrypt.hash("hr12345", 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 9, email: "hr@company.com", role: "hr", password_hash: hash }],
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "hr@company.com", password: "wrongpass" });

    expect(res.status).toBe(401);
  });

  test("returns 400 when the email is missing", async () => {
    const res = await request(app).post("/auth/login").send({ password: "hr12345" });
    expect(res.status).toBe(400);
  });
});
