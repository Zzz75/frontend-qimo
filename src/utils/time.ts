export const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();
