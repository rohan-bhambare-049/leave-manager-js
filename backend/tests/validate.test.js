// Plain unit tests for the validation helpers.

const {
  isValidEmail,
  isValidDate,
  validateLeaveInput,
  validateStatusInput,
} = require("../src/utils/validate");
const { countDays } = require("../src/services/leave.service");

describe("validation helpers", () => {
  test("accepts a normal email and rejects a broken one", () => {
    expect(isValidEmail("rohan@company.com")).toBe(true);
    expect(isValidEmail("rohan@@company")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  test("accepts only YYYY-MM-DD dates", () => {
    expect(isValidDate("2026-09-07")).toBe(true);
    expect(isValidDate("07/09/2026")).toBe(false);
  });

  test("collects every problem in the leave input", () => {
    const errors = validateLeaveInput({});
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  test("only approved and rejected are allowed as a new status", () => {
    expect(validateStatusInput({ status: "approved" })).toHaveLength(0);
    expect(validateStatusInput({ status: "pending" })).toHaveLength(1);
  });
});

describe("countDays", () => {
  test("counts both the first and the last day", () => {
    expect(countDays("2026-09-10", "2026-09-12")).toBe(3);
    expect(countDays("2026-09-10", "2026-09-10")).toBe(1);
  });
});
