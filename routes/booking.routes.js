const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lấy danh sách đặt lịch của người dùng
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đặt lịch
 */
router.get('/', authenticate, bookingController.getAll);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Lấy thông tin đặt lịch
 *     tags: [Bookings]
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
 *         description: Thông tin đặt lịch
 */
router.get('/:id', authenticate, bookingController.getById);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Đặt lịch khám
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: integer
 *               patientId:
 *                 type: integer
 *               symptoms:
 *                 type: string
 *               fee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Đặt lịch thành công
 */
router.post('/', authenticate, bookingController.create);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     summary: Hủy đặt lịch
 *     tags: [Bookings]
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
 *         description: Hủy đặt lịch thành công
 */
router.post('/:id/cancel', authenticate, bookingController.cancel);

/**
 * @swagger
 * /api/bookings/{id}/queue:
 *   get:
 *     summary: Lấy thông tin số thứ tự
 *     tags: [Bookings]
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
 *         description: Thông tin số thứ tự
 */
router.get('/:id/queue', authenticate, bookingController.getQueueInfo);

/**
 * @swagger
 * /api/bookings/admin/all:
 *   get:
 *     summary: Lấy danh sách tất cả đặt lịch (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả đặt lịch
 */
router.get('/admin/all', authenticate, authorize('admin'), bookingController.getAllAdmin);

module.exports = router;

