import { OpenAPIV3 } from 'openapi-types';

interface TagGroup {
  name: string;
  tags: string[];
}

interface OpenAPIDocumentWithTagGroups extends OpenAPIV3.Document {
  'x-tagGroups'?: TagGroup[];
}

export const openApiSpec: OpenAPIDocumentWithTagGroups = {
  openapi: '3.0.0',
  info: {
    title: 'LEMS API',
    version: '1.4.0',
    description: `
# LEMS API Documentation

Welcome to the LEMS (LEGO Education Management System) REST API documentation.

This API provides endpoints for managing FIRST LEGO League events, teams, users, and more.

## Authentication

Most endpoints require authentication via JWT tokens stored in HTTP-only cookies:
- **Admin endpoints** (\`/admin/*\`): Require \`admin-auth-token\` cookie
- **LEMS endpoints** (\`/lems/*\`): Require \`lems-auth-token\` cookie (for volunteers)
- **Portal endpoints** (\`/portal/*\`): Public access (no authentication required)
- **Scheduler endpoints** (\`/scheduler/*\`): Require \`scheduler-auth-token\` cookie

## Rate Limiting

Login endpoints are rate-limited to 10 requests per minute per IP address.

## GraphQL

In addition to these REST endpoints, LEMS provides a comprehensive GraphQL API at \`/lems/graphql\`.
For GraphQL schema documentation, see the Schema page in the admin panel.
    `.trim(),
    contact: {
      name: 'FIRST Israel',
      url: 'https://firstisrael.org.il'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Development server'
    },
    {
      url: 'https://lems.firstisrael.org.il',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'LEMS - Auth', description: 'Volunteer authentication' },
    { name: 'Admin - Auth', description: 'Admin authentication' },
    { name: 'Admin - Users', description: 'Admin user management' },
    { name: 'Admin - Teams', description: 'Team management' },
    { name: 'Admin - Seasons', description: 'Season management' },
    { name: 'Admin - Events', description: 'Event management' },
    { name: 'Portal - Search', description: 'Search teams and events' },
    { name: 'Portal - Seasons', description: 'Public season information' },
    { name: 'Portal - Teams', description: 'Public team information' },
    { name: 'Portal - Events', description: 'Public event information' },
    { name: 'Scheduler - Auth', description: 'Scheduler authentication' },
    { name: 'Scheduler - Divisions', description: 'Division management' }
  ],
  'x-tagGroups': [
    {
      name: 'General',
      tags: ['Health']
    },
    {
      name: 'LEMS (Volunteer)',
      tags: ['LEMS - Auth']
    },
    {
      name: 'Admin',
      tags: ['Admin - Auth', 'Admin - Users', 'Admin - Teams', 'Admin - Seasons', 'Admin - Events']
    },
    {
      name: 'Portal (Public)',
      tags: ['Portal - Search', 'Portal - Seasons', 'Portal - Teams', 'Portal - Events']
    },
    {
      name: 'Scheduler',
      tags: ['Scheduler - Auth', 'Scheduler - Divisions']
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check if the API server is running',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/lems/auth/login': {
      post: {
        tags: ['LEMS - Auth'],
        summary: 'Volunteer login',
        description: 'Authenticate a volunteer user and receive a JWT token cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'password'],
                properties: {
                  userId: {
                    type: 'string',
                    description: 'Volunteer user ID',
                    example: 'volunteer123'
                  },
                  password: {
                    type: 'string',
                    description: 'User password',
                    example: 'password123'
                  },
                  captchaToken: {
                    type: 'string',
                    description: 'reCAPTCHA token (required when RECAPTCHA=true)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                  example: 'lems-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    loginTime: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Missing credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'MISSING_CREDENTIALS' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'INVALID_CREDENTIALS' }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'USER_ID_NOT_FOUND' }
              }
            }
          },
          '429': {
            description: 'Too many requests',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'TOO_MANY_REQUESTS' }
              }
            }
          }
        }
      }
    },
    '/lems/auth/logout': {
      post: {
        tags: ['LEMS - Auth'],
        summary: 'Volunteer logout',
        description: 'Clear the authentication cookie',
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/lems/auth/verify': {
      get: {
        tags: ['LEMS - Auth'],
        summary: 'Verify volunteer authentication',
        description: 'Check if the current user is authenticated',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'User is authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/LemsUser' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/admin/auth/login': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Admin login',
        description: 'Authenticate an admin user and receive a JWT token cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: {
                    type: 'string',
                    description: 'Admin username',
                    example: 'admin'
                  },
                  password: {
                    type: 'string',
                    description: 'Admin password',
                    example: 'password123'
                  },
                  captchaToken: {
                    type: 'string',
                    description: 'reCAPTCHA token (required when RECAPTCHA=true)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                  example: 'admin-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    loginTime: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' }
        }
      }
    },
    '/admin/auth/logout': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Admin logout',
        description: 'Clear the admin authentication cookie',
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/admin/auth/verify': {
      get: {
        tags: ['Admin - Auth'],
        summary: 'Verify admin authentication',
        description: 'Check if the current user is authenticated as admin',
        security: [{ adminCookieAuth: [] }],
        responses: {
          '200': {
            description: 'User is authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/AdminUser' }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/admin/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get all admin users',
        description: 'Retrieve a list of all admin users',
        security: [{ adminCookieAuth: [] }],
        responses: {
          '200': {
            description: 'List of admin users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AdminUser' }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/admin/users/me': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get current admin user',
        description: 'Retrieve the currently authenticated admin user',
        security: [{ adminCookieAuth: [] }],
        responses: {
          '200': {
            description: 'Current admin user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUser' }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/admin/users/{userId}': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get admin user by ID',
        description: 'Retrieve a specific admin user',
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Admin user ID'
          }
        ],
        responses: {
          '200': {
            description: 'Admin user details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUser' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      },
      patch: {
        tags: ['Admin - Users'],
        summary: 'Update admin user',
        description:
          "Update an admin user's profile information. Requires MANAGE_USERS permission.",
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Admin user ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Updated admin user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUser' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Admin - Users'],
        summary: 'Delete admin user',
        description:
          'Delete an admin user. Requires MANAGE_USERS permission. Cannot delete yourself.',
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Admin user ID'
          }
        ],
        responses: {
          '204': { description: 'User deleted successfully' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': {
            description: 'Forbidden - Cannot delete yourself',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'CANNOT_DELETE_SELF' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/admin/users/{userId}/password': {
      patch: {
        tags: ['Admin - Users'],
        summary: 'Update admin user password',
        description: "Update an admin user's password. Requires MANAGE_USERS permission.",
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Admin user ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: { type: 'string', description: 'New password' }
                }
              }
            }
          }
        },
        responses: {
          '204': { description: 'Password updated successfully' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/admin/teams': {
      get: {
        tags: ['Admin - Teams'],
        summary: 'Get all teams',
        description: 'Retrieve a list of all teams with their active status',
        security: [{ adminCookieAuth: [] }],
        responses: {
          '200': {
            description: 'List of teams',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AdminTeam' }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Admin - Teams'],
        summary: 'Create new team',
        description:
          'Create a new team. Requires MANAGE_TEAMS permission. Supports multipart/form-data for logo upload.',
        security: [{ adminCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'number', 'affiliation', 'city', 'region'],
                properties: {
                  name: { type: 'string', description: 'Team name' },
                  number: { type: 'integer', description: 'Team number' },
                  affiliation: { type: 'string', description: 'Team affiliation/school' },
                  city: { type: 'string', description: 'Team city' },
                  region: {
                    type: 'string',
                    description: 'Team region code',
                    example: 'IL'
                  },
                  logo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Team logo image (JPG, PNG, or SVG)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Team created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminTeam' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': {
            description: 'Team number already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Team number already exists' }
              }
            }
          }
        }
      }
    },
    '/admin/teams/import': {
      post: {
        tags: ['Admin - Teams'],
        summary: 'Import teams from CSV',
        description: 'Import multiple teams from a CSV file. Requires MANAGE_TEAMS permission.',
        security: [{ adminCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'CSV file containing team data'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Teams imported successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    created: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AdminTeam' }
                    },
                    updated: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AdminTeam' }
                    }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/admin/teams/{teamId}': {
      get: {
        tags: ['Admin - Teams'],
        summary: 'Get team by ID',
        description: 'Retrieve a specific team',
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'teamId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Team ID'
          }
        ],
        responses: {
          '200': {
            description: 'Team details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminTeam' }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Admin - Teams'],
        summary: 'Update team',
        description: "Update a team's information. Requires MANAGE_TEAMS permission.",
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'teamId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Team ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'affiliation', 'city'],
                properties: {
                  name: { type: 'string' },
                  affiliation: { type: 'string' },
                  city: { type: 'string' },
                  logo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Team logo image (JPG, PNG, or SVG)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Team updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminTeam' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Admin - Teams'],
        summary: 'Delete team',
        description:
          'Delete a team. Requires MANAGE_TEAMS permission. Cannot delete teams registered for events.',
        security: [{ adminCookieAuth: [] }],
        parameters: [
          {
            name: 'teamId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Team ID'
          }
        ],
        responses: {
          '200': { description: 'Team deleted successfully' },
          '400': {
            description: 'Cannot delete team registered for events',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Cannot delete team that is registered for an event' }
              }
            }
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/portal/search': {
      get: {
        tags: ['Portal - Search'],
        summary: 'Search teams and events',
        description: 'Search for teams and events by name, number, or location',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2 },
            description: 'Search query (minimum 2 characters)'
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['teams', 'events', 'all'],
              default: 'all'
            },
            description: 'Type of results to return'
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'upcoming', 'past', 'all'],
              default: 'all'
            },
            description: 'Event status filter (only applies to events)'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            description: 'Maximum number of results'
          }
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SearchResult' }
                    },
                    total: { type: 'integer' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid search query',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Search query must be at least 2 characters long' }
              }
            }
          }
        }
      }
    },
    '/portal/seasons': {
      get: {
        tags: ['Portal - Search'],
        summary: 'Get all seasons',
        description: 'Retrieve a list of all seasons',
        responses: {
          '200': {
            description: 'List of seasons',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Season' }
                }
              }
            }
          }
        }
      }
    },
    '/portal/seasons/latest': {
      get: {
        tags: ['Portal - Search'],
        summary: 'Get latest season',
        description: 'Retrieve the current or most recent season',
        responses: {
          '200': {
            description: 'Latest season',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Season' }
              }
            }
          }
        }
      }
    },
    '/portal/seasons/{seasonSlug}': {
      get: {
        tags: ['Portal - Search'],
        summary: 'Get season by slug',
        description: 'Retrieve a specific season',
        parameters: [
          {
            name: 'seasonSlug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Season slug',
            example: '2024-into-orbit'
          }
        ],
        responses: {
          '200': {
            description: 'Season details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Season' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFound' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'lems-auth-token',
        description: 'JWT token for volunteer authentication'
      },
      adminCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'admin-auth-token',
        description: 'JWT token for admin authentication'
      },
      schedulerCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'scheduler-auth-token',
        description: 'JWT token for scheduler authentication'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error code or message'
          }
        }
      },
      LemsUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          eventId: { type: 'string' },
          divisionId: { type: 'string' },
          role: { type: 'string' },
          isAdmin: { type: 'boolean' }
        }
      },
      AdminUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      AdminTeam: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'integer' },
          name: { type: 'string' },
          affiliation: { type: 'string' },
          city: { type: 'string' },
          region: { type: 'string' },
          logoUrl: { type: 'string', nullable: true },
          registered: { type: 'boolean', description: 'Whether team is registered for any event' }
        }
      },
      Season: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      SearchResult: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['team', 'event']
          },
          id: { type: 'string' },
          slug: { type: 'string' },
          title: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          logoUrl: { type: 'string', nullable: true },
          region: { type: 'string' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request - invalid parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized - authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'UNAUTHORIZED' }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'FORBIDDEN' }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      TooManyRequests: {
        description: 'Too many requests - rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'TOO_MANY_REQUESTS' }
          }
        }
      }
    }
  }
};
