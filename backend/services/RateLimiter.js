/**
 * RateLimiter Service
 * Provides an interface to track and enforce API rate limits.
 * Designed to be easily swappable with Redis in the future.
 */
class RateLimiter {
  constructor() {
    this.memoryStore = new Map();
  }

  _getProviderStore(provider) {
    if (!this.memoryStore.has(provider)) {
      this.memoryStore.set(provider, []);
    }
    return this.memoryStore.get(provider);
  }

  _cleanOldRequests(provider) {
    const store = this._getProviderStore(provider);
    const oneMinuteAgo = Date.now() - 60000;
    const cleaned = store.filter(timestamp => timestamp > oneMinuteAgo);
    this.memoryStore.set(provider, cleaned);
    return cleaned;
  }

  record(provider) {
    const store = this._getProviderStore(provider);
    store.push(Date.now());
  }

  recordMultiple(provider, count) {
    const store = this._getProviderStore(provider);
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      store.push(now);
    }
  }

  usage(provider) {
    const cleaned = this._cleanOldRequests(provider);
    return cleaned.length;
  }

  remaining(provider, limit) {
    const currentUsage = this.usage(provider);
    return Math.max(0, limit - currentUsage);
  }

  isAvailable(provider, limit, thresholdPercent = 0.8) {
    const currentUsage = this.usage(provider);
    const threshold = limit * thresholdPercent;
    return currentUsage < threshold;
  }
}

export default new RateLimiter();
