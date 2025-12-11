import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_PATH } from "@/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const locale = new Intl.DateTimeFormat("en", options);
  return locale.format(new Date(date));
}

export function removeStripes(str: string) {
  return str.replaceAll(/[-_]/gi, " ");
}

export function linkTo(slug: string, basePath: string = BASE_PATH) {
  if (["", "/"].includes(basePath)) {
    return slug ? slug : "/";
  }
  return `${basePath}/${slug}`;
}

export function generateUniqueOptions(arr: string[]) {
  return arr
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((label) => ({
      label: label,
      value: label,
    }));
}

export function formatNumber(value: number | null, decimals: number = 2) {
  if (value === null || value === undefined) return "N/A";
  if (value === 0) return "0";
  if (value < 0.01 && value > 0) return "< 0.01";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
