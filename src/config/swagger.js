const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'Backend API for Finance Dashboard with role-based access control',
    },
     servers: [
  { url: 'http://localhost:5000', description: 'Local' },
  { url: 'https://finance-backend-production-1521.up.railway.app', description: 'Production' },
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
}

module.exports = swaggerJsdoc(options)