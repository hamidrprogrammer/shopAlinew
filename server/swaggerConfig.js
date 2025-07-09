const swaggerJsdoc = require('swagger-jsdoc');
const packageJson = require('./package.json'); // To get version and description

const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Advanced Furniture Store API',
      version: packageJson.version || '1.0.0', // Version from package.json
      description: packageJson.description || 'API documentation for the Advanced Furniture E-commerce Store',
      license: {
        name: 'ISC', // Or your project's license
        // url: 'https://opensource.org/licenses/ISC',
      },
      contact: {
        name: 'Support Team',
        // url: 'https://yourstore.com/support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`, // Adjust if your base URL is different
        description: 'Development server',
      },
      // You can add more servers (e.g., staging, production)
      // {
      //   url: 'https://api.yourstore.com/v1',
      //   description: 'Production server',
      // },
    ],
    // Components section for reusable parts like schemas, securitySchemes, etc.
    components: {
      securitySchemes: {
        bearerAuth: { // Name of the security scheme
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, for documentation purposes
          description: 'Enter JWT Bearer token in the format: Bearer {token}'
        },
        cookieAuth: { // Alternative for cookie-based auth
            type: 'apiKey',
            in: 'cookie',
            name: 'token', // Name of the cookie
            description: 'JWT token passed as a cookie.'
        }
      },
      schemas: {
        // --- General Schemas ---
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' }
                }
              },
              nullable: true
            },
            stack: { type: 'string', nullable: true, description: 'Stack trace (in development)'}
          },
        },
        SuccessResponse: { // Generic success response wrapper
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', nullable: true },
                data: { type: 'object' }, // Data can be any object or specific schema
                token: { type: 'string', nullable: true, description: 'JWT token (on login/register)'}
            }
        },
        // --- User Schemas (example) ---
        UserInputRequired: { // For registration
            type: 'object',
            required: ['name', 'email', 'password', 'passwordConfirm'],
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                password: { type: 'string', format: 'password', example: 'password123', minLength: 6 },
                passwordConfirm: { type: 'string', format: 'password', example: 'password123' },
                role: { type: 'string', enum: ['user', 'admin', 'manager'], default: 'user', nullable: true }
            }
        },
        UserLogin: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                password: { type: 'string', format: 'password', example: 'password123' }
            }
        },
        UserResponse: { // User object returned in responses
            type: 'object',
            properties: {
                _id: { type: 'string', format: 'objectid', example: '60c72b2f9b1d8e001c8e4d9a' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['user', 'admin', 'manager'], example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                // Add other fields as necessary, but exclude sensitive ones like password
            }
        },
        // --- Category Schemas (example) ---
        CategoryInput: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', minLength: 2, maxLength: 50, example: 'Living Room Sofas' },
                description: { type: 'string', maxLength: 500, nullable: true, example: 'Comfortable sofas for your living room.' },
                image: { type: 'string', format: 'url', nullable: true, example: 'https://example.com/image.jpg' },
                parent: { type: 'string', format: 'objectid', nullable: true, description: 'ID of the parent category' }
            }
        },
        CategoryResponse: {
            type: 'object',
            properties: {
                _id: { type: 'string', format: 'objectid' },
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string', nullable: true },
                image: { type: 'string', format: 'url', nullable: true },
                parent: { type: 'string', format: 'objectid', nullable: true }, // Or a nested CategoryResponse (simplified)
                ancestors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', format: 'objectid'},
                            name: { type: 'string' },
                            slug: { type: 'string' }
                        }
                    },
                    nullable: true
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        },
        // TODO: Add schemas for Product, Order, Review, Discount, Settings etc.
      }
    },
    // Security definitions, e.g., for JWT
    security: [
        {
            bearerAuth: [] // This applies bearerAuth globally to all operations unless overridden
        },
        // {
        //     cookieAuth: [] // If using cookie auth primarily
        // }
    ]
  },
  // Path to the API docs (JSdoc comments)
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'], // Glob patterns to find JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
