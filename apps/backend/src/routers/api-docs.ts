import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../lib/swagger/openapi-spec';

const router = express.Router({ mergeParams: true });

// Serve OpenAPI spec as JSON
router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LEMS API Documentation'
  })
);

export default router;
