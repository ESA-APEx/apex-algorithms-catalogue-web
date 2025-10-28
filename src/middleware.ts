import { defineMiddleware } from "astro/middleware";

const protectedPaths = ["/api/admin/services/benchmarks.json", "/dashboard"];

export const onRequest = defineMiddleware((context, next) => {
  if (!protectedPaths.some((path) => context.request.url.includes(path))) {
    return next();
  }

  const basicAuth = context.request.headers.get("authorization");
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1] ?? "username:password";
    const [username, pwd] = atob(authValue).split(":");
    if (
      username === import.meta.env.BASIC_AUTH_USERNAME &&
      pwd === import.meta.env.BASIC_AUTH_PASSWORD
    ) {
      return next();
    }
  }

  return new Response("Auth required", {
    status: 401,
    headers: {
      "WWW-authenticate": 'Basic realm="Secure Area"',
    },
  });
});
