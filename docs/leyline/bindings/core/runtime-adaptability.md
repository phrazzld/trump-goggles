---
id: runtime-adaptability
last_modified: '2025-06-02'
derived_from: adaptability-and-reversibility
enforced_by: 'Configuration management, runtime monitoring, adaptive systems'
---

# Binding: Enable Runtime System Adaptation

Design systems that can modify their behavior, performance characteristics, and resource allocation dynamically in response to changing conditions without requiring restarts or deployments. This enables real-time adaptation to load, failures, and environmental changes.

## Rationale

This binding implements our adaptability and reversibility tenet by creating systems that can respond intelligently to changing conditions in real-time. Modern applications face dynamic environments where user load fluctuates, external services have varying availability, and business requirements change rapidly. Systems that can adapt their behavior at runtime are more resilient, efficient, and capable of maintaining quality service under varying conditions.

Think of runtime adaptability like a skilled driver navigating changing road conditions. When traffic gets heavy, they slow down and change lanes. When weather conditions deteriorate, they adjust their driving style and route. When road construction appears, they take alternate paths. The driver doesn't need to stop the car, reprogram their GPS, and restart the journey—they adapt continuously while moving. Similarly, adaptive software systems should adjust their behavior in response to changing conditions without interrupting service.

Static systems that cannot adapt at runtime become bottlenecks and failure points. When conditions change, static systems either maintain suboptimal behavior (like continuing to make expensive operations during high load) or fail catastrophically (like overwhelming databases when external services are slow). Adaptive systems prevent these problems by continuously adjusting their behavior to maintain optimal performance and reliability.

## Rule Definition

Runtime adaptability must implement these dynamic principles:

- **Configuration Hot-Reloading**: Support updating configuration values at runtime without requiring application restarts or service interruptions.

- **Dynamic Resource Allocation**: Automatically adjust resource usage (connections, threads, memory) based on current system load and available resources.

- **Circuit Breaker Patterns**: Implement circuit breakers that can dynamically adjust timeout thresholds, failure rates, and fallback strategies based on service health.

- **Adaptive Rate Limiting**: Use rate limiting that adjusts limits based on system capacity, user behavior patterns, and resource availability.

- **Load-Based Behavior Changes**: Modify processing algorithms, caching strategies, and service priorities based on current system load and performance metrics.

- **Health-Based Routing**: Dynamically route requests based on real-time health and performance metrics of downstream services.

**Adaptation Triggers:**
- System performance metrics (CPU, memory, latency)
- External service availability and response times
- User traffic patterns and request volumes
- Error rates and failure patterns
- Business rule changes and operational requirements

**Adaptation Mechanisms:**
- Dynamic configuration updates
- Algorithm selection based on conditions
- Resource pool resizing
- Caching strategy modifications
- Retry policy adjustments

## Practical Implementation

1. **Implement Configuration Watchers**: Create systems that watch for configuration changes and apply them immediately without requiring application restarts.

2. **Use Adaptive Algorithms**: Implement algorithms that can adjust their behavior based on current system state, such as adaptive caching eviction policies or dynamic thread pool sizing.

3. **Create Health-Based Decisions**: Build decision-making systems that consider real-time health metrics when determining how to process requests or allocate resources.

4. **Design Graceful Degradation**: Implement systems that can automatically reduce functionality or quality to maintain essential services under stress.

5. **Monitor and React**: Create comprehensive monitoring systems that can trigger automatic adaptations based on predefined thresholds and conditions.

## Examples

```typescript
// ❌ BAD: Static configuration and fixed behavior
class ApiService {
  private readonly maxConnections = 100;    // Fixed pool size
  private readonly timeout = 5000;          // Fixed 5 second timeout
  private readonly retryAttempts = 3;       // Fixed retry count
  private readonly cacheSize = 1000;        // Fixed cache size

  async makeRequest(endpoint: string): Promise<any> {
    // Fixed timeout regardless of system load
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal
      });

      if (!response.ok) {
        // Fixed retry logic regardless of error type or system state
        for (let i = 0; i < this.retryAttempts; i++) {
          await this.sleep(1000); // Fixed 1 second delay
          const retryResponse = await fetch(endpoint);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        throw new Error('Request failed after retries');
      }

      return response.json();
    } catch (error) {
      // No adaptation based on error patterns
      throw error;
    }
  }

  // Fixed caching strategy regardless of memory pressure or usage patterns
  private cache = new Map<string, any>();

  getCachedData(key: string): any {
    return this.cache.get(key);
  }

  setCachedData(key: string, value: any): void {
    if (this.cache.size >= this.cacheSize) {
      // Fixed eviction - remove first item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// ✅ GOOD: Runtime adaptive system with dynamic behavior
interface AdaptiveConfiguration {
  connections: {
    min: number;
    max: number;
    target: number;
  };
  timeouts: {
    base: number;
    max: number;
    current: number;
  };
  retries: {
    maxAttempts: number;
    backoffMultiplier: number;
    circuitBreakerThreshold: number;
  };
  cache: {
    maxSize: number;
    evictionStrategy: 'lru' | 'lfu' | 'adaptive';
    ttl: number;
  };
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
}

interface ServiceHealth {
  isHealthy: boolean;
  averageLatency: number;
  errorRate: number;
  lastFailure?: Date;
}

class AdaptiveApiService {
  private config: AdaptiveConfiguration;
  private connectionPool: ConnectionPool;
  private circuitBreaker: CircuitBreaker;
  private adaptiveCache: AdaptiveCache;
  private metricsCollector: MetricsCollector;
  private configWatcher: ConfigurationWatcher;

  constructor(initialConfig: AdaptiveConfiguration) {
    this.config = { ...initialConfig };
    this.connectionPool = new AdaptiveConnectionPool(this.config.connections);
    this.circuitBreaker = new AdaptiveCircuitBreaker(this.config.retries);
    this.adaptiveCache = new AdaptiveCache(this.config.cache);
    this.metricsCollector = new MetricsCollector();
    this.configWatcher = new ConfigurationWatcher();

    this.startAdaptationLoop();
    this.watchConfigurationChanges();
  }

  async makeRequest(endpoint: string): Promise<any> {
    // Get current system metrics for adaptation
    const metrics = await this.metricsCollector.getCurrentMetrics();
    const serviceHealth = await this.getServiceHealth(endpoint);

    // Adapt timeout based on current conditions
    const adaptiveTimeout = this.calculateAdaptiveTimeout(metrics, serviceHealth);

    // Use circuit breaker with adaptive thresholds
    return this.circuitBreaker.execute(async () => {
      const connection = await this.connectionPool.acquire();

      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), adaptiveTimeout);

        const response = await fetch(endpoint, {
          signal: controller.signal
        });

        // Update metrics for future adaptations
        this.metricsCollector.recordRequest(endpoint, response.status, Date.now());

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } finally {
        this.connectionPool.release(connection);
      }
    });
  }

  private calculateAdaptiveTimeout(metrics: SystemMetrics, health: ServiceHealth): number {
    let timeout = this.config.timeouts.base;

    // Increase timeout if system is under load
    if (metrics.cpuUsage > 0.8) {
      timeout *= 1.5;
    }

    // Increase timeout if service is showing high latency
    if (health.averageLatency > 1000) {
      timeout *= 1.3;
    }

    // Decrease timeout if system is healthy and fast
    if (metrics.cpuUsage < 0.3 && health.averageLatency < 200) {
      timeout *= 0.8;
    }

    // Ensure timeout stays within bounds
    return Math.min(Math.max(timeout, this.config.timeouts.base), this.config.timeouts.max);
  }

  private async getServiceHealth(endpoint: string): Promise<ServiceHealth> {
    const recent = await this.metricsCollector.getRecentMetrics(endpoint, 5 * 60 * 1000); // Last 5 minutes

    const errorRate = recent.errors / Math.max(recent.total, 1);
    const averageLatency = recent.totalLatency / Math.max(recent.total, 1);

    return {
      isHealthy: errorRate < 0.05 && averageLatency < 2000,
      averageLatency,
      errorRate,
      lastFailure: recent.lastError
    };
  }

  private startAdaptationLoop(): void {
    setInterval(async () => {
      await this.adaptToCurrentConditions();
    }, 30000); // Adapt every 30 seconds
  }

  private async adaptToCurrentConditions(): Promise<void> {
    const metrics = await this.metricsCollector.getCurrentMetrics();

    // Adapt connection pool size based on load
    await this.adaptConnectionPool(metrics);

    // Adapt cache behavior based on memory pressure
    await this.adaptCacheStrategy(metrics);

    // Adapt circuit breaker thresholds based on error patterns
    await this.adaptCircuitBreaker(metrics);

    console.log('System adapted to current conditions', {
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      connections: this.connectionPool.getCurrentSize(),
      cacheSize: this.adaptiveCache.getCurrentSize()
    });
  }

  private async adaptConnectionPool(metrics: SystemMetrics): Promise<void> {
    const targetConnections = this.calculateOptimalConnections(metrics);
    await this.connectionPool.adjustSize(targetConnections);
  }

  private calculateOptimalConnections(metrics: SystemMetrics): number {
    const { min, max } = this.config.connections;

    // Base calculation on current load
    let optimal = Math.ceil(metrics.requestsPerSecond / 10); // 10 RPS per connection

    // Adjust based on system resources
    if (metrics.cpuUsage > 0.8) {
      optimal *= 0.8; // Reduce connections under CPU pressure
    }

    if (metrics.memoryUsage > 0.8) {
      optimal *= 0.9; // Reduce connections under memory pressure
    }

    // Keep within bounds
    return Math.min(Math.max(optimal, min), max);
  }

  private async adaptCacheStrategy(metrics: SystemMetrics): Promise<void> {
    // Adapt cache size based on memory pressure
    if (metrics.memoryUsage > 0.9) {
      await this.adaptiveCache.reduceSize(0.7); // Reduce by 30%
      await this.adaptiveCache.setEvictionStrategy('aggressive');
    } else if (metrics.memoryUsage < 0.5) {
      await this.adaptiveCache.increaseSize(1.2); // Increase by 20%
      await this.adaptiveCache.setEvictionStrategy('conservative');
    }

    // Adapt TTL based on hit rates
    const hitRate = await this.adaptiveCache.getHitRate();
    if (hitRate < 0.5) {
      await this.adaptiveCache.increaseTTL(1.5); // Increase TTL for better hit rates
    } else if (hitRate > 0.9) {
      await this.adaptiveCache.decreaseTTL(0.8); // Decrease TTL to free memory
    }
  }

  private async adaptCircuitBreaker(metrics: SystemMetrics): Promise<void> {
    const errorRate = metrics.errorRate;

    // Adapt circuit breaker sensitivity based on error patterns
    if (errorRate > 0.1) {
      // High error rate - make circuit breaker more sensitive
      await this.circuitBreaker.setFailureThreshold(3);
      await this.circuitBreaker.setTimeout(60000); // 1 minute
    } else if (errorRate < 0.01) {
      // Low error rate - make circuit breaker less sensitive
      await this.circuitBreaker.setFailureThreshold(10);
      await this.circuitBreaker.setTimeout(30000); // 30 seconds
    }
  }

  private watchConfigurationChanges(): void {
    this.configWatcher.watch('api-service-config', async (newConfig: AdaptiveConfiguration) => {
      console.log('Configuration updated, applying changes...');

      // Hot-reload configuration without restart
      this.config = { ...newConfig };

      // Apply configuration changes to components
      await this.connectionPool.updateConfiguration(newConfig.connections);
      await this.adaptiveCache.updateConfiguration(newConfig.cache);
      await this.circuitBreaker.updateConfiguration(newConfig.retries);

      console.log('Configuration changes applied successfully');
    });
  }

  // Cached data access with adaptive behavior
  async getCachedData(key: string): Promise<any> {
    return this.adaptiveCache.get(key);
  }

  async setCachedData(key: string, value: any): Promise<void> {
    // Adaptive caching based on current memory pressure
    const metrics = await this.metricsCollector.getCurrentMetrics();

    if (metrics.memoryUsage > 0.9) {
      // High memory pressure - only cache small, frequently accessed items
      if (this.estimateSize(value) < 1024 && await this.isFrequentlyAccessed(key)) {
        await this.adaptiveCache.set(key, value, { priority: 'high' });
      }
    } else {
      // Normal operation - cache normally
      await this.adaptiveCache.set(key, value);
    }
  }
}

// Supporting adaptive components
class AdaptiveConnectionPool {
  private connections: Connection[] = [];
  private config: any;
  private activeConnections = 0;

  constructor(config: any) {
    this.config = config;
    this.initializePool();
  }

  async adjustSize(targetSize: number): Promise<void> {
    const currentSize = this.connections.length;

    if (targetSize > currentSize) {
      // Add connections
      for (let i = currentSize; i < targetSize; i++) {
        this.connections.push(await this.createConnection());
      }
    } else if (targetSize < currentSize) {
      // Remove connections (only idle ones)
      const toRemove = currentSize - targetSize;
      const idleConnections = this.connections.filter(c => !c.isActive);

      for (let i = 0; i < Math.min(toRemove, idleConnections.length); i++) {
        const connection = idleConnections[i];
        await connection.close();
        this.connections = this.connections.filter(c => c !== connection);
      }
    }
  }

  getCurrentSize(): number {
    return this.connections.length;
  }

  async acquire(): Promise<Connection> {
    const availableConnection = this.connections.find(c => !c.isActive);

    if (availableConnection) {
      availableConnection.isActive = true;
      this.activeConnections++;
      return availableConnection;
    }

    // No available connections - create new one if under limit
    if (this.connections.length < this.config.max) {
      const newConnection = await this.createConnection();
      newConnection.isActive = true;
      this.connections.push(newConnection);
      this.activeConnections++;
      return newConnection;
    }

    // Wait for available connection
    return this.waitForAvailableConnection();
  }

  release(connection: Connection): void {
    connection.isActive = false;
    this.activeConnections--;
  }
}

class AdaptiveCache {
  private cache = new Map<string, CacheEntry>();
  private config: any;
  private accessCounts = new Map<string, number>();
  private hitCount = 0;
  private missCount = 0;

  constructor(config: any) {
    this.config = config;
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);

    if (entry && !this.isExpired(entry)) {
      this.hitCount++;
      this.recordAccess(key);
      return entry.value;
    }

    this.missCount++;
    this.cache.delete(key);
    return null;
  }

  async set(key: string, value: any, options?: { priority?: 'high' | 'normal' }): Promise<void> {
    // Check if eviction is needed
    if (this.cache.size >= this.config.maxSize) {
      await this.evictEntries(options?.priority === 'high' ? 1 : Math.ceil(this.config.maxSize * 0.1));
    }

    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl,
      priority: options?.priority || 'normal'
    };

    this.cache.set(key, entry);
  }

  async reduceSize(factor: number): Promise<void> {
    const targetSize = Math.floor(this.cache.size * factor);
    const toEvict = this.cache.size - targetSize;

    if (toEvict > 0) {
      await this.evictEntries(toEvict);
    }
  }

  async setEvictionStrategy(strategy: 'aggressive' | 'conservative'): Promise<void> {
    this.config.evictionStrategy = strategy;
  }

  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  private async evictEntries(count: number): Promise<void> {
    const entries = Array.from(this.cache.entries());

    // Sort by access frequency and age for intelligent eviction
    entries.sort((a, b) => {
      const aAccess = this.accessCounts.get(a[0]) || 0;
      const bAccess = this.accessCounts.get(b[0]) || 0;
      const aAge = Date.now() - a[1].timestamp;
      const bAge = Date.now() - b[1].timestamp;

      // Evict less frequently accessed and older items first
      return (aAccess - bAccess) || (bAge - aAge);
    });

    for (let i = 0; i < count && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.accessCounts.delete(entries[i][0]);
    }
  }

  private recordAccess(key: string): void {
    this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'normal';
}

interface Connection {
  isActive: boolean;
  close(): Promise<void>;
}
```

## Related Bindings

- [feature-flag-management.md](../../docs/bindings/core/feature-flag-management.md): Feature flags are one mechanism for enabling runtime adaptability by allowing behavior changes without deployments. Both bindings work together to create systems that can adapt quickly to changing conditions.

- [centralized-configuration.md](../../docs/bindings/core/centralized-configuration.md): Runtime adaptability often depends on dynamic configuration management. Centralized configuration provides the foundation for runtime adaptability by making configuration changes possible without deployments.

- [flexible-architecture-patterns.md](../../docs/bindings/core/flexible-architecture-patterns.md): Flexible architecture enables runtime adaptability by providing the structural foundation that allows systems to change behavior dynamically. Well-designed flexible architecture makes runtime adaptation possible and safe.

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Quality gates help ensure that runtime adaptations maintain system reliability and performance. Automated monitoring and validation prevent harmful adaptations and enable safe runtime behavior changes.
