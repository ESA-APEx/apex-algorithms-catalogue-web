import cookie from "cookie";

export function getCsrf(cookieString: string) {
  const cookies = cookie.parse(cookieString);

  return cookies["authjs.csrf-token"]?.split("|")[0];
}
