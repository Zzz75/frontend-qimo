/**
 * 时间格式化工具
 */

// 把毫秒时间戳转成用户本地习惯的日期时间字符串，例如 "2026/6/13 14:30:00"
export const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();
