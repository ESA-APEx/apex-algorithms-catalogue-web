import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedbackTopic } from "./discourse";

afterEach(() => vi.unstubAllEnvs());

describe("getFeedbackTopic", () => {
  it("looks up a topic by service ID and returns its reply count", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ id: 42, slug: "service-feedback", reply_count: 3 }),
        { status: 200 },
      ),
    );

    await expect(getFeedbackTopic("service/one", fetcher)).resolves.toEqual({
      url: "https://forum.apex.esa.int/t/service-feedback/42",
      replyCount: 3,
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://forum.apex.esa.int/t/external_id/service%2Fone.json",
    );
  });

  it("returns no topic when Discourse cannot find the service ID", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getFeedbackTopic("missing-service", fetcher)).resolves.toBeUndefined();
  });

  it("uses the configured forum URL for lookups and topic links", async () => {
    vi.stubEnv("FORUM_URL", "https://forum.example.org/");
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ id: 42, slug: "service-feedback", reply_count: 0 }),
        { status: 200 },
      ),
    );

    await expect(
      getFeedbackTopic("service", fetcher),
    ).resolves.toEqual({
      url: "https://forum.example.org/t/service-feedback/42",
      replyCount: 0,
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://forum.example.org/t/external_id/service.json",
    );
  });
});
