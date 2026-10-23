import { getDiscourseExternalId } from "./discourse-external-id.mjs";

const DEFAULT_FORUM_URL = "https://forum.apex.esa.int";

const getForumOrigin = (forumUrl: string | undefined): string => {
  const url = new URL(forumUrl || DEFAULT_FORUM_URL);
  if (url.protocol !== "https:") {
    throw new Error("FORUM_URL must use HTTPS");
  }
  return url.origin;
};

export interface FeedbackTopic {
  url: string;
  replyCount: number;
}

export const getFeedbackTopic = async (
  serviceId: string,
  fetcher: typeof fetch = fetch,
  forumUrl = process.env.FORUM_URL,
): Promise<FeedbackTopic | undefined> => {
  const forumOrigin = getForumOrigin(forumUrl);
  try {
    const response = await fetcher(
      `${forumOrigin}/t/external_id/${encodeURIComponent(getDiscourseExternalId(serviceId))}.json`,
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
      url: `${forumOrigin}/t/${encodeURIComponent(topic.slug)}/${topic.id}`,
      replyCount: topic.reply_count,
    };
  } catch {
    return undefined;
  }
};
