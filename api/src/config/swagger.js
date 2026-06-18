const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eagle Box Cricket API',
      version: '2.0.0',
      description: 'Complete Cricket Venue Management System — REST API',
      contact: { name: 'EBC Dev Team' },
    },
    servers: [
      { url: 'http://localhost:5001/api/v1', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors:  { type: 'array', items: { type: 'string' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page:       { type: 'integer' },
            limit:      { type: 'integer' },
            total:      { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
