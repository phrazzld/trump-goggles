---
derived_from: explicit-over-implicit
enforced_by: code review & integration tests
id: context-propagation
last_modified: '2025-05-14'
---
# Binding: Propagate Request Context Across Service Boundaries

All services must propagate context information across process boundaries to maintain
traceability and state coherence in distributed systems. This includes correlation IDs,
causality tokens, tenant identifiers, and other contextual metadata that collectively
establish the full context of a request. Context propagation must be implemented
consistently across all communication channels including HTTP calls, message queues,
event streams, scheduled jobs, and batch processes.

## Rationale

This binding directly implements our explicit-over-implicit tenet by making
cross-service relationships and request flows explicit rather than hidden. When you
propagate context across service boundaries, you're creating a continuous thread of
explicit metadata that ties together otherwise disconnected operations, ensuring that
the full context of a request is preserved even as it travels through multiple
independent services and asynchronous processes.

Think of context propagation like a relay race baton—it contains critical information
that must be passed from one runner to the next to maintain the integrity of the race.
Without the baton, each runner would be disconnected from the team's overall progress
and unable to prove their participation in a specific race. Similarly, without context
propagation, each service becomes an isolated island that can't connect its operations
to the broader transaction flow, making it impossible to trace requests, diagnose issues
across service boundaries, or maintain consistent behavior based on request attributes.

The importance of context propagation grows exponentially as systems become more
distributed. In a monolithic application, context flows naturally through in-memory
function calls, making it relatively easy to trace a request path or maintain state. But
in modern architectures with dozens or hundreds of microservices, serverless functions,
event-driven components, and asynchronous processes, context is easily lost at each
boundary crossing. This context loss creates "visibility gaps" that make root cause
analysis nearly impossible and prevent effective implementation of critical
cross-cutting concerns like observability, security, and tenant isolation.

By consistently propagating context across all service boundaries, you transform a
fragmented collection of disconnected services into a coherent distributed system where
request flows are traceable, debugging is possible across service boundaries, and
critical cross-cutting concerns can be implemented consistently. This explicit context
creates the foundation for effective observability, security, and operational stability
in complex distributed environments.

## Rule Definition

This binding establishes concrete requirements for implementing context propagation:

- **Mandatory Context Fields**: Every request must propagate these standard fields:

  - `correlation_id`: Unique identifier that connects all parts of a distributed
    transaction
  - `causality_token` or `trace_id`: Identifier for tracing the causal path through the
    system
  - `request_id`: Unique identifier for the specific request (different from
    `correlation_id`)
  - `tenant_id`: Identifier for the tenant in multi-tenant systems
  - `user_id`: Identifier for the authenticated user (when applicable)
  - `session_id`: Identifier for the user session (when applicable)
  - `origin_service`: Identifier for the originating service
  - `request_timestamp`: When the original request started
  - `auth_context`: Authentication and authorization context (appropriately secured)

- **Propagation Mechanisms**: Context must be propagated through these channels:

  - HTTP headers for synchronous service-to-service calls
  - Message metadata for asynchronous messaging
  - Event payloads for event-driven communication
  - Database records for data that triggers background processing
  - Metadata fields in file storage when applicable

- **Cross-Language Compatibility**: Context format must be consistent across languages:

  - Use language-agnostic serialization formats
  - Maintain consistent naming conventions
  - Follow W3C Trace Context specification when applicable
  - Preserve type fidelity (UUIDs, timestamps, structured data)

- **Cardinality Control**: For high-cardinality context (like user-specific values):

  - Do not include in metrics to avoid cardinality explosion
  - Consider sampling strategies for high-volume telemetry
  - Hash values when necessary to reduce cardinality while preserving uniqueness

- **Security Considerations**: Context must be handled securely:

  - Sanitize sensitive information before logging
  - Validate and authorize context from external sources
  - Sign or encrypt sensitive context fields when crossing trust boundaries
  - Apply appropriate access controls to context information

- **Generation and Initialization**: Context must be properly established:

  - Generate missing correlation IDs at system boundaries
  - Initialize missing context fields with reasonable defaults
  - Validate required context fields and reject invalid requests
  - Preserve original IDs when they already exist rather than generating new ones

## Practical Implementation

Here are concrete strategies for implementing context propagation effectively:

1. **HTTP Header Propagation**: Implement middleware to handle context in HTTP requests:

   ```typescript
   // TypeScript Express middleware for context propagation
   import { v4 as uuidv4 } from 'uuid';
   import { Request, Response, NextFunction } from 'express';

   // Context interface
   interface RequestContext {
     correlationId: string;
     requestId: string;
     tenantId?: string;
     userId?: string;
     sessionId?: string;
     originService: string;
     requestTimestamp: string;
   }

   // Header names for context propagation
   const HEADER_CORRELATION_ID = 'X-Correlation-ID';
   const HEADER_REQUEST_ID = 'X-Request-ID';
   const HEADER_TENANT_ID = 'X-Tenant-ID';
   const HEADER_USER_ID = 'X-User-ID';
   const HEADER_SESSION_ID = 'X-Session-ID';
   const HEADER_ORIGIN = 'X-Origin-Service';
   const HEADER_TIMESTAMP = 'X-Request-Timestamp';

   // Middleware to extract or create context
   export function contextMiddleware(serviceName: string) {
     return (req: Request, res: Response, next: NextFunction) => {
       // Extract or generate correlation ID
       const correlationId = req.headers[HEADER_CORRELATION_ID.toLowerCase()] as string || uuidv4();

       // Always generate a new request ID for this specific request
       const requestId = uuidv4();

       // Extract other context fields
       const tenantId = req.headers[HEADER_TENANT_ID.toLowerCase()] as string;
       const userId = req.headers[HEADER_USER_ID.toLowerCase()] as string;
       const sessionId = req.headers[HEADER_SESSION_ID.toLowerCase()] as string;
       const originService = req.headers[HEADER_ORIGIN.toLowerCase()] as string || 'unknown';
       const timestamp = req.headers[HEADER_TIMESTAMP.toLowerCase()] as string || new Date().toISOString();

       // Create context object
       const context: RequestContext = {
         correlationId,
         requestId,
         tenantId,
         userId,
         sessionId,
         originService,
         requestTimestamp: timestamp
       };

       // Attach to request object
       req.context = context;

       // Set response headers for downstream consumers
       res.setHeader(HEADER_CORRELATION_ID, correlationId);
       res.setHeader(HEADER_REQUEST_ID, requestId);

       next();
     };
   }

   // HTTP client wrapper that propagates context
   export function createHttpClient(baseURL: string, serviceName: string) {
     const client = axios.create({ baseURL });

     // Add request interceptor to inject context headers
     client.interceptors.request.use(config => {
       const context = getActiveContext();

       if (context) {
         config.headers = config.headers || {};
         config.headers[HEADER_CORRELATION_ID] = context.correlationId;
         config.headers[HEADER_REQUEST_ID] = uuidv4(); // New request ID for this specific call

         if (context.tenantId) config.headers[HEADER_TENANT_ID] = context.tenantId;
         if (context.userId) config.headers[HEADER_USER_ID] = context.userId;
         if (context.sessionId) config.headers[HEADER_SESSION_ID] = context.sessionId;

         config.headers[HEADER_ORIGIN] = serviceName;
         config.headers[HEADER_TIMESTAMP] = context.requestTimestamp;
       }

       return config;
     });

     return client;
   }
   ```

1. **Message Queue Context Propagation**: Implement context for asynchronous messaging:

   ```typescript
   // Message producer with context propagation
   interface Message<T> {
     payload: T;
     metadata: {
       correlationId: string;
       messageId: string;
       causality: {
         parentId?: string;
         rootId: string;
       };
       origin: {
         service: string;
         timestamp: string;
       };
       context: {
         tenantId?: string;
         userId?: string;
         sessionId?: string;
         [key: string]: unknown;
       };
     };
   }

   class MessageProducer {
     private serviceName: string;
     private client: any; // Message broker client

     constructor(client: any, serviceName: string) {
       this.client = client;
       this.serviceName = serviceName;
     }

     async sendMessage<T>(topic: string, payload: T): Promise<void> {
       const context = getActiveContext();

       const message: Message<T> = {
         payload,
         metadata: {
           correlationId: context?.correlationId || uuidv4(),
           messageId: uuidv4(),
           causality: {
             parentId: context?.requestId,
             rootId: context?.correlationId || uuidv4()
           },
           origin: {
             service: this.serviceName,
             timestamp: new Date().toISOString()
           },
           context: {
             tenantId: context?.tenantId,
             userId: context?.userId,
             sessionId: context?.sessionId
           }
         }
       };

       await this.client.send(topic, message);
     }
   }

   // Message consumer that extracts context
   class MessageConsumer {
     private serviceName: string;

     constructor(serviceName: string) {
       this.serviceName = serviceName;
     }

     async processMessage<T>(message: Message<T>, handler: (payload: T) => Promise<void>): Promise<void> {
       // Extract context from message
       const metadata = message.metadata;

       // Set up context for this processing operation
       const context: RequestContext = {
         correlationId: metadata.correlationId,
         requestId: metadata.messageId,
         tenantId: metadata.context.tenantId,
         userId: metadata.context.userId,
         sessionId: metadata.context.sessionId,
         originService: metadata.origin.service,
         requestTimestamp: metadata.origin.timestamp
       };

       // Set active context for this async operation
       setActiveContext(context);

       try {
         // Process message with active context available
         await handler(message.payload);
       } finally {
         // Clear active context
         clearActiveContext();
       }
     }
   }
   ```

1. **Async Local Storage for Context Propagation**: Implement context that spans async
   operations:

   ```typescript
   // Using AsyncLocalStorage in Node.js for request context
   import { AsyncLocalStorage } from 'async_hooks';

   const contextStorage = new AsyncLocalStorage<RequestContext>();

   // Get the current active context
   export function getActiveContext(): RequestContext | undefined {
     return contextStorage.getStore();
   }

   // Set context for a function execution and all its async operations
   export function withContext<T>(context: RequestContext, fn: () => T): T {
     return contextStorage.run(context, fn);
   }

   // Middleware that sets context for the request lifecycle
   export function contextMiddleware(serviceName: string) {
     return (req: Request, res: Response, next: NextFunction) => {
       // Create context as before...

       // Run the rest of the request handler with this context
       contextStorage.run(context, next);
     };
   }
   ```

1. **Context Propagation in Go**: Implement context propagation in Go using the context
   package:

   ```go
   package context

   import (
     "context"
     "net/http"
     "github.com/google/uuid"
   )

   // ContextKey type for type-safe context keys
   type ContextKey string

   // Context keys
   const (
     CorrelationIDKey ContextKey = "correlation_id"
     RequestIDKey     ContextKey = "request_id"
     TenantIDKey      ContextKey = "tenant_id"
     UserIDKey        ContextKey = "user_id"
     SessionIDKey     ContextKey = "session_id"
     OriginServiceKey ContextKey = "origin_service"
     TimestampKey     ContextKey = "request_timestamp"
   )

   // Header names
   const (
     HeaderCorrelationID = "X-Correlation-ID"
     HeaderRequestID     = "X-Request-ID"
     HeaderTenantID      = "X-Tenant-ID"
     HeaderUserID        = "X-User-ID"
     HeaderSessionID     = "X-Session-ID"
     HeaderOrigin        = "X-Origin-Service"
     HeaderTimestamp     = "X-Request-Timestamp"
   )

   // ExtractOrCreateContext extracts context from HTTP headers or creates new values
   func ExtractOrCreateContext(r *http.Request, serviceName string) context.Context {
     ctx := r.Context()

     // Extract or generate correlation ID
     correlationID := r.Header.Get(HeaderCorrelationID)
     if correlationID == "" {
       correlationID = uuid.New().String()
     }
     ctx = context.WithValue(ctx, CorrelationIDKey, correlationID)

     // Generate a new request ID
     requestID := uuid.New().String()
     ctx = context.WithValue(ctx, RequestIDKey, requestID)

     // Extract other context values
     if tenantID := r.Header.Get(HeaderTenantID); tenantID != "" {
       ctx = context.WithValue(ctx, TenantIDKey, tenantID)
     }

     if userID := r.Header.Get(HeaderUserID); userID != "" {
       ctx = context.WithValue(ctx, UserIDKey, userID)
     }

     if sessionID := r.Header.Get(HeaderSessionID); sessionID != "" {
       ctx = context.WithValue(ctx, SessionIDKey, sessionID)
     }

     // Set origin service
     originService := r.Header.Get(HeaderOrigin)
     if originService == "" {
       originService = "unknown"
     }
     ctx = context.WithValue(ctx, OriginServiceKey, originService)

     // Set timestamp
     timestamp := r.Header.Get(HeaderTimestamp)
     if timestamp == "" {
       timestamp = time.Now().UTC().Format(time.RFC3339)
     }
     ctx = context.WithValue(ctx, TimestampKey, timestamp)

     return ctx
   }

   // InjectContextHeaders injects context values into outgoing HTTP request headers
   func InjectContextHeaders(ctx context.Context, req *http.Request, serviceName string) {
     // Add correlation ID
     if correlationID, ok := ctx.Value(CorrelationIDKey).(string); ok && correlationID != "" {
       req.Header.Set(HeaderCorrelationID, correlationID)
     }

     // Generate a new request ID for this specific call
     req.Header.Set(HeaderRequestID, uuid.New().String())

     // Add other context fields if present
     if tenantID, ok := ctx.Value(TenantIDKey).(string); ok && tenantID != "" {
       req.Header.Set(HeaderTenantID, tenantID)
     }

     if userID, ok := ctx.Value(UserIDKey).(string); ok && userID != "" {
       req.Header.Set(HeaderUserID, userID)
     }

     if sessionID, ok := ctx.Value(SessionIDKey).(string); ok && sessionID != "" {
       req.Header.Set(HeaderSessionID, sessionID)
     }

     // Set origin service
     req.Header.Set(HeaderOrigin, serviceName)

     // Set or pass along timestamp
     if timestamp, ok := ctx.Value(TimestampKey).(string); ok && timestamp != "" {
       req.Header.Set(HeaderTimestamp, timestamp)
     } else {
       req.Header.Set(HeaderTimestamp, time.Now().UTC().Format(time.RFC3339))
     }
   }
   ```

1. **Database Context Storage**: Store context with data for asynchronous processing:

   ```typescript
   // Include context in database records for background processing
   interface JobRecord {
     id: string;
     type: string;
     status: 'pending' | 'processing' | 'completed' | 'failed';
     payload: any;
     result?: any;
     error?: string;
     created_at: Date;
     updated_at: Date;

     // Context information for traceability
     context: {
       correlation_id: string;
       request_id: string;
       tenant_id?: string;
       user_id?: string;
       origin_service: string;
       created_timestamp: string;
     };
   }

   // When creating a new job
   async function createJob(type: string, payload: any): Promise<string> {
     const context = getActiveContext();

     const job: JobRecord = {
       id: uuidv4(),
       type,
       status: 'pending',
       payload,
       created_at: new Date(),
       updated_at: new Date(),

       // Store context with the job
       context: {
         correlation_id: context?.correlationId || uuidv4(),
         request_id: context?.requestId || uuidv4(),
         tenant_id: context?.tenantId,
         user_id: context?.userId,
         origin_service: context?.originService || 'unknown',
         created_timestamp: new Date().toISOString()
       }
     };

     await db.collection('jobs').insertOne(job);
     return job.id;
   }

   // When processing a job, restore the context
   async function processJob(jobId: string): Promise<void> {
     const job = await db.collection('jobs').findOne({ id: jobId });

     if (!job) {
       throw new Error(`Job ${jobId} not found`);
     }

     // Restore context from the job record
     const context: RequestContext = {
       correlationId: job.context.correlation_id,
       requestId: job.context.request_id,
       tenantId: job.context.tenant_id,
       userId: job.context.user_id,
       originService: job.context.origin_service,
       requestTimestamp: job.context.created_timestamp
     };

     // Run job processing with the restored context
     await withContext(context, async () => {
       try {
         // Process the job...
         job.status = 'completed';
         job.result = { /* job result */ };
       } catch (error) {
         job.status = 'failed';
         job.error = error.message;
         throw error;
       } finally {
         job.updated_at = new Date();
         await db.collection('jobs').updateOne(
           { id: job.id },
           { $set: { status: job.status, result: job.result, error: job.error, updated_at: job.updated_at } }
         );
       }
     });
   }
   ```

## Examples

```typescript
// ❌ BAD: No context propagation between services
// Service A
app.post('/orders', async (req, res) => {
  const order = await createOrder(req.body);

  // Make call to inventory service without context
  await axios.post('http://inventory-service/reserve', {
    items: order.items
  });

  // Log without context
  console.log(`Created order ${order.id}`);

  res.json(order);
});

// Service B (inventory)
app.post('/reserve', (req, res) => {
  // No context about which order triggered this
  const result = reserveInventory(req.body.items);

  // Log without context
  console.log('Reserved inventory');

  res.json(result);
});
```

```typescript
// ✅ GOOD: Context propagated between services
// Service A
app.post('/orders', contextMiddleware('order-service'), async (req, res) => {
  const context = req.context;
  const order = await createOrder(req.body);

  // Log with context
  logger.info({
    event: 'order_created',
    order_id: order.id,
    correlation_id: context.correlationId,
    request_id: context.requestId,
    tenant_id: context.tenantId
  }, 'Order created successfully');

  // Make call to inventory service with context
  const httpClient = createHttpClient('http://inventory-service', 'order-service');
  await httpClient.post('/reserve', {
    items: order.items,
    order_id: order.id
  });

  res.json(order);
});

// Service B (inventory)
app.post('/reserve', contextMiddleware('inventory-service'), (req, res) => {
  const context = req.context;

  // Log with propagated context
  logger.info({
    event: 'inventory_reservation_started',
    order_id: req.body.order_id,
    item_count: req.body.items.length,
    correlation_id: context.correlationId,
    request_id: context.requestId,
    tenant_id: context.tenantId
  }, 'Starting inventory reservation');

  const result = reserveInventory(req.body.items);

  // Response includes context headers automatically via middleware
  res.json(result);
});
```

```go
// ❌ BAD: Background processing without context
func ProcessOrders() {
  orders := fetchPendingOrders()

  for _, order := range orders {
    // Process each order without context
    processOrder(order)

    // Send notification without context
    sendNotification("order_processed", map[string]interface{}{
      "order_id": order.ID,
    })

    // Log without context
    log.Printf("Processed order %s", order.ID)
  }
}
```

```go
// ✅ GOOD: Background processing with context restoration
func ProcessOrders() {
  orders := fetchPendingOrders()

  for _, order := range orders {
    // Create a context from stored values
    ctx := context.Background()
    ctx = context.WithValue(ctx, CorrelationIDKey, order.CorrelationID)
    ctx = context.WithValue(ctx, RequestIDKey, uuid.New().String())
    ctx = context.WithValue(ctx, TenantIDKey, order.TenantID)
    ctx = context.WithValue(ctx, UserIDKey, order.UserID)
    ctx = context.WithValue(ctx, OriginServiceKey, "order-processor")

    // Process with context
    processOrderWithContext(ctx, order)

    // Create notification with context
    notification := createNotificationWithContext(ctx, "order_processed", map[string]interface{}{
      "order_id": order.ID,
    })
    sendNotification(notification)

    // Log with context
    logger := createLoggerWithContext(ctx)
    logger.Info("Processed order successfully",
      zap.String("order_id", order.ID),
      zap.String("status", order.Status),
    )
  }
}
```

```typescript
// ❌ BAD: Event publishing without context
async function publishOrderEvent(event: string, data: any) {
  await eventBus.publish('orders', {
    event,
    timestamp: new Date().toISOString(),
    data
  });
}
```

```typescript
// ✅ GOOD: Event publishing with context
async function publishOrderEvent(event: string, data: any) {
  const context = getActiveContext();

  await eventBus.publish('orders', {
    event,
    timestamp: new Date().toISOString(),
    data,
    context: {
      correlation_id: context?.correlationId || uuidv4(),
      event_id: uuidv4(),
      origin: {
        service: 'order-service',
        request_id: context?.requestId
      },
      tenant_id: context?.tenantId,
      user_id: context?.userId
    }
  });
}
```

## Related Bindings

- [use-structured-logging](../../docs/bindings/core/use-structured-logging.md): Context propagation and
  structured logging work hand-in-hand to create comprehensive observability. When
  context is propagated across services, structured logs can include consistent
  correlation IDs and other context fields, allowing logs from different services to be
  connected into a complete picture of distributed transactions. These bindings together
  transform disconnected log entries into a coherent narrative across service
  boundaries.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): For effective context propagation,
  services should depend on context abstractions rather than specific implementations.
  This allows for different context propagation strategies in different environments
  (HTTP, message queues, etc.) while maintaining consistent behavior. By applying
  dependency inversion to context handling, systems can evolve their propagation
  mechanisms independently of business logic.

- [explicit-over-implicit](../../docs/tenets/explicit-over-implicit.md): Context propagation is
  a direct application of making implicit relationships explicit. Without context
  propagation, the relationships between distributed operations remain implicit and
  invisible; with it, these relationships become explicit and traceable. This binding
  enforces the explicitness principle at the distributed systems level.

- [testability](../../docs/tenets/testability.md): Good context propagation improves testability
  by making it easier to track and validate cross-service interactions. Tests can verify
  that context is properly maintained across boundaries, and debugging becomes much
  easier when distributed transactions maintain their context. By propagating context
  consistently, systems become more observable and therefore more testable.
