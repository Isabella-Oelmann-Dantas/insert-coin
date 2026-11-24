const express = require('express');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();
const yamlPath = path.join(__dirname, '..', '..', 'openapi.yaml');

// GET /openapi.yaml → devolve o arquivo YAML bruto
router.get('/openapi.yaml', (_, res) => {
  res.type('text/yaml; charset=utf-8').send(fs.readFileSync(yamlPath, 'utf8'));
});

// GET /api-docs → interface visual do Swagger UI, lendo o mesmo YAML
const spec = YAML.parse(fs.readFileSync(yamlPath, 'utf8'));
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
  customSiteTitle: 'Insert Coin API',
}));

module.exports = router;