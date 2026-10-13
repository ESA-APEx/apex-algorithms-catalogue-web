const FORUM_URL = "https://forum.apex.esa.int";

export interface FeedbackTopic {
  url: string;
  replyCount: number;
}

export const getFeedbackTopic = async (
  serviceId: string,
  fetcher: typeof fetch = fetch,
): Promise<FeedbackTopic | undefined> => {
  try {
    const response = await fetcher(
      `${FORUM_URL}/t/external_id/${encodeURIComponent(serviceId)}.json`,
    );
    if (!response.ok) {
      return undefined;
    }

    const topic = await response.json();
    if (
      !Number.isInteger(topic.id) ||
      typeof topic.slug !== "string" ||
      !Number.isInteger(topic.reply_count) ||
      topic.reply_count < 0
    ) {
      return undefined;
    }

    return {
      url: `${FORUM_URL}/t/${encodeURIComponent(topic.slug)}/${topic.id}`,
      replyCount: topic.reply_count,
    };
  } catch {
    return undefined;
  }
};
