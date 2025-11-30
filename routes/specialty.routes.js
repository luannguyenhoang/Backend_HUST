const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Lấy danh sách chuyên khoa
 *     tags: [Specialties]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm chuyên khoa
 *     responses:
 *       200:
 *         description: Danh sách chuyên khoa
 */
router.get('/', specialtyController.getAll);

/**
 * @swagger
 * /api/specialties/{id}:
 *   get:
 *     summary: Lấy thông tin chuyên khoa
 *     tags: [Specialties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin chuyên khoa
 */
router.get('/:id', specialtyController.getById);

/**
 * @swagger
 * /api/specialties:
 *   post:
 *     summary: Tạo chuyên khoa mới (Admin only)
 *     tags: [Specialties]
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
 *               description:
 *                 type: string
 *               symptoms:
 *                 type: string
 *               buildingId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo chuyên khoa thành công
 */
router.post('/', authenticate, authorize('admin'), specialtyController.create);

/**
 * @swagger
 * /api/specialties/{id}:
 *   put:
 *     summary: Cập nhật chuyên khoa (Admin only)
 *     tags: [Specialties]
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               symptoms:
 *                 type: string
 *               buildingId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật chuyên khoa thành công
 */
router.put('/:id', authenticate, authorize('admin'), specialtyController.update);

module.exports = router;

