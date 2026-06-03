export const storage = {
  getItem<T>(key: string, fallback: T): T {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  },
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};
