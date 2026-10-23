import { createHash } from "node:crypto";

const MAX_EXTERNAL_ID_LENGTH = 50;
const HASH_LENGTH = 8;

/** @param {string} serviceId */
export const getDiscourseExternalId = (serviceId) => {
  if (serviceId.length <= MAX_EXTERNAL_ID_LENGTH) {
    return serviceId;
  }
  const hash = createHash("sha256").update(serviceId).digest("hex").slice(0, HASH_LENGTH);
  return `${serviceId.slice(0, MAX_EXTERNAL_ID_LENGTH - HASH_LENGTH - 1)}-${hash}`;
};
