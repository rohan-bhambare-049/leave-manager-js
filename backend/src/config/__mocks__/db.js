// Jest picks this file up when a test calls jest.mock("../src/config/db").
// It keeps the real PostgreSQL out of the tests.

module.exports = {
  query: jest.fn(),
  pool: { end: jest.fn() },
};
