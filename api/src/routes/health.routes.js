const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is running
 *         content:
 *           application/json:
 *             example:
 *               status: "ok"
 *               service: "eagle-box-cricket-api"
 *               version: "1.0.0"
 *               timestamp: "2026-06-17T00:00:00.000Z"
 */
router.get('/', (_, res) =>
  res.json({
    status:    'ok',
    service:   'eagle-box-cricket-api',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  })
);

module.exports = router;
