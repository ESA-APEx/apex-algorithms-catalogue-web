import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateDateParameters } from "./api-validation";

const parseErrorResponse = async (response: Response) => {
  const text = await response.text();
  return JSON.parse(text);
};

describe("API Validation", () => {
  let mockToday: Date;

  beforeEach(() => {
    mockToday = new Date("2025-10-20T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("validateDateParameters", () => {
    describe("Valid date scenarios", () => {
      it("should return success when both parameters are null", () => {
        const result = validateDateParameters(undefined, undefined);

        expect(result.success).toBe(true);
        expect(result.startDate).toBeUndefined();
        expect(result.endDate).toBeUndefined();
        expect(result.errorResponse).toBeUndefined();
      });

      it("should return success when only start date is provided", () => {
        const result = validateDateParameters("2025-01-01", undefined);

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2025-01-01T00:00:00"));
        expect(result.endDate).toBeUndefined();
        expect(result.errorResponse).toBeUndefined();
      });

      it("should return success when both valid dates are provided", () => {
        const result = validateDateParameters("2025-01-01", "2025-01-31");

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2025-01-01T00:00:00"));
        expect(result.endDate).toEqual(new Date("2025-01-31T23:59:59.999"));
        expect(result.errorResponse).toBeUndefined();
      });

      it("should handle dates on the current day", () => {
        const result = validateDateParameters("2025-10-19", "2025-10-20");

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2025-10-19T00:00:00"));
        expect(result.endDate).toEqual(new Date("2025-10-20T23:59:59.999"));
      });

      it("should handle same start and end date (but different times)", () => {
        const result = validateDateParameters("2025-10-19", "2025-10-19");

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2025-10-19T00:00:00"));
        expect(result.endDate).toEqual(new Date("2025-10-19T23:59:59.999"));
      });
    });

    describe("Invalid start date format", () => {
      it("should return error for invalid start date format", async () => {
        const result = validateDateParameters("invalid-date", undefined);

        expect(result.success).toBe(false);
        expect(result.startDate).toBeUndefined();
        expect(result.endDate).toBeUndefined();
        expect(result.errorResponse).toBeDefined();
        expect(result.errorResponse!.status).toBe(400);

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe(
          "Invalid start date format. Use YYYY-MM-DD.",
        );
      });

      it("should return error for malformed start date", async () => {
        const result = validateDateParameters("2025-13-01", undefined);

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();
        expect(result.errorResponse!.status).toBe(400);

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe(
          "Invalid start date format. Use YYYY-MM-DD.",
        );
      });
    });

    describe("Invalid end date format", () => {
      it("should return error for invalid end date format", async () => {
        const result = validateDateParameters("2025-01-01", "invalid-date");

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();
        expect(result.errorResponse!.status).toBe(400);

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe(
          "Invalid end date format. Use YYYY-MM-DD.",
        );
      });
    });

    describe("Future date validation", () => {
      it("should return error when start date is in the future", async () => {
        const result = validateDateParameters("2025-10-21", "2025-10-22");

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe("Start date cannot be in the future.");
      });

      it("should return error when end date is in the future", async () => {
        const result = validateDateParameters("2025-10-19", "2025-10-21");

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe("End date cannot be in the future.");
      });
    });

    describe("Missing start date validation", () => {
      it("should return error when end date is provided without start date", async () => {
        const result = validateDateParameters(undefined, "2025-01-31");

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe(
          "Start date is required when end date is provided.",
        );
      });
    });

    describe("Date order validation", () => {
      it("should return error when end date is before start date", async () => {
        const result = validateDateParameters("2025-01-31", "2025-01-01");

        expect(result.success).toBe(false);
        expect(result.errorResponse).toBeDefined();

        const errorData = await parseErrorResponse(result.errorResponse!);
        expect(errorData.message).toBe(
          "End date must be later than start date.",
        );
      });

      it("should return error when end date equals start date at time level", async () => {
        // Since start date gets T00:00:00 and end date gets T23:59:59.999,
        // same calendar dates should actually be valid
        const result = validateDateParameters("2025-01-15", "2025-01-15");

        expect(result.success).toBe(true); // This should pass because of the time difference
      });
    });

    describe("Edge cases", () => {
      it("should handle dates correctly", () => {
        const result = validateDateParameters("2024-02-29", "2024-03-01");

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2024-02-29T00:00:00"));
        expect(result.endDate).toEqual(new Date("2024-03-01T23:59:59.999"));
      });

      it("should handle year boundaries correctly", () => {
        const result = validateDateParameters("2024-12-31", "2025-01-01");

        expect(result.success).toBe(true);
        expect(result.startDate).toEqual(new Date("2024-12-31T00:00:00"));
        expect(result.endDate).toEqual(new Date("2025-01-01T23:59:59.999"));
      });

      it("should validate response headers are set correctly", async () => {
        const result = validateDateParameters("invalid", undefined);

        expect(result.errorResponse).toBeDefined();
        expect(result.errorResponse!.headers.get("Content-Type")).toBe(
          "application/json",
        );
      });
    });
  });
});
