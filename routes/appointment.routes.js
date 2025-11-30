const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /api/appointments/available:
 *   get:
 *     summary: Lấy danh sách lịch khám có sẵn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialtyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lịch khám có sẵn
 */
router.get('/available', authenticate, appointmentController.getAvailableSlots);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Lấy danh sách lịch khám (Admin only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách lịch khám
 */
router.get('/', authenticate, authorize('admin'), appointmentController.getAll);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Tạo lịch khám (Admin only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - specialtyId
 *               - date
 *               - timeSlot
 *             properties:
 *               doctorId:
 *                 type: integer
 *               specialtyId:
 *                 type: integer
 *               date:
 *                 type: string
 *               timeSlot:
 *                 type: string
 *               maxPatients:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo lịch khám thành công
 */
router.post('/', authenticate, authorize('admin'), appointmentController.create);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Cập nhật lịch khám (Admin only)
 *     tags: [Appointments]
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
 *               maxPatients:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật lịch khám thành công
 */
router.put('/:id', authenticate, authorize('admin'), appointmentController.update);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Xóa lịch khám (Admin only)
 *     tags: [Appointments]
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
 *         description: Xóa lịch khám thành công
 */
router.delete('/:id', authenticate, authorize('admin'), appointmentController.remove);

module.exports = router;

