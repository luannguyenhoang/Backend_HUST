const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Lấy danh sách tòa nhà
 *     tags: [Buildings]
 *     responses:
 *       200:
 *         description: Danh sách tòa nhà
 */
router.get('/', buildingController.getAll);

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     summary: Lấy thông tin tòa nhà
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin tòa nhà
 */
router.get('/:id', buildingController.getById);

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     summary: Tạo tòa nhà mới (Admin only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               floors:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo tòa nhà thành công
 */
router.post('/', authenticate, authorize('admin'), buildingController.create);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     summary: Cập nhật tòa nhà (Admin only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               floors:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật tòa nhà thành công
 */
router.put('/:id', authenticate, authorize('admin'), buildingController.update);

/**
 * @swagger
 * /api/buildings/{id}:
 *   delete:
 *     summary: Xóa tòa nhà (Admin only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa tòa nhà thành công
 */
router.delete('/:id', authenticate, authorize('admin'), buildingController.remove);

module.exports = router;

