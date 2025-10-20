import { describe, it, expect, vi } from "vitest";
import {
  cn,
  getDate,
  removeStripes,
  linkTo,
  generateUniqueOptions,
} from "./utils";

// Mock BASE_PATH for linkTo tests
vi.mock("@/config", () => ({
  BASE_PATH: "/base-path",
}));

describe("Utility Functions", () => {
  describe("cn (Classname Merger)", () => {
    it("should merge class names correctly", () => {
      expect(cn("text-red-500", "font-bold")).toBe("text-red-500 font-bold");
    });

    it("should remove duplicate class names", () => {
      expect(cn("text-red-500", "text-red-500")).toBe("text-red-500");
    });

    it("should handle conditional class names", () => {
      expect(cn("text-red-500", false && "font-bold")).toBe("text-red-500");
    });

    it("should work with tailwind-merge to resolve conflicting classes", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500"); // tailwind-merge prioritizes the last one
    });
  });

  describe("getDate (Date Formatter)", () => {
    it("should format date correctly", () => {
      expect(getDate("2024-02-27")).toBe("February 27, 2024");
    });

    it("should handle different date inputs", () => {
      expect(getDate("2000-01-01")).toBe("January 1, 2000");
    });
  });

  describe("removeStripes (String Formatter)", () => {
    it("should replace hyphens with spaces", () => {
      expect(removeStripes("hello-world")).toBe("hello world");
    });

    it("should replace underscores with spaces", () => {
      expect(removeStripes("hello_world")).toBe("hello world");
    });

    it("should replace both hyphens and underscores", () => {
      expect(removeStripes("hello-world_test")).toBe("hello world test");
    });

    it("should return the same string if no hyphens or underscores are found", () => {
      expect(removeStripes("hello world")).toBe("hello world");
    });
  });

  describe("linkTo (Slug Generator)", () => {
    it("should generate correct link using BASE_PATH", () => {
      expect(linkTo("about-us")).toBe("/base-path/about-us");
    });

    it("should handle empty slug", () => {
      expect(linkTo("")).toBe("/base-path/");
    });

    it("should handle slashes in slug correctly", () => {
      expect(linkTo("blog/post-1")).toBe("/base-path/blog/post-1");
    });
  });

  describe("generateUniqueOptions (Unique Array Mapper)", () => {
    it("should return an array of unique options", () => {
      const input = ["apple", "banana", "apple", "orange"];
      const expected = [
        { label: "apple", value: "apple" },
        { label: "banana", value: "banana" },
        { label: "orange", value: "orange" },
      ];
      expect(generateUniqueOptions(input)).toEqual(expected);
    });

    it("should return an empty array if input is empty", () => {
      expect(generateUniqueOptions([])).toEqual([]);
    });

    it("should handle an array with all unique values", () => {
      const input = ["car", "bike", "bus"];
      const expected = [
        { label: "bike", value: "bike" },
        { label: "bus", value: "bus" },
        { label: "car", value: "car" },
      ];
      expect(generateUniqueOptions(input)).toEqual(expected);
    });

    it("should be case-sensitive when checking uniqueness", () => {
      const input = ["Apple", "apple", "Banana", "banana"];
      const expected = [
        { label: "Apple", value: "Apple" },
        { label: "apple", value: "apple" },
        { label: "Banana", value: "Banana" },
        { label: "banana", value: "banana" },
      ];
      expect(generateUniqueOptions(input)).toEqual(expected);
    });
  });
});
