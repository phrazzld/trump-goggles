---
id: unified-documentation
last_modified: '2025-06-02'
derived_from: dry-dont-repeat-yourself
enforced_by: 'Documentation tools, content review, automated generation'
---

# Binding: Maintain Single Source Documentation

Create a unified documentation system where each piece of knowledge is documented once in an authoritative location and referenced from all other locations that need it. This eliminates documentation duplication, inconsistencies, and maintenance overhead.

## Rationale

This binding implements our DRY tenet by ensuring that knowledge about system behavior, APIs, processes, and decisions exists in exactly one place. When the same information is documented in multiple locations—README files, wiki pages, code comments, API docs, user manuals—you create a maintenance nightmare where updates must be applied everywhere or the documentation becomes inconsistent and unreliable.

Think of unified documentation like having a single, authoritative encyclopedia for your organization. Instead of maintaining separate books that cover overlapping topics (and inevitably contradict each other), you maintain one comprehensive source that everyone references. When information changes, you update it once and everyone automatically gets the correct, current information.

Duplicated documentation is worse than no documentation because it actively misleads people. Developers will waste time following outdated instructions, users will be confused by conflicting information, and teams will make decisions based on stale knowledge. The overhead of keeping multiple documentation sources synchronized often leads to documentation rot, where all versions become outdated and untrustworthy.

## Rule Definition

Unified documentation must establish these organizational principles:

- **Single Authoritative Source**: Each piece of knowledge must have exactly one canonical location where it is documented in full detail. All other references should link to this authoritative source rather than duplicating the information.

- **Hierarchical Information Architecture**: Organize documentation in a clear hierarchy that makes it easy to find the canonical location for any piece of information. Use consistent categorization and navigation patterns.

- **Generated Documentation**: Whenever possible, generate documentation directly from authoritative sources like code, configuration files, or schemas rather than maintaining separate documentation that can drift out of sync.

- **Reference-Based Linking**: When information from one document is needed in another context, use references, links, or includes rather than copying the content. This ensures that updates automatically propagate to all consumers.

- **Versioning and Change Management**: Track changes to documentation and maintain version history so that updates can be traced and reverted if necessary.

**Documentation Types:**
- API documentation (generated from code annotations)
- System architecture and design decisions
- Operational procedures and runbooks
- User guides and tutorials
- Code comments and inline documentation
- Configuration and deployment guides

**Consolidation Strategies:**
- Use documentation-as-code approaches where docs live with the code
- Generate API docs from code annotations or schema definitions
- Create centralized decision logs and architectural decision records
- Use content management systems with proper linking and referencing

## Practical Implementation

1. **Generate from Single Sources**: Use tools that automatically generate documentation from code, schemas, configuration files, or other authoritative sources. This ensures documentation stays synchronized with implementation.

2. **Implement Content Includes**: Use documentation systems that support content inclusion, allowing you to write information once and include it in multiple contexts without duplication.

3. **Create Cross-Reference Systems**: Build comprehensive linking between related documentation pieces, making it easy to navigate from one piece of information to related concepts without duplicating content.

4. **Establish Documentation Ownership**: Assign clear ownership for each documentation area to ensure that there's always someone responsible for keeping information current and authoritative.

5. **Use Living Documentation**: Implement systems where documentation is automatically updated when the underlying systems change, reducing the maintenance burden and eliminating staleness.

## Examples

```typescript
// ❌ BAD: Documentation duplicated across multiple locations
// README.md
/**
 * User API
 *
 * POST /api/users
 * Creates a new user account
 *
 * Request Body:
 * - name: string (required, 2-50 characters)
 * - email: string (required, valid email format)
 * - password: string (required, minimum 8 characters)
 *
 * Response: 201 with user ID
 */

// api-docs.md (separate file with similar but slightly different info)
/**
 * User Creation Endpoint
 *
 * Endpoint: POST /api/users
 * Purpose: Create user accounts
 *
 * Parameters:
 * - name: string, required, length 2-100 chars  // Different length requirement!
 * - email: string, required, must be valid
 * - password: string, required, min 8 chars
 *
 * Returns: 201 status with user object
 */

// Code comments (third copy with more differences)
class UserController {
  /**
   * Creates a new user
   * @param name - User's full name (3-50 characters)  // Different minimum!
   * @param email - Valid email address
   * @param password - Password (minimum 6 characters)  // Different requirement!
   */
  async createUser(name: string, email: string, password: string) {
    // Implementation...
  }
}

// Swagger/OpenAPI spec (fourth copy, potentially different again)
{
  "paths": {
    "/api/users": {
      "post": {
        "summary": "Create user",
        "requestBody": {
          "properties": {
            "name": {
              "type": "string",
              "minLength": 2,
              "maxLength": 60  // Yet another different max length!
            },
            "email": {
              "type": "string",
              "format": "email"
            },
            "password": {
              "type": "string",
              "minLength": 10  // Different minimum again!
            }
          }
        }
      }
    }
  }
}

// ✅ GOOD: Single source of truth with generated documentation
// schema/user.schema.ts - Single authoritative definition
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .describe('User\'s full name'),

  email: z.string()
    .email('Must be a valid email address')
    .describe('User\'s email address (used for login)'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .describe('User password meeting security requirements')
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// API implementation uses schema for validation
class UserController {
  /**
   * Creates a new user account
   *
   * Validation rules are defined in CreateUserSchema.
   * See schema/user.schema.ts for complete field requirements.
   */
  async createUser(req: Request, res: Response) {
    try {
      // Single source of truth for validation
      const userData = CreateUserSchema.parse(req.body);

      const user = await this.userService.createUser(userData);
      res.status(201).json({ userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

// OpenAPI specification generated from schema
import { generateSchema } from '@anatine/zod-openapi';

export const openApiSpec = {
  paths: {
    '/api/users': {
      post: {
        summary: 'Create a new user account',
        description: 'Creates a new user with the provided information. All validation rules are enforced according to the CreateUserSchema.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: generateSchema(CreateUserSchema)  // Generated from single source
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string', description: 'Unique identifier for the created user' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error - see CreateUserSchema for requirements'
          }
        }
      }
    }
  }
};

// README.md references the authoritative source
/**
 * # User API
 *
 * ## Creating Users
 *
 * **Endpoint:** `POST /api/users`
 *
 * **Validation:** All request validation is defined in `schema/user.schema.ts` using the `CreateUserSchema`.
 * See that file for complete and current field requirements.
 *
 * **Generated Documentation:** Complete API documentation with current validation rules
 * is available at `/api-docs` (generated from schema).
 *
 * **Example Request:**
 * ```json
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass123"
 * }
 * ```
 *
 * For complete field requirements and validation rules, see the schema definition.
 */
```

```python
# ❌ BAD: Configuration documentation scattered and duplicated
# README.md
"""
Configuration:
- DATABASE_URL: PostgreSQL connection string
- REDIS_URL: Redis connection string
- SECRET_KEY: Application secret (32+ chars)
- DEBUG: Enable debug mode (true/false)
"""

# config.py (different documentation)
class Config:
    # Database connection string (format: postgresql://user:pass@host/db)
    DATABASE_URL = os.environ.get('DATABASE_URL')

    # Redis URL (format: redis://host:port)
    REDIS_URL = os.environ.get('REDIS_URL')

    # Secret key for sessions (minimum 16 characters)  # Different requirement!
    SECRET_KEY = os.environ.get('SECRET_KEY')

    # Debug flag (set to 'true' to enable)
    DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

# deployment.md (third copy, potentially outdated)
"""
Required Environment Variables:
- DATABASE_URL: Postgres URL
- REDIS_URL: Redis URL
- SECRET_KEY: Secret key (64+ chars recommended)  # Different again!
- DEBUG: Debug mode (default: false)
- LOG_LEVEL: Logging level  # Missing from other docs!
"""

# ✅ GOOD: Single source configuration with generated documentation
# config/schema.py - Authoritative configuration definition
from dataclasses import dataclass, field
from typing import Optional
import os
from enum import Enum

class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"

@dataclass
class ConfigurationSchema:
    """
    Application configuration schema.

    This is the single source of truth for all configuration options.
    Environment variable documentation and validation is generated from this schema.
    """

    # Database Configuration
    database_url: str = field(
        metadata={
            'env_var': 'DATABASE_URL',
            'description': 'PostgreSQL connection string',
            'example': 'postgresql://user:password@localhost:5432/myapp',
            'required': True,
            'validation': 'Must be a valid PostgreSQL URL starting with postgresql://'
        }
    )

    # Cache Configuration
    redis_url: str = field(
        metadata={
            'env_var': 'REDIS_URL',
            'description': 'Redis connection string for caching and sessions',
            'example': 'redis://localhost:6379/0',
            'required': True,
            'validation': 'Must be a valid Redis URL starting with redis://'
        }
    )

    # Security Configuration
    secret_key: str = field(
        metadata={
            'env_var': 'SECRET_KEY',
            'description': 'Secret key for cryptographic operations and session signing',
            'example': 'your-secret-key-here-make-it-long-and-random',
            'required': True,
            'validation': 'Must be at least 32 characters long for security',
            'sensitive': True
        }
    )

    # Application Configuration
    debug: bool = field(
        default=False,
        metadata={
            'env_var': 'DEBUG',
            'description': 'Enable debug mode for development',
            'example': 'true',
            'required': False,
            'validation': 'Must be true or false'
        }
    )

    log_level: LogLevel = field(
        default=LogLevel.INFO,
        metadata={
            'env_var': 'LOG_LEVEL',
            'description': 'Minimum logging level',
            'example': 'INFO',
            'required': False,
            'validation': f'Must be one of: {", ".join([level.value for level in LogLevel])}'
        }
    )

    # API Configuration
    api_rate_limit: int = field(
        default=100,
        metadata={
            'env_var': 'API_RATE_LIMIT',
            'description': 'Maximum API requests per minute per client',
            'example': '100',
            'required': False,
            'validation': 'Must be a positive integer'
        }
    )

# config/generator.py - Documentation generation from schema
import inspect
from typing import get_type_hints
from dataclasses import fields

class ConfigurationDocumentationGenerator:
    """Generates documentation from ConfigurationSchema"""

    @staticmethod
    def generate_env_vars_table() -> str:
        """Generate markdown table of environment variables"""
        schema_fields = fields(ConfigurationSchema)

        table = "| Variable | Description | Required | Example | Validation |\n"
        table += "|----------|-------------|----------|---------|------------|\n"

        for field in schema_fields:
            metadata = field.metadata
            env_var = metadata.get('env_var', field.name.upper())
            description = metadata.get('description', 'No description')
            required = 'Yes' if metadata.get('required', False) else 'No'
            example = metadata.get('example', '')
            validation = metadata.get('validation', 'None')

            # Mask sensitive fields in examples
            if metadata.get('sensitive', False):
                example = '[REDACTED]'

            table += f"| `{env_var}` | {description} | {required} | `{example}` | {validation} |\n"

        return table

    @staticmethod
    def generate_example_env_file() -> str:
        """Generate .env file template"""
        schema_fields = fields(ConfigurationSchema)

        content = "# Application Configuration\n"
        content += "# Generated from ConfigurationSchema - DO NOT EDIT MANUALLY\n\n"

        current_section = ""
        for field in schema_fields:
            metadata = field.metadata

            # Group by field type (simple categorization)
            if 'database' in field.name:
                section = "Database Configuration"
            elif 'redis' in field.name:
                section = "Cache Configuration"
            elif 'secret' in field.name or 'key' in field.name:
                section = "Security Configuration"
            elif 'api' in field.name:
                section = "API Configuration"
            else:
                section = "Application Configuration"

            if section != current_section:
                content += f"\n# {section}\n"
                current_section = section

            env_var = metadata.get('env_var', field.name.upper())
            description = metadata.get('description', '')
            example = metadata.get('example', '')
            required = metadata.get('required', False)

            content += f"# {description}\n"
            if required:
                content += f"# REQUIRED\n"

            if metadata.get('sensitive', False):
                content += f"{env_var}=your-secret-value-here\n"
            else:
                content += f"{env_var}={example}\n"

            content += "\n"

        return content

# Auto-generated documentation files
def generate_documentation():
    """Generate all configuration documentation from schema"""
    generator = ConfigurationDocumentationGenerator()

    # Generate environment variables documentation
    env_vars_md = f"""# Configuration Reference

This documentation is automatically generated from `config/schema.py`.
Do not edit this file manually - update the schema instead.

## Environment Variables

{generator.generate_env_vars_table()}

## Environment File Template

See `.env.example` for a complete template file.
"""

    with open('docs/configuration.md', 'w') as f:
        f.write(env_vars_md)

    # Generate .env.example file
    env_example = generator.generate_example_env_file()
    with open('.env.example', 'w') as f:
        f.write(env_example)

    print("Configuration documentation generated successfully!")

# Usage in application
from config.schema import ConfigurationSchema

class ConfigurationManager:
    def __init__(self):
        self.schema = ConfigurationSchema(
            database_url=self._require_env('DATABASE_URL'),
            redis_url=self._require_env('REDIS_URL'),
            secret_key=self._require_env('SECRET_KEY'),
            debug=os.environ.get('DEBUG', 'false').lower() == 'true',
            log_level=LogLevel(os.environ.get('LOG_LEVEL', 'INFO')),
            api_rate_limit=int(os.environ.get('API_RATE_LIMIT', '100'))
        )
        self.validate()

    def validate(self):
        """Validate configuration against schema requirements"""
        # Validation rules come from the same schema
        if len(self.schema.secret_key) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters (see config schema)")

        if not self.schema.database_url.startswith('postgresql://'):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL URL (see config schema)")

# README.md references the authoritative source
"""
# Configuration

All configuration is defined in `config/schema.py` using the `ConfigurationSchema` dataclass.
This serves as the single source of truth for all configuration options.

## Documentation

- **Complete reference:** See `docs/configuration.md` (auto-generated from schema)
- **Environment template:** Copy `.env.example` to `.env` and fill in values
- **Schema definition:** See `config/schema.py` for validation rules and descriptions

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in required values (marked as REQUIRED in the file)
3. Run the application

All configuration documentation is automatically generated from the schema,
ensuring it stays current with the actual implementation.
"""
```

## Related Bindings

- [centralized-configuration.md](../../docs/bindings/core/centralized-configuration.md): Both bindings eliminate duplication, but unified documentation focuses on knowledge and information while centralized configuration focuses on settings and parameters. They work together to create comprehensive single-source-of-truth systems.

- [api-design.md](../../docs/bindings/core/api-design.md): API documentation should be unified and generated from authoritative sources like schemas or code annotations. This ensures that API documentation stays synchronized with actual implementation and provides a single source of truth for API behavior.

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Quality gates can enforce documentation standards by checking for duplication, validating that documentation is generated from authoritative sources, and ensuring that documentation stays synchronized with code changes.

- [extract-common-logic.md](../../docs/bindings/core/extract-common-logic.md): Just as common logic should be extracted to avoid duplication, common documentation patterns and content should be extracted and reused rather than duplicated across multiple documents. Both bindings support the DRY principle at different levels of the system.
