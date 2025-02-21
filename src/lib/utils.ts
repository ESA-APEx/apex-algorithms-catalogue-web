import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_PATH, BASE_IMAGE_DESCRIPTION_URL } from "../config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const locale = new Intl.DateTimeFormat('en', options)
  return locale.format(new Date(date))
}

export function removeStripes(str: string) {
  return str.replaceAll(/[-_]/gi, " ");
}

export function linkTo(slug: string) {
  return `${BASE_PATH}/${slug}`;
}

export function generateUniqueOptions(arr: string[]) {
  return arr.filter((value, index, arr) => arr.indexOf(value) === index)
    .map(label => ({
        label: label,
        value: label,
    }))
}
