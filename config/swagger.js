const swaggerJsdoc = require('swagger-jsdoc');

const getSwaggerSpec = (port) => {
  const serverPort = port || process.env.PORT || 5000;
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Hệ thống đặt lịch khám chữa bệnh',
        version: '1.0.0',
        description: 'API documentation cho hệ thống đặt lịch khám chữa bệnh trực tuyến',
      },
      servers: [
        {
          url: `http://localhost:${serverPort}`,
          description: 'Development server',
        },
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
    },
    apis: ['./routes/*.js'],
  };

  return swaggerJsdoc(options);
};

module.exports = getSwaggerSpec;

