/**
 * CircuitBreaker Service
 * Prevents cascading latency by temporarily disabling failing providers.
 */
class CircuitBreaker {
  constructor() {
    this.providers = new Map();
    this.COOLDOWN_MS = 15 * 1000; // 15 seconds
    this.FAILURE_THRESHOLD = 3;
    this.TIME_WINDOW_MS = 60000; // 60 seconds
  }

  _getProviderState(provider) {
    if (!this.providers.has(provider)) {
      this.providers.set(provider, {
        status: 'HEALTHY', // HEALTHY, DEGRADED
        cooldownUntil: 0,
        failures: []
      });
    }
    return this.providers.get(provider);
  }

  _cleanOldFailures(state) {
    const windowStart = Date.now() - this.TIME_WINDOW_MS;
    state.failures = state.failures.filter(timestamp => timestamp > windowStart);
  }

  recordFailure(provider) {
    const state = this._getProviderState(provider);
    state.failures.push(Date.now());
    this._cleanOldFailures(state);

    if (state.failures.length >= this.FAILURE_THRESHOLD) {
      console.warn(`[CircuitBreaker] Provider ${provider} tripped. Status: DEGRADED. Cooldown: 15s`);
      state.status = 'DEGRADED';
      state.cooldownUntil = Date.now() + this.COOLDOWN_MS;
    }
  }

  recordSuccess(provider) {
    const state = this._getProviderState(provider);
    if (state.status === 'DEGRADED') {
      state.status = 'HEALTHY';
      state.cooldownUntil = 0;
      state.failures = [];
    }
  }

  isAvailable(provider) {
    const state = this._getProviderState(provider);
    if (state.status === 'DEGRADED') {
      if (Date.now() > state.cooldownUntil) {
        // Cooldown expired, transition to half-open/healthy
        state.status = 'HEALTHY';
        state.failures = [];
        return true;
      }
      return false; // Still degraded
    }
    return true; // Healthy
  }
}

export default new CircuitBreaker();
