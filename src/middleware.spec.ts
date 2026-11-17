import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "auth-astro/server";
import { onRequest } from "./middleware";

vi.mock("auth-astro/server", () => ({ getSession: vi.fn() }));
vi.mock("../auth.config", () => ({ config: {} }));
vi.mock("./lib/featureflag", () => ({ isFeatureEnabled: () => true }));

describe("middleware environment configuration", () => {
  beforeEach(() => {
    vi.stubEnv("BASIC_AUTH_USERNAME", "test-user");
    vi.stubEnv("BASIC_AUTH_PASSWORD", "test-password");
    vi.mocked(getSession).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  const requestDashboard = async (password: string) => {
    const request = new Request("https://example.com/dashboard", {
      headers: {
        authorization: `Basic ${btoa(`test-user:${password}`)}`,
      },
    });
    const context = {
      request,
      url: new URL(request.url),
    } as Parameters<typeof onRequest>[0];
    const next = vi.fn().mockResolvedValue(new Response("Dashboard"));
    const response = await onRequest(context, next);
    return { response, next };
  };

  it("accepts Basic Auth credentials from the server environment", async () => {
    const { response, next } = await requestDashboard("test-password");

    expect(next).toHaveBeenCalledOnce();
    expect(response?.status).toBe(200);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("reads updated runtime credentials instead of build-time values", async () => {
    process.env.BASIC_AUTH_PASSWORD = "runtime-password";

    const { response, next } = await requestDashboard("runtime-password");

    expect(next).toHaveBeenCalledOnce();
    expect(response?.status).toBe(200);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("rejects credentials that do not match the server environment", async () => {
    const { response, next } = await requestDashboard("wrong-password");

    expect(next).not.toHaveBeenCalled();
    expect(response?.status).toBe(401);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("uses session authentication when Basic Auth is not configured", async () => {
    vi.stubEnv("BASIC_AUTH_USERNAME", undefined);
    vi.stubEnv("BASIC_AUTH_PASSWORD", undefined);

    const { response, next } = await requestDashboard("test-password");

    expect(next).not.toHaveBeenCalled();
    expect(getSession).toHaveBeenCalledOnce();
    expect(response?.status).toBe(302);
    expect(response?.headers.get("location")).toContain("/auth/signin");
  });
});