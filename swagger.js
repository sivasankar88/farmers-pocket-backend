const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Farmer's Pocket API",
      version: "1.0.0",
      description: "API documentation for my Farmer's Pocket application",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
      {
        url: "https://farmesr-s-pocket-backend.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        SessionAuth: {
          type: "apiKey",
          in: "header",
          name: "sessionauth",
          description: "JWT token obtained from login endpoint",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsDoc(options);
