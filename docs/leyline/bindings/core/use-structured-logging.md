---
derived_from: automation
enforced_by: linters & code review
id: use-structured-logging
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Implement Complete Observability with Structured Logs, Metrics, and Traces

All systems must implement the three pillars of observability: structured logs, metrics,
and distributed traces. Structured logging must use machine-readable formats (primarily
JSON) that can be automatically parsed, indexed, and analyzed. Metrics must capture key
performance indicators and service health signals. Distributed tracing must track
request flows across service boundaries. Every observability signal must include
standardized contextual information that enables correlation across the pillars.

## Rationale

This binding directly implements our automation tenet by transforming system telemetry
from human-readable outputs into machine-readable data that can power automated
monitoring, alerting, and analysis. When you implement comprehensive observability with
structured logs, metrics, and traces, you're not just recording what happened—you're
creating a multidimensional, queryable model of your system's behavior that enables
automated tooling to detect patterns, identify anomalies, and pinpoint the root causes
of issues without human intervention.

Think of observability like the difference between asking someone for directions versus
using a GPS navigation system with real-time traffic data and street view. With
directions alone (similar to basic logging), you have a linear set of instructions that
might get you to your destination but offer no adaptive guidance if you make a wrong
turn or encounter an obstacle. A GPS system combines multiple data sources—maps,
satellite positioning, traffic metrics, and visual references—to provide a comprehensive
navigation experience that adapts to changing conditions and helps you recover from
mistakes. Similarly, comprehensive observability with its three pillars provides
multiple perspectives on system behavior that work together to guide troubleshooting and
optimization efforts.

The benefits of this comprehensive approach become critical as systems scale,
particularly in distributed architectures where a single user request might traverse
dozens of services. When each service produces correlated logs, metrics, and traces with
consistent identifiers, automated tools can construct a complete picture of system
behavior—something practically impossible with any single telemetry type alone. This
multi-dimensional observability changes troubleshooting from an archaeological
expedition into a guided investigation, dramatically reducing the mean time to
resolution for complex issues and enabling developers to focus on building new features
rather than deciphering system behavior.

Each observability pillar provides unique and complementary insights: logs tell you what
happened and why, metrics show you how often and how much, and traces reveal the journey
and relationships between components. Together, they create a complete story that no
single telemetry type could tell alone. This comprehensive approach enables automated
systems to not just react to problems but predict them before they impact users, turning
observability from a reactive tool into a proactive force multiplier for system
reliability.

## Rule Definition

This binding establishes clear requirements for implementing all three observability
pillars throughout your systems:

### Structured Logging Requirements

- **Use Machine-Readable Formats**: All logging must output structured data, typically
  in JSON format:

  - Each log entry must be a complete, parseable JSON object
  - Field names must be consistent across all log entries
  - Values must be properly typed (strings, numbers, booleans, nested objects)
  - No templated strings or interpolated values within message fields
  - No HTML, ANSI color codes, or other formatting in production logs

- **Include Mandatory Context Fields**: Every log entry must contain these standard
  fields:

  - `timestamp`: ISO 8601 format in UTC (e.g., `2025-05-04T14:22:38.123Z`)
  - `level`: Standardized severity level (`debug`, `info`, `warn`, `error`, `fatal`)
  - `message`: Human-readable description of the event
  - `service`: Name of the application or service generating the log
  - `correlation_id`: Request ID, Trace ID that links related events
  - `component`: Module, class, or function name where the log originated
  - For error logs: `error` object with `type`, `message`, and `stack` fields

- **Avoid Unstructured Logging Methods**: These patterns are explicitly prohibited:

  - Direct use of console methods (`console.log`, `console.error`, etc.)
  - Print statements (`System.out.println`, `fmt.Println`, `print()`, etc.)
  - String concatenation or interpolation without structured context
  - Logging libraries in non-structured modes
  - Rolling your own logging instead of using established libraries

### Metrics Requirements

- **Implement Standard Service Metrics**: All services must expose these core metrics
  categories:

  - **Traffic**: Request rates, user activities, data throughput
  - **Errors**: Error rates, types, and distributions
  - **Latency**: Response times with percentile distributions (p50, p90, p99)
  - **Saturation**: Resource utilization (CPU, memory, disk, network)
  - **Application-specific business metrics** relevant to the service domain

- **Use Consistent Metric Types**: Apply appropriate metric types for different signal
  categories:

  - **Counters**: For events that accumulate (requests received, errors)
  - **Gauges**: For point-in-time measurements (memory usage, connection pool size)
  - **Histograms**: For distributions of values (request durations)
  - **Percentiles**: For latency thresholds (p95 response time)

- **Include Required Metadata**: All metrics must include standardized labels/tags:

  - `service`: Name of the service the metric comes from
  - `instance`: Specific instance identifier
  - `version`: Service version or deployment identifier
  - `environment`: Production, staging, development, etc.
  - Additional dimensional labels appropriate to the metric

### Distributed Tracing Requirements

- **Implement End-to-End Tracing**: All services must participate in distributed
  tracing:

  - Every service must generate trace spans for all incoming and outgoing requests
  - Trace context must be propagated through all service boundaries
  - Trace sampling rates must be configurable based on request properties
  - High-value transactions must be traced at higher sampling rates
  - Spans must include all relevant metadata about the operation

- **Include Required Span Attributes**: All trace spans must include:

  - `service.name`: Name of the service generating the span
  - `span.kind`: The role of the span (client, server, producer, consumer)
  - `http.method` and `http.url` for HTTP calls
  - `db.system` and `db.statement` for database operations
  - `error` attributes when operations fail
  - Operation-specific attributes that aid in debugging

- **Maintain Trace Continuity**: Trace context must be propagated:

  - Across process boundaries (HTTP, gRPC, message queues)
  - Across asynchronous operations (callbacks, futures, message processing)
  - Through batch processing and scheduled jobs
  - In multi-tenant environments with tenant-specific correlation

### Cross-Cutting Requirements

- **Maintain Consistent Correlation**: Every observability signal must support
  correlation:

  - Logs must include trace IDs and span IDs when available
  - Metrics should be filterable by trace ID for high-cardinality troubleshooting
  - Traces must include links to logs generated during the span
  - All three signals must share common identifiers for correlation

- **Apply Consistent Data Types**: All observability data must maintain type
  consistency:

  - IDs should be strings even when they appear numeric
  - Timestamps must use consistent ISO 8601 format
  - Durations should use consistent units (usually milliseconds)
  - Boolean flags should be actual booleans, not strings like "true"/"false"

- **Exceptions and Limitations**:

  - Development/debug-only telemetry may use simplified formats but should be disabled
    in production
  - CLI tools may use unstructured formats for direct human consumption
  - Interactive REPL environments may use simplified observability
  - Unit test observability may be simplified or mocked

## Practical Implementation

Here are concrete strategies for implementing comprehensive observability with all three
pillars:

### 1. Structured Logging Implementation

1. **Choose Appropriate Logging Libraries**: Select libraries designed for structured
   logging in your language:

   - **JavaScript/TypeScript**:

     ```typescript
     // Setup with pino
     import pino from 'pino';

     const logger = pino({
       messageKey: 'message',
       timestamp: pino.stdTimeFunctions.isoTime,
       base: {
         service: 'user-service',
       },
     });

     // Usage with request context
     app.use((req, res, next) => {
       req.log = logger.child({
         correlation_id: req.headers['x-correlation-id'] || generateId(),
         component: 'http-handler'
       });
       next();
     });

     // Log with structured context
     req.log.info({ userId, action: 'login' }, 'User authentication successful');
     ```

   - **Go**:

     ```go
     // Setup with zerolog
     package main

     import (
       "github.com/rs/zerolog"
       "github.com/rs/zerolog/log"
       "os"
       "time"
     )

     func main() {
       // Configure global logger
       zerolog.TimeFieldFormat = zerolog.TimeFormatISO8601
       log := zerolog.New(os.Stdout).With().
         Timestamp().
         Str("service", "order-processor").
         Logger()

       // Create context-aware logger
       ctx := log.With().
         Str("correlation_id", getCorrelationId()).
         Str("component", "payment-handler").
         Logger()

       // Log with structured context
       ctx.Info().
         Str("order_id", "12345").
         Str("payment_provider", "stripe").
         Msg("Payment processed successfully")
     }
     ```

1. **Standardize Log Levels**: Use consistent severity levels across all services:

   ```
   debug: Detailed information useful during development and debugging
   info: Normal operational messages, milestones, and successful operations
   warn: Non-critical issues, degraded service, or potential problems
   error: Failed operations that impact a single request or operation
   fatal: Critical failures that require immediate attention or threaten system operation
   ```

   Configure production environments to log at `info` level or higher, while development
   environments can use `debug` to capture more detail.

### 2. Metrics Collection Implementation

1. **Implement Standard Metrics Frameworks**: Use established metrics libraries for your
   language/platform:

   - **JavaScript/TypeScript**:

     ```typescript
     // Setup with Prometheus client
     import * as promClient from 'prom-client';

     // Initialize metrics registry
     const registry = new promClient.Registry();
     promClient.collectDefaultMetrics({ register: registry });

     // Create standard metrics
     const httpRequestDuration = new promClient.Histogram({
       name: 'http_request_duration_seconds',
       help: 'Duration of HTTP requests in seconds',
       labelNames: ['method', 'route', 'status_code'],
       buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
     });

     const httpRequestTotal = new promClient.Counter({
       name: 'http_requests_total',
       help: 'Total number of HTTP requests',
       labelNames: ['method', 'route', 'status_code']
     });

     // Register metrics
     registry.registerMetric(httpRequestDuration);
     registry.registerMetric(httpRequestTotal);

     // Express middleware to record metrics
     app.use((req, res, next) => {
       const start = Date.now();

       // Add response hook to record metrics on completion
       res.on('finish', () => {
         const duration = (Date.now() - start) / 1000;
         const labels = {
           method: req.method,
           route: req.route?.path || 'unknown',
           status_code: res.statusCode
         };

         httpRequestDuration.observe(labels, duration);
         httpRequestTotal.inc(labels);
       });

       next();
     });

     // Expose metrics endpoint
     app.get('/metrics', async (req, res) => {
       res.set('Content-Type', registry.contentType);
       res.end(await registry.metrics());
     });
     ```

   - **Go**:

     ```go
     package main

     import (
       "github.com/prometheus/client_golang/prometheus"
       "github.com/prometheus/client_golang/prometheus/promauto"
       "github.com/prometheus/client_golang/prometheus/promhttp"
       "net/http"
       "time"
     )

     var (
       // Create standard metrics
       requestDuration = promauto.NewHistogramVec(
         prometheus.HistogramOpts{
           Name:    "http_request_duration_seconds",
           Help:    "Duration of HTTP requests in seconds",
           Buckets: prometheus.DefBuckets,
         },
         []string{"method", "route", "status_code"},
       )

       requestTotal = promauto.NewCounterVec(
         prometheus.CounterOpts{
           Name: "http_requests_total",
           Help: "Total number of HTTP requests",
         },
         []string{"method", "route", "status_code"},
       )

       activeConnections = promauto.NewGauge(
         prometheus.GaugeOpts{
           Name: "http_active_connections",
           Help: "Number of active HTTP connections",
         },
       )
     )

     // Middleware to record request metrics
     func metricsMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
         start := time.Now()

         // Track active connections
         activeConnections.Inc()
         defer activeConnections.Dec()

         // Create a response wrapper to capture status code
         wrapped := newResponseWriter(w)

         // Process the request
         next.ServeHTTP(wrapped, r)

         // Record metrics after completion
         duration := time.Since(start).Seconds()
         labels := prometheus.Labels{
           "method":      r.Method,
           "route":       r.URL.Path,
           "status_code": fmt.Sprintf("%d", wrapped.statusCode),
         }

         requestDuration.With(labels).Observe(duration)
         requestTotal.With(labels).Inc()
       })
     }

     func main() {
       // Register metrics handler
       http.Handle("/metrics", promhttp.Handler())

       // Use metrics middleware for all routes
       http.Handle("/", metricsMiddleware(yourHandler))

       http.ListenAndServe(":8080", nil)
     }
     ```

1. **Define Business-Level Metrics**: Track domain-specific metrics beyond technical
   operations:

   ```typescript
   // Create business metrics
   const orderTotal = new promClient.Counter({
     name: 'business_orders_total',
     help: 'Total number of orders placed',
     labelNames: ['product_type', 'payment_method', 'customer_tier']
   });

   const orderValue = new promClient.Histogram({
     name: 'business_order_value_dollars',
     help: 'Distribution of order values in dollars',
     labelNames: ['product_type', 'customer_tier'],
     buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
   });

   // Record business metrics during order processing
   function processOrder(order) {
     const labels = {
       product_type: order.productType,
       payment_method: order.paymentMethod,
       customer_tier: order.customerTier
     };

     orderTotal.inc(labels);
     orderValue.observe({
       product_type: order.productType,
       customer_tier: order.customerTier
     }, order.totalAmount);

     // Process order...
   }
   ```

1. **Configure a Metrics Aggregation System**: Set up a central metrics collection
   platform:

   ```yaml
   # prometheus.yml example configuration
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: 'api_services'
       metrics_path: '/metrics'
       static_configs:
         - targets: ['api-service-1:8080', 'api-service-2:8080']
       relabel_configs:
         - source_labels: [__address__]
           target_label: instance

     - job_name: 'database_services'
       metrics_path: '/metrics'
       static_configs:
         - targets: ['db-service-1:9100', 'db-service-2:9100']

   alerting:
     alertmanagers:
     - static_configs:
       - targets: ['alertmanager:9093']
   ```

### 3. Distributed Tracing Implementation

1. **Implement OpenTelemetry Tracing**: Use the OpenTelemetry standard for
   language-agnostic tracing:

   - **JavaScript/TypeScript**:

     ```typescript
     // Setup with OpenTelemetry
     import * as opentelemetry from '@opentelemetry/sdk-node';
     import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
     import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
     import { Resource } from '@opentelemetry/resources';
     import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

     // Configure the SDK
     const sdk = new opentelemetry.NodeSDK({
       resource: new Resource({
         [SemanticResourceAttributes.SERVICE_NAME]: 'order-api',
         [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
         environment: 'production'
       }),
       traceExporter: new OTLPTraceExporter({
         url: 'http://otel-collector:4318/v1/traces'
       }),
       instrumentations: [getNodeAutoInstrumentations()]
     });

     // Initialize OpenTelemetry
     sdk.start();

     // Manual tracing for business operations
     import { trace } from '@opentelemetry/api';

     async function processPayment(orderId, paymentDetails) {
       const tracer = trace.getTracer('payment-processor');

       // Create span for payment processing
       const span = tracer.startSpan('process_payment');
       span.setAttribute('order_id', orderId);
       span.setAttribute('payment_method', paymentDetails.method);
       span.setAttribute('amount', paymentDetails.amount);

       try {
         // Process payment logic
         const result = await paymentProvider.charge(paymentDetails);
         span.setAttribute('transaction_id', result.transactionId);
         return result;
       } catch (error) {
         // Record error in span
         span.recordException(error);
         span.setStatus({ code: SpanStatusCode.ERROR });
         throw error;
       } finally {
         span.end();
       }
     }
     ```

   - **Go**:

     ```go
     package main

     import (
       "context"
       "go.opentelemetry.io/otel"
       "go.opentelemetry.io/otel/attribute"
       "go.opentelemetry.io/otel/exporters/otlp/otlptrace"
       "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
       "go.opentelemetry.io/otel/sdk/resource"
       sdktrace "go.opentelemetry.io/otel/sdk/trace"
       semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
       "go.opentelemetry.io/otel/trace"
       "google.golang.org/grpc"
       "log"
     )

     func initTracer() func() {
       // Create OTLP exporter
       ctx := context.Background()
       conn, err := grpc.DialContext(ctx, "otel-collector:4317", grpc.WithInsecure())
       if err != nil {
         log.Fatalf("Failed to create gRPC connection: %v", err)
       }

       exporter, err := otlptrace.New(ctx, otlptracegrpc.NewClient(
         otlptracegrpc.WithGRPCConn(conn),
       ))
       if err != nil {
         log.Fatalf("Failed to create exporter: %v", err)
       }

       // Create resource with service information
       res, err := resource.New(ctx,
         resource.WithAttributes(
           semconv.ServiceNameKey.String("inventory-service"),
           semconv.ServiceVersionKey.String("1.0.0"),
           attribute.String("environment", "production"),
         ),
       )
       if err != nil {
         log.Fatalf("Failed to create resource: %v", err)
       }

       // Configure trace provider
       tp := sdktrace.NewTracerProvider(
         sdktrace.WithSampler(sdktrace.AlwaysSample()),
         sdktrace.WithBatcher(exporter),
         sdktrace.WithResource(res),
       )

       // Set global trace provider
       otel.SetTracerProvider(tp)

       // Return cleanup function
       return func() {
         if err := tp.Shutdown(ctx); err != nil {
           log.Fatalf("Error shutting down tracer provider: %v", err)
         }
       }
     }

     // Using tracing in business logic
     func UpdateInventory(ctx context.Context, productID string, quantity int) error {
       tracer := otel.Tracer("inventory-operations")

       ctx, span := tracer.Start(ctx, "update_inventory")
       defer span.End()

       // Add business context to span
       span.SetAttributes(
         attribute.String("product_id", productID),
         attribute.Int("quantity_change", quantity),
       )

       // Business logic
       err := db.UpdateStock(ctx, productID, quantity)
       if err != nil {
         span.RecordError(err)
         return err
       }

       span.SetAttributes(attribute.String("status", "success"))
       return nil
     }
     ```

1. **Configure Context Propagation**: Ensure trace context propagates across service
   boundaries:

   ```typescript
   // HTTP client with context propagation
   import { context, trace } from '@opentelemetry/api';
   import axios from 'axios';
   import { W3CTraceContextPropagator } from '@opentelemetry/core';

   const propagator = new W3CTraceContextPropagator();

   async function makeHttpRequest(url, data) {
     // Get current context and active span
     const currentContext = context.active();
     const currentSpan = trace.getSpan(currentContext);

     // Create headers object with trace context
     const headers = {};
     propagator.inject(currentContext, headers);

     // Make HTTP request with propagated context
     try {
       return await axios({
         method: 'POST',
         url,
         data,
         headers
       });
     } catch (error) {
       // Record error in current span
       if (currentSpan) {
         currentSpan.recordException(error);
       }
       throw error;
     }
   }
   ```

1. **Set Up an Observability Backend**: Deploy a complete observability stack:

   ```yaml
   # docker-compose.yml for observability stack
   version: '3'
   services:
     # Metrics collection
     prometheus:
       image: prom/prometheus
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
       ports:
         - "9090:9090"

     # Alerting
     alertmanager:
       image: prom/alertmanager
       volumes:
         - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
       ports:
         - "9093:9093"

     # Tracing collection
     jaeger:
       image: jaegertracing/all-in-one
       ports:
         - "16686:16686"  # UI
         - "14268:14268"  # Collector

     # OpenTelemetry collector
     otel-collector:
       image: otel/opentelemetry-collector
       volumes:
         - ./otel-collector-config.yml:/etc/otel-collector-config.yml
       command: ["--config=/etc/otel-collector-config.yml"]
       ports:
         - "4317:4317"  # OTLP gRPC
         - "4318:4318"  # OTLP HTTP

     # Log aggregation
     elasticsearch:
       image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
       environment:
         - discovery.type=single-node
       ports:
         - "9200:9200"

     kibana:
       image: docker.elastic.co/kibana/kibana:7.17.0
       ports:
         - "5601:5601"

     # Data visualization
     grafana:
       image: grafana/grafana
       volumes:
         - ./grafana/provisioning:/etc/grafana/provisioning
       ports:
         - "3000:3000"
   ```

### 4. Integrating All Three Pillars

1. **Create a Unified Observability Interface**: Build a consistent API across all three
   pillars:

   ```typescript
   // observability.ts - Unified interface for all three pillars
   import * as opentelemetry from '@opentelemetry/sdk-node';
   import * as promClient from 'prom-client';
   import pino from 'pino';

   // Initialize unified observability
   export function initializeObservability(serviceName, serviceVersion) {
     // Set up structured logging
     const logger = pino({
       messageKey: 'message',
       timestamp: pino.stdTimeFunctions.isoTime,
       base: {
         service: serviceName,
         version: serviceVersion,
       },
     });

     // Set up metrics registry
     const metricsRegistry = new promClient.Registry();
     promClient.collectDefaultMetrics({ register: metricsRegistry });

     // Set up standard metrics
     const httpRequestDuration = new promClient.Histogram({
       name: 'http_request_duration_seconds',
       help: 'Duration of HTTP requests in seconds',
       labelNames: ['method', 'route', 'status_code'],
       buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
     });

     const httpRequestTotal = new promClient.Counter({
       name: 'http_requests_total',
       help: 'Total number of HTTP requests',
       labelNames: ['method', 'route', 'status_code']
     });

     metricsRegistry.registerMetric(httpRequestDuration);
     metricsRegistry.registerMetric(httpRequestTotal);

     // Set up tracing
     const sdk = initTracing(serviceName, serviceVersion);

     // Return unified interface
     return {
       logger,
       metrics: {
         registry: metricsRegistry,
         httpRequestDuration,
         httpRequestTotal,
         createCounter: (name, help, labelNames) => {
           const counter = new promClient.Counter({ name, help, labelNames });
           metricsRegistry.registerMetric(counter);
           return counter;
         },
         createGauge: (name, help, labelNames) => {
           const gauge = new promClient.Gauge({ name, help, labelNames });
           metricsRegistry.registerMetric(gauge);
           return gauge;
         },
         createHistogram: (name, help, labelNames, buckets) => {
           const histogram = new promClient.Histogram({ name, help, labelNames, buckets });
           metricsRegistry.registerMetric(histogram);
           return histogram;
         }
       },
       tracing: {
         getTracer: (name) => opentelemetry.trace.getTracer(name),
       },

       // Context-aware logger that includes trace information
       getContextLogger: (traceContext, component) => {
         const span = opentelemetry.trace.getSpan(traceContext);
         let traceId = 'unknown';
         let spanId = 'unknown';

         if (span) {
           const spanContext = span.spanContext();
           traceId = spanContext.traceId;
           spanId = spanContext.spanId;
         }

         return logger.child({
           trace_id: traceId,
           span_id: spanId,
           component
         });
       },

       // Middleware for Express that ties all three pillars together
       expressMiddleware: () => (req, res, next) => {
         const start = Date.now();

         // Extract or create trace context
         const traceId = req.headers['traceparent'] ?
           parseTraceParent(req.headers['traceparent']).traceId :
           generateId();

         // Add context to request
         req.observability = {
           traceId,
           startTime: start,
           logger: logger.child({
             trace_id: traceId,
             component: 'http-handler',
             method: req.method,
             path: req.path
           })
         };

         // Log request
         req.observability.logger.info({
           event: 'http_request_received',
           method: req.method,
           path: req.path,
           query: req.query,
           remote_addr: req.ip
         }, 'Received HTTP request');

         // Add response hook
         res.on('finish', () => {
           const duration = (Date.now() - start) / 1000;
           const labels = {
             method: req.method,
             route: req.route?.path || req.path,
             status_code: res.statusCode.toString()
           };

           // Record metrics
           httpRequestDuration.observe(labels, duration);
           httpRequestTotal.inc(labels);

           // Log response
           req.observability.logger.info({
             event: 'http_request_completed',
             method: req.method,
             path: req.path,
             status_code: res.statusCode,
             duration_ms: duration * 1000
           }, 'Completed HTTP request');
         });

         next();
       }
     };
   }
   ```

1. **Set Up Unified Health Checks**: Create consolidated checks that verify all three
   pillars:

   ```typescript
   // health-checks.ts
   import { Router } from 'express';

   export function createHealthRoutes(observability) {
     const router = Router();

     // Basic health check
     router.get('/health', (req, res) => {
       res.status(200).json({ status: 'ok' });
     });

     // Detailed health check with diagnostics
     router.get('/health/detailed', (req, res) => {
       // Check all three observability pillars
       const checks = {
         logging: checkLogging(),
         metrics: checkMetrics(observability.metrics.registry),
         tracing: checkTracing()
       };

       const allHealthy = Object.values(checks).every(check => check.status === 'ok');

       res.status(allHealthy ? 200 : 503).json({
         status: allHealthy ? 'ok' : 'degraded',
         checks
       });
     });

     // Prometheus metrics endpoint
     router.get('/metrics', async (req, res) => {
       res.set('Content-Type', observability.metrics.registry.contentType);
       res.end(await observability.metrics.registry.metrics());
     });

     return router;
   }

   function checkLogging() {
     try {
       // Attempt to write a log entry
       return { status: 'ok' };
     } catch (error) {
       return {
         status: 'error',
         error: error.message
       };
     }
   }

   function checkMetrics(registry) {
     try {
       // Check if metrics registry is functioning
       const metricCount = registry.getMetricsAsArray().length;
       return {
         status: 'ok',
         metrics_count: metricCount
       };
     } catch (error) {
       return {
         status: 'error',
         error: error.message
       };
     }
   }

   function checkTracing() {
     try {
       // Verify tracing exporter is connected
       return { status: 'ok' };
     } catch (error) {
       return {
         status: 'error',
         error: error.message
       };
     }
   }
   ```

1. **Create Unified Dashboard Templates**: Set up dashboard templates showing all three
   pillars:

   ```json
   // grafana-dashboard.json (simplified example)
   {
     "title": "Service Overview Dashboard",
     "panels": [
       {
         "title": "Request Rate",
         "type": "graph",
         "datasource": "Prometheus",
         "targets": [
           {
             "expr": "sum(rate(http_requests_total[5m])) by (service)",
             "legendFormat": "{{service}}"
           }
         ]
       },
       {
         "title": "Error Rate",
         "type": "graph",
         "datasource": "Prometheus",
         "targets": [
           {
             "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)",
             "legendFormat": "{{service}}"
           }
         ]
       },
       {
         "title": "Response Time",
         "type": "graph",
         "datasource": "Prometheus",
         "targets": [
           {
             "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le))",
             "legendFormat": "{{service}} (p95)"
           }
         ]
       },
       {
         "title": "Recent Errors",
         "type": "logs",
         "datasource": "Elasticsearch",
         "targets": [
           {
             "query": "level:error"
           }
         ]
       },
       {
         "title": "Trace Explorer",
         "type": "jaeger-panel",
         "datasource": "Jaeger"
       }
     ]
   }
   ```

## Examples

### Structured Logging Examples

```typescript
// ❌ BAD: Unstructured logging with variable format
console.log("User", userId, "logged in at", new Date());
console.log(`Processing order ${orderId}`);
console.error("Failed to connect: " + error.message);

// ✅ GOOD: Structured logging with consistent fields
logger.info({
  component: "auth-service",
  correlation_id: requestId,
  user_id: userId,
  action: "login",
  duration_ms: loginTime
}, "User authentication successful");

logger.error({
  component: "order-service",
  correlation_id: requestId,
  order_id: orderId,
  error: {
    type: error.name,
    message: error.message,
    stack: error.stack
  }
}, "Order processing failed");
```

```go
// ❌ BAD: String concatenation and inconsistent format
fmt.Printf("Starting process for user %s\n", userID)
log.Printf("Order status: %s - Items: %d", order.Status, len(order.Items))
fmt.Printf("Error during checkout: %v", err)

// ✅ GOOD: Structured logging with typed fields
logger := log.With().
  Str("correlation_id", ctx.Value("correlation_id").(string)).
  Str("component", "checkout-service").
  Logger()

logger.Info().
  Str("user_id", userID).
  Str("order_id", orderID).
  Int("item_count", len(order.Items)).
  Float64("total_amount", order.Total).
  Msg("Order checkout started")

if err != nil {
  logger.Error().
    Err(err).
    Str("error_code", getErrorCode(err)).
    Msg("Checkout process failed")
}
```

### Metrics Examples

```typescript
// ❌ BAD: Ad-hoc metrics collection without standardization
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

app.use((req, res, next) => {
  requestCount++;
  const start = Date.now();

  // Original handler
  next();

  // After response
  const duration = Date.now() - start;
  totalResponseTime += duration;

  if (res.statusCode >= 400) {
    errorCount++;
  }

  // No consistent exposure of metrics
  console.log(`Stats: ${requestCount} requests, ${errorCount} errors`);
});

// ✅ GOOD: Standardized metrics using Prometheus
const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

app.use((req, res, next) => {
  const start = Date.now();

  // After response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      path: req.route ? req.route.path : req.path,
      status: res.statusCode.toString()
    };

    requestCounter.inc(labels);
    requestDuration.observe(labels, duration);
  });

  next();
});

// Expose metrics endpoint for scraping
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.contentType);
  res.end(promClient.register.metrics());
});
```

```go
// ❌ BAD: Manual timing and custom metrics format
func processOrder(w http.ResponseWriter, r *http.Request) {
    startTime := time.Now()

    // Process the order...

    // Manual timing calculation
    duration := time.Since(startTime)

    // Non-standardized metrics tracking
    processingTimes = append(processingTimes, duration)
    orderCount++

    // Calculate average (not efficient for high throughput)
    var total time.Duration
    for _, t := range processingTimes {
        total += t
    }
    avgTime := total / time.Duration(len(processingTimes))

    fmt.Printf("Processed %d orders, avg time: %v\n", orderCount, avgTime)
}

// ✅ GOOD: Standardized metrics with Prometheus
var (
    orderCounter = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "orders_processed_total",
            Help: "Total number of processed orders",
        },
        []string{"status", "payment_method"},
    )

    orderProcessingTime = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "order_processing_seconds",
            Help:    "Time spent processing orders",
            Buckets: prometheus.DefBuckets,
        },
        []string{"status", "payment_method"},
    )

    orderValueSum = promauto.NewSummaryVec(
        prometheus.SummaryOpts{
            Name:       "order_value_dollars",
            Help:       "Distribution of order values",
            Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
        },
        []string{"product_category"},
    )
)

func processOrder(w http.ResponseWriter, r *http.Request) {
    timer := prometheus.NewTimer(prometheus.ObserverFunc(func(v float64) {
        orderProcessingTime.WithLabelValues(order.Status, order.PaymentMethod).Observe(v)
    }))
    defer timer.ObserveDuration()

    // Process the order...

    // Record metrics with appropriate labels
    orderCounter.WithLabelValues(order.Status, order.PaymentMethod).Inc()
    orderValueSum.WithLabelValues(order.ProductCategory).Observe(order.Total)
}

// Register Prometheus handler for metrics exposure
http.Handle("/metrics", promhttp.Handler())
```

### Tracing Examples

```typescript
// ❌ BAD: Manual correlation with inconsistent propagation
function processPayment(orderId, amount) {
  const correlationId = uuid.v4();
  console.log(`[${correlationId}] Processing payment for order ${orderId}`);

  // Call payment service with manually added header
  return axios.post('https://payment-api/process', {
    order_id: orderId,
    amount: amount
  }, {
    headers: {
      'X-Correlation-ID': correlationId
    }
  })
  .then(response => {
    console.log(`[${correlationId}] Payment successful`);
    return response.data;
  })
  .catch(error => {
    console.error(`[${correlationId}] Payment failed: ${error.message}`);
    throw error;
  });
}

// ✅ GOOD: OpenTelemetry tracing with automatic context propagation
async function processPayment(orderId, amount) {
  const tracer = trace.getTracer('payment-service');

  // Create a span for the payment operation
  return tracer.startActiveSpan('process_payment', async (span) => {
    try {
      // Add business context as span attributes
      span.setAttribute('order_id', orderId);
      span.setAttribute('amount', amount);
      span.setAttribute('payment_method', 'credit_card');

      // OpenTelemetry HTTP instrumentation automatically propagates context
      const response = await axios.post('https://payment-api/process', {
        order_id: orderId,
        amount: amount
      });

      // Add outcome to span
      span.setAttribute('status', 'success');
      span.setAttribute('transaction_id', response.data.transactionId);

      return response.data;
    } catch (error) {
      // Record error in span
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      // End the span
      span.end();
    }
  });
}
```

```go
// ❌ BAD: Basic logging with manual correlation
func FulfillOrder(orderID string) error {
    requestID := uuid.New().String()

    log.Printf("[%s] Starting order fulfillment for %s", requestID, orderID)

    // Process payment
    log.Printf("[%s] Processing payment", requestID)
    err := processPayment(orderID, requestID)
    if err != nil {
        log.Printf("[%s] Payment failed: %v", requestID, err)
        return err
    }

    // Update inventory
    log.Printf("[%s] Updating inventory", requestID)
    err = updateInventory(orderID, requestID)
    if err != nil {
        log.Printf("[%s] Inventory update failed: %v", requestID, err)
        return err
    }

    log.Printf("[%s] Order fulfillment completed for %s", requestID, orderID)
    return nil
}

// ✅ GOOD: OpenTelemetry distributed tracing
func FulfillOrder(ctx context.Context, orderID string) error {
    // Create tracer
    tracer := otel.Tracer("order-service")

    // Start a new span for this operation
    ctx, span := tracer.Start(ctx, "fulfill_order")
    defer span.End()

    // Add context to the span
    span.SetAttributes(
        attribute.String("order_id", orderID),
        attribute.String("fulfillment_type", "standard"),
    )

    // Process payment with context propagation
    if err := processPayment(ctx, orderID); err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, "Payment processing failed")
        return fmt.Errorf("payment processing: %w", err)
    }

    // Update inventory with context propagation
    if err := updateInventory(ctx, orderID); err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, "Inventory update failed")
        return fmt.Errorf("inventory update: %w", err)
    }

    // Mark as successful
    span.SetStatus(codes.Ok, "Order fulfilled successfully")
    return nil
}

// Child operation with its own span
func processPayment(ctx context.Context, orderID string) error {
    tracer := otel.Tracer("payment-processor")

    // Create child span that automatically links to parent
    ctx, span := tracer.Start(ctx, "process_payment")
    defer span.End()

    span.SetAttributes(attribute.String("order_id", orderID))

    // Actual payment processing logic...

    return nil
}
```

### Integrated Observability Examples

```typescript
// ❌ BAD: Separate, disconnected observability signals
function handleCheckout(req, res) {
  // Logging separately
  console.log(`Processing checkout for user ${req.user.id}`);

  // Manual timing for metrics
  const startTime = Date.now();

  // Separate correlation ID with manual propagation
  const requestId = req.headers['x-request-id'] || uuid.v4();

  try {
    // Process the checkout...
    const result = processOrder(req.body.items, req.user.id, requestId);

    // Manual metrics recording
    const duration = Date.now() - startTime;
    checkoutCount++;
    checkoutDurations.push(duration);

    console.log(`Checkout completed in ${duration}ms for request ${requestId}`);
    res.json(result);
  } catch (error) {
    // Error logging separate from other signals
    console.error(`Checkout failed: ${error.message}`);
    errorCount++;
    res.status(500).json({ error: error.message });
  }
}

// ✅ GOOD: Unified observability with correlation across signals
function handleCheckout(req, res) {
  const obs = req.observability;
  const logger = obs.logger;
  const tracer = obs.tracer;
  const metrics = obs.metrics;

  // Start a trace span
  return tracer.startActiveSpan('checkout_process', async (span) => {
    try {
      // Log with trace context automatically included
      logger.info({
        event: 'checkout_started',
        user_id: req.user.id,
        item_count: req.body.items.length,
        cart_value: calculateTotal(req.body.items)
      });

      // Process the checkout with trace context propagation
      const result = await processOrder(req.body.items, req.user.id);

      // Record metrics with same identifiers as logs and traces
      metrics.orderTotal.inc({
        status: 'completed',
        payment_method: req.body.paymentMethod,
        user_tier: req.user.tier
      });

      metrics.orderValue.observe({
        payment_method: req.body.paymentMethod,
        user_tier: req.user.tier
      }, calculateTotal(req.body.items));

      // Log completion with same correlation ID
      logger.info({
        event: 'checkout_completed',
        user_id: req.user.id,
        order_id: result.orderId,
        processing_time_ms: result.processingTime
      });

      // Add business context to span
      span.setAttribute('order_id', result.orderId);
      span.setAttribute('order_value', calculateTotal(req.body.items));
      span.setAttribute('processing_time_ms', result.processingTime);

      res.json(result);
    } catch (error) {
      // Unified error handling across all signals

      // Add error to span
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });

      // Log with trace context
      logger.error({
        event: 'checkout_failed',
        user_id: req.user.id,
        error_type: error.name,
        error_message: error.message
      });

      // Increment error metric with consistent labels
      metrics.checkoutErrors.inc({
        error_type: error.name,
        payment_method: req.body.paymentMethod
      });

      res.status(500).json({ error: error.message });
    } finally {
      // End span
      span.end();
    }
  });
}
```

## Related Bindings

- [context-propagation](../../docs/bindings/core/context-propagation.md): Complete observability depends on
  proper context propagation to maintain correlation IDs and other contextual
  information across service boundaries. These bindings work together to create
  end-to-end traceability in distributed systems, with context propagation providing the
  means to connect observability signals from different services into a coherent
  narrative.

- [external-configuration](../../docs/bindings/core/external-configuration.md): Observability configuration (log
  levels, metrics sampling, trace sampling rates) should be managed through external
  configuration rather than hardcoded. This allows for environment-specific settings and
  dynamic adjustment of telemetry verbosity without code changes. Together, these
  bindings ensure that observability is both comprehensive and adaptable to different
  operational needs.

- [explicit-over-implicit](../../docs/tenets/explicit-over-implicit.md): Structured
  observability is a perfect application of the explicit-over-implicit principle, as it
  makes the context and meaning of all telemetry explicit rather than buried in
  unstructured text or isolated signals. Where traditional monitoring often relies on
  implicit context and human pattern recognition, structured observability makes all
  relevant data explicit, queryable, and machine-processable across all three pillars.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): A well-designed observability system
  should use dependency inversion to abstract the concrete telemetry implementations
  behind interfaces. This allows for swapping out logging, metrics, or tracing providers
  without changing business logic. By depending on abstractions rather than concrete
  implementations, systems can evolve their observability stack independently of
  application code.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Observability instrumentation should
  respect domain purity by ensuring that core domain logic remains free from direct
  observability concerns. Instead, observability is typically implemented in the
  adapters and infrastructure layers of a hexagonal architecture, with domain events
  serving as the primary source of telemetry from the domain layer itself.

- [authentication-authorization-patterns](../../docs/bindings/categories/security/authentication-authorization-patterns.md): Authentication and authorization events require comprehensive structured logging to enable security monitoring, incident response, and compliance auditing. Both bindings create systematic observability for security-critical operations while ensuring that sensitive data is properly protected in log outputs.
