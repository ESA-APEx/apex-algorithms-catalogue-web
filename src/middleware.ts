import { defineMiddleware } from "astro/middleware";
import { getSession } from "auth-astro/server";
import { isFeatureEnabled } from "./lib/featureflag";

const protectedPaths = ["/api/admin/services/benchmarks.json", "/dashboard"];

/**
 * Check if the request is for an API endpoint
 */
function isApiRequest(url: string): boolean {
  return url.includes("/api/");
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!protectedPaths.some((path) => context.request.url.includes(path))) {
    return next();
  }

  if (
    import.meta.env.BASIC_AUTH_USERNAME &&
    import.meta.env.BASIC_AUTH_PASSWORD &&
    isFeatureEnabled(context.request.url, "basicAuth")
  ) {
    // Basic auth check
    const basicAuth = context.request.headers.get("authorization");
    if (basicAuth?.startsWith("Basic ")) {
      const authValue = basicAuth.split(" ")[1] ?? "username:password";
      const [username, pwd] = atob(authValue).split(":");
      if (
        username === import.meta.env.BASIC_AUTH_USERNAME &&
        pwd === import.meta.env.BASIC_AUTH_PASSWORD
      ) {
        return next();
      }

      return new Response("Auth required", {
        status: 401,
        headers: {
          "WWW-authenticate": 'Basic realm="Secure Area"',
        },
      });
    }
    return next();
  } else {
    // Keycloak auth check
    const session = await getSession(context.request);

    if (session?.user) {
      context.locals.user = {
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
        roles: session.user.roles || [],
      };
      return next();
    }

    const requestUrl = context.request.url;

    // For API requests, return 401
    if (isApiRequest(requestUrl)) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'Bearer realm="Protected Area", Basic realm="Secure Area"',
        },
      });
    }

    // For page requests, redirect directly to Keycloak login
    const keycloakLoginUrl = new URL("/auth/signin", context.url);
    keycloakLoginUrl.searchParams.set("callbackUrl", requestUrl);

    return Response.redirect(keycloakLoginUrl.toString(), 302);
  }
});
