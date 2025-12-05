import { defineMiddleware } from "astro/middleware";
import { getSession } from "auth-astro/server";
import { config as authConfig } from "../auth.config";
import { isFeatureEnabled } from "./lib/featureflag";

const protectedPaths = ["/api/admin/services/benchmarks.json", "/dashboard"];

/**
 * Check if the request is for an API endpoint
 */
function isApiRequest(url: string): boolean {
  return url.includes("/api/");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = context.request.url;
  const apiRequest = isApiRequest(requestUrl);

  if (!protectedPaths.some((path) => requestUrl.includes(path))) {
    return next();
  }

  if (
    import.meta.env.BASIC_AUTH_USERNAME &&
    import.meta.env.BASIC_AUTH_PASSWORD &&
    isFeatureEnabled(requestUrl, "basicAuth")
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
    try {
      const session = await getSession(context.request, authConfig);

      if (session?.user) {
        context.locals.user = {
          name: session.user.name,
          username: session.user.username,
          email: session.user.email,
          roles: session.user.roles || [],
        };

        // TODO: allow for more generic role
        if (context.locals.user.roles?.includes("administrator")) {
          return next();
        }

        if (apiRequest) {
          return new Response("Forbidden", { status: 403 });
        }

        const notFoundUrl = new URL("/404", context.url);
        return Response.redirect(notFoundUrl.toString(), 302);
      }

      if (apiRequest) {
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
    } catch (error: any) {
      console.error("Middleware error:", error);

      return new Response(
        JSON.stringify({
          error: error.message || "Internal Server Error",
          stack: error.stack,
          trace: error.toString(),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }
});
