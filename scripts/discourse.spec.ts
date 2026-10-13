import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDiscourseClient,
  reconcileServiceTopics,
} from "./discourse.mjs";

afterEach(() => vi.unstubAllEnvs());

describe("Discourse feedback topic reconciliation", () => {
  it("creates topics, updates renamed topics, and archives removed topics", async () => {
    const client = {
      findByExternalId: vi.fn(async (id: string) =>
        id === "renamed" ? { id: 12, title: "Old name", category_id: 5 } : null,
      ),
      createTopic: vi.fn(async () => ({ topic_id: 13 })),
      updateTitle: vi.fn(),
      moveToCategory: vi.fn(),
      listCategoryTopics: vi.fn(async () => [{ id: 14 }]),
      getTopic: vi.fn(async () => ({ id: 14, external_id: "removed" })),
      archiveTopic: vi.fn(),
    };

    await reconcileServiceTopics({
      services: [
        { id: "renamed", title: "New name", description: "Description" },
        { id: "new", title: "New service", description: "Description" },
      ],
      categoryId: 5,
      catalogueBaseUrl: "https://catalogue.example",
      client,
    });

    expect(client.updateTitle).toHaveBeenCalledWith(12, "New name");
    expect(client.createTopic).toHaveBeenCalledWith(
      { id: "new", title: "New service", description: "Description" },
      5,
      "https://catalogue.example/apps/new",
    );
    expect(client.createTopic).toHaveBeenCalledTimes(1);
    expect(client.archiveTopic).toHaveBeenCalledWith(14);
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
      new URL("https://forum.example.org/t/external_id/service%2Fone.json"),
      expect.objectContaining({
        headers: expect.objectContaining({ "Api-Key": "unit-test-key" }),
      }),
    );
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
