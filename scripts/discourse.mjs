const DEFAULT_FORUM_URL = "https://forum.apex.esa.int";

const getForumOrigin = (forumUrl) => {
  const url = new URL(forumUrl || DEFAULT_FORUM_URL);
  if (url.protocol !== "https:") {
    throw new Error("FORUM_URL must use HTTPS");
  }
  return url.origin;
};

export const createDiscourseClient = ({
  apiKey,
  apiUsername,
  fetcher = fetch,
  forumUrl = process.env.FORUM_URL,
}) => {
  const forumOrigin = getForumOrigin(forumUrl);
  const request = async (path, options = {}) => {
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
      throw new Error(`Discourse API request failed (${response.status})`);
    }

    return response.json();
  };

  return {
    findByExternalId: (externalId) =>
      request(`/t/external_id/${encodeURIComponent(externalId)}.json`, {
        allowNotFound: true,
      }),
    getTopic: (topicId) => request(`/t/${topicId}.json`),
    createTopic: (service, categoryId, serviceUrl) =>
      request("/posts.json", {
        method: "POST",
        body: JSON.stringify({
          title: service.title,
          raw: `${service.description}\n\n[Open service in the APEx Algorithm Catalogue](${serviceUrl})`,
          category: categoryId,
          external_id: service.id,
        }),
      }),
    updateTitle: (topicId, title) =>
      request(`/t/${topicId}.json`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      }),
    moveToCategory: (topicId, categoryId) =>
      request(`/t/${topicId}/move-to-category.json`, {
        method: "PUT",
        body: JSON.stringify({ category_id: categoryId }),
      }),
    archiveTopic: (topicId) =>
      request(`/t/${topicId}/archive.json`, { method: "PUT" }),
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

export const reconcileServiceTopics = async ({
  services,
  categoryId,
  catalogueBaseUrl,
  client,
}) => {
  const serviceIds = new Set(services.map(({ id }) => id));
  const topicIdsByServiceId = new Map();

  for (const service of services) {
    let topic = await client.findByExternalId(service.id);

    if (!topic) {
      const serviceUrl = new URL(
        `/apps/${encodeURIComponent(service.id)}`,
        catalogueBaseUrl,
      ).href;
      topic = await client.createTopic(service, categoryId, serviceUrl);
    } else {
      const topicId = getTopicId(topic);
      if (topic.title !== service.title) {
        await client.updateTitle(topicId, service.title);
      }
      if (topic.category_id !== categoryId) {
        await client.moveToCategory(topicId, categoryId);
      }
    }

    const topicId = getTopicId(topic);
    if (!topicId) {
      throw new Error(`Discourse did not return a topic ID for ${service.id}`);
    }
    topicIdsByServiceId.set(service.id, topicId);
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
