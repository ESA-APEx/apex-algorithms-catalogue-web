import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDiscourseClient,
  reconcileServiceTopics,
} from "./discourse.mjs";
import { getDiscourseExternalId } from "../src/lib/discourse-external-id.mjs";

afterEach(() => vi.unstubAllEnvs());

describe("Discourse feedback topic reconciliation", () => {
  it("creates topics, updates renamed topics, and archives removed topics", async () => {
    const client = {
      findByExternalId: vi.fn(async (id: string) =>
        id === "renamed"
          ? {
              id: 12,
              title: "Old name",
              category_id: 5,
              post_stream: {
                posts: [{ id: 120, post_number: 1, raw: "Old description" }],
              },
            }
          : null,
      ),
      createTopic: vi.fn(async () => ({ topic_id: 13 })),
      updateTitle: vi.fn(),
      updatePost: vi.fn(),
      moveToCategory: vi.fn(),
      listCategoryTopics: vi.fn(async () => [{ id: 14 }]),
      getTopic: vi.fn(async () => ({ id: 14, external_id: "removed" })),
      archiveTopic: vi.fn(),
    };

    await reconcileServiceTopics({
      services: [
        { id: "renamed", title: "New service name", description: "Description" },
        { id: "new", title: "Brand new service", description: "Description" },
      ],
      categoryId: 5,
      catalogueBaseUrl: "https://catalogue.example",
      client,
    });

    expect(client.updateTitle).toHaveBeenCalledWith(
      12,
      "New service name - APEx Service Feedback",
    );
    expect(client.updatePost).toHaveBeenCalledWith(
      120,
      "Description\n\n[Open service in the APEx Algorithm Catalogue](https://catalogue.example/apps/renamed)",
    );
    expect(client.createTopic).toHaveBeenCalledWith(
      {
        title: "Brand new service - APEx Service Feedback",
        externalId: "new",
      },
      5,
      "Description\n\n[Open service in the APEx Algorithm Catalogue](https://catalogue.example/apps/new)",
    );
    expect(client.createTopic).toHaveBeenCalledTimes(1);
    expect(client.archiveTopic).toHaveBeenCalledWith(14);
  });

  it("does not update unchanged titles or descriptions", async () => {
    const client = {
      findByExternalId: vi.fn(async () => ({
        id: 1,
        title: "FORCE L2 - APEx Service Feedback",
        category_id: 5,
        post_stream: {
          posts: [
            {
              id: 10,
              post_number: 1,
              raw: "Description\n\n[Open service in the APEx Algorithm Catalogue](https://catalogue.example/apps/force)",
            },
          ],
        },
      })),
      updateTitle: vi.fn(),
      updatePost: vi.fn(),
      listCategoryTopics: vi.fn(async () => []),
    };

    await reconcileServiceTopics({
      services: [{ id: "force", title: "FORCE L2", description: "Description" }],
      categoryId: 5,
      catalogueBaseUrl: "https://catalogue.example",
      client,
    });

    expect(client.updateTitle).not.toHaveBeenCalled();
    expect(client.updatePost).not.toHaveBeenCalled();
  });

  it("shortens service IDs longer than Discourse's external ID limit", async () => {
    const longId = "RAMONA-herbaceous_rangeland_biomass-country-mosaick";
    const client = {
      findByExternalId: vi.fn(async () => null),
      createTopic: vi.fn(async () => ({ topic_id: 1 })),
      listCategoryTopics: vi.fn(async () => []),
    };

    await reconcileServiceTopics({
      services: [{ id: longId, title: "RAMONA biomass", description: "" }],
      categoryId: 5,
      catalogueBaseUrl: "https://catalogue.example",
      client,
    });

    const externalId = getDiscourseExternalId(longId);
    expect(externalId).toHaveLength(50);
    expect(externalId).toMatch(/^[\w-]+$/);
    expect(externalId).not.toBe(getDiscourseExternalId(`${longId}-2`));
    expect(client.findByExternalId).toHaveBeenCalledWith(externalId);
    expect(client.createTopic).toHaveBeenCalledWith(
      expect.objectContaining({ externalId }),
      5,
      expect.stringContaining(`/apps/${longId}`),
    );
  });

  it("uses the topic external ID lookup and keeps API credentials out of URLs", async () => {
    vi.stubEnv("FORUM_URL", "https://forum.example.org/");
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );
    const client = createDiscourseClient({
      apiKey: "unit-test-key",
      apiUsername: "bot",
      fetcher,
    });

    await client.findByExternalId("service/one");

    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://forum.example.org/t/external_id/service%2Fone.json?include_raw=true"),
      expect.objectContaining({
        headers: expect.objectContaining({ "Api-Key": "unit-test-key" }),
      }),
    );
  });

  it("waits and retries when Discourse rate limits a request", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ extras: { wait_seconds: 48 } }), {
          status: 429,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );
    const sleep = vi.fn(async () => {});
    const client = createDiscourseClient({
      apiKey: "unit-test-key",
      apiUsername: "bot",
      fetcher,
      sleep,
    });

    await expect(client.findByExternalId("service")).resolves.toEqual({ id: 1 });
    expect(sleep).toHaveBeenCalledWith(49_000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("rejects insecure forum URLs before making authenticated requests", () => {
    expect(() =>
      createDiscourseClient({
        apiKey: "unit-test-key",
        apiUsername: "bot",
        forumUrl: "http://forum.example.org",
      }),
    ).toThrow("FORUM_URL must use HTTPS");
  });
});
