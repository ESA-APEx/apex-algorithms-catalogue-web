import { getDiscourseExternalId } from "../src/lib/discourse-external-id.mjs";

const DEFAULT_FORUM_URL = "https://forum.apex.esa.int";

const getForumOrigin = (forumUrl) => {
  const url = new URL(forumUrl || DEFAULT_FORUM_URL);
  if (url.protocol !== "https:") {
    throw new Error("FORUM_URL must use HTTPS");
  }
  return url.origin;
};

const MAX_RATE_LIMIT_RETRIES = 5;
const DEFAULT_RETRY_SECONDS = 60;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetrySeconds = (response, body) => {
  const seconds = Number(
    response.headers.get("Retry-After") ?? body.extras?.wait_seconds,
  );
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : DEFAULT_RETRY_SECONDS;
};

export const createDiscourseClient = ({
  apiKey,
  apiUsername,
  fetcher = fetch,
  forumUrl = process.env.FORUM_URL,
  sleep = wait,
}) => {
  const forumOrigin = getForumOrigin(forumUrl);
  const request = async (path, options = {}, attempt = 0) => {
    const { allowNotFound, ...requestOptions } = options;
    const url = new URL(path, forumOrigin);
    if (url.origin !== forumOrigin) {
      throw new Error("Discourse API returned an unexpected URL");
    }

    const response = await fetcher(url, {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        "Api-Key": apiKey,
        "Api-Username": apiUsername,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 404 && allowNotFound) {
        return null;
      }
      const body = await response.json().catch(() => ({}));
      if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
        const seconds = getRetrySeconds(response, body);
        console.log(`Discourse rate limit reached; retrying in ${seconds}s`);
        await sleep((seconds + 1) * 1000);
        return request(path, options, attempt + 1);
      }
      const details = Array.isArray(body.errors) ? `: ${body.errors.join("; ")}` : "";
      throw new Error(
        `Discourse API request ${requestOptions.method || "GET"} ${url.pathname} failed (${response.status})${details}`,
      );
    }

    return response.json();
  };

  return {
    findByExternalId: (externalId) =>
      request(`/t/external_id/${encodeURIComponent(externalId)}.json?include_raw=true`, {
        allowNotFound: true,
      }),
    getTopic: (topicId) => request(`/t/${topicId}.json`),
    createTopic: ({ title, externalId }, categoryId, raw) =>
      request("/posts.json", {
        method: "POST",
        body: JSON.stringify({
          title,
          raw,
          category: categoryId,
          external_id: externalId,
        }),
      }),
    updatePost: (postId, raw) =>
      request(`/posts/${postId}.json`, {
        method: "PUT",
        body: JSON.stringify({ post: { raw } }),
      }),
    updateTitle: (topicId, title) =>
      request(`/t/-/${topicId}.json`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      }),
    moveToCategory: (topicId, categoryId) =>
      request(`/t/-/${topicId}.json`, {
        method: "PUT",
        body: JSON.stringify({ category_id: categoryId }),
      }),
    archiveTopic: (topicId) =>
      request(`/t/${topicId}/status.json`, {
        method: "PUT",
        body: JSON.stringify({ status: "archived", enabled: "true" }),
      }),
    listCategoryTopics: async (categoryId) => {
      const topics = [];
      let path = `/c/${categoryId}.json`;
      const visited = new Set();

      while (path && !visited.has(path)) {
        visited.add(path);
        const category = await request(path);
        topics.push(...(category.topic_list?.topics || []));
        path = category.topic_list?.more_topics_url || "";
      }

      return topics;
    },
  };
};

const getTopicId = (topic) => topic?.id ?? topic?.topic_id;

// The suffix also keeps short service titles above Discourse's minimum title length.
export const getTopicTitle = (title) => `${title} - APEx Service Feedback`;

export const reconcileServiceTopics = async ({
  services,
  categoryId,
  catalogueBaseUrl,
  client,
}) => {
  const serviceIds = new Set(services.map(({ id }) => getDiscourseExternalId(id)));
  const topicIdsByServiceId = new Map();

  for (const service of services) {
    const externalId = getDiscourseExternalId(service.id);
    const title = getTopicTitle(service.title);
    const serviceUrl = new URL(
      `/apps/${encodeURIComponent(service.id)}`,
      catalogueBaseUrl,
    ).href;
    const raw = `${service.description}\n\n[Open service in the APEx Algorithm Catalogue](${serviceUrl})`;
    let topic = await client.findByExternalId(externalId);

    if (!topic) {
      try {
        topic = await client.createTopic({ title, externalId }, categoryId, raw);
      } catch (error) {
        throw new Error(`Failed to create topic for ${service.id}: ${error.message}`);
      }
    } else {
      const topicId = getTopicId(topic);
      if (topic.title !== title) {
        await client.updateTitle(topicId, title);
      }
      const firstPost = topic.post_stream?.posts?.find(
        ({ post_number }) => post_number === 1,
      );
      if (firstPost && firstPost.raw?.trim() !== raw.trim()) {
        await client.updatePost(firstPost.id, raw);
      }
      if (topic.category_id !== categoryId) {
        await client.moveToCategory(topicId, categoryId);
      }
    }

    const topicId = getTopicId(topic);
    if (!topicId) {
      throw new Error(`Discourse did not return a topic ID for ${service.id}`);
    }
    topicIdsByServiceId.set(externalId, topicId);
  }

  const archivedTopicIds = new Set();
  for (const listedTopic of await client.listCategoryTopics(categoryId)) {
    const topic =
      listedTopic.external_id !== undefined
        ? listedTopic
        : await client.getTopic(getTopicId(listedTopic));
    const externalId = topic.external_id;
    const isDuplicate =
      serviceIds.has(externalId) &&
      topicIdsByServiceId.get(externalId) !== getTopicId(topic);

    if (
      typeof externalId === "string" &&
      externalId.length > 0 &&
      (!serviceIds.has(externalId) || isDuplicate) &&
      !archivedTopicIds.has(getTopicId(topic))
    ) {
      await client.archiveTopic(getTopicId(topic));
      archivedTopicIds.add(getTopicId(topic));
    }
  }
};
