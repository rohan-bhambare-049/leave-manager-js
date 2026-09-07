// Test environment values. The real database is never used in tests,
// because the database file is mocked inside every test file.

process.env.JWT_SECRET = "test_secret_for_jest";
process.env.JWT_EXPIRES_IN = "1h";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DATABASE_SSL = "false";
process.env.NODE_ENV = "test";
