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

export function resolveImageUrlsFromMarkdown(text: string, algorithmId: string) {
    const imagePattern = /!\[.*?\]\((\.?\.?\/?\S+)\.(jpg|jpeg|png|gif|bmp|svg|webp)\)/gi;

    return text.replace(imagePattern, (_, path, extension) => {
        const normalizedPath = path.replace('.', '').replace('/', '');
        const url = new URL(`${algorithmId}_files/${normalizedPath}.${extension}`, `${BASE_IMAGE_DESCRIPTION_URL}`).href;
        return `![${normalizedPath}](${url})`;
    })
}