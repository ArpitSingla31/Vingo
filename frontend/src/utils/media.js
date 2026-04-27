import { serverUrl } from "../App";

export const normalizeMediaUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^blob:/i.test(value) || /^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value
    .replace(/\\/g, "/")
    .replace(/^\.?\/*/, "")
    .replace(/^backend\//, "");

  return `${serverUrl}/${normalizedPath}`;
};
