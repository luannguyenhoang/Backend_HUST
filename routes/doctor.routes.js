const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: integer
 *         description: Lọc theo chuyên khoa
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm bác sĩ
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
router.get('/', doctorController.getAll);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Lấy thông tin bác sĩ
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin bác sĩ
 */
router.get('/:id', doctorController.getById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Tạo bác sĩ mới
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - specialtyId
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               title:
 *                 type: string
 *                 example: "TS. BS"
 *               specialtyId:
 *                 type: integer
 *                 example: 1
 *               room:
 *                 type: string
 *                 example: "P.428"
 *               building:
 *                 type: string
 *                 example: "Nhà K1"
 *     responses:
 *       201:
 *         description: Tạo bác sĩ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', authenticate, authorize('admin'), doctorController.create);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Cập nhật thông tin bác sĩ (Admin only)
 *     tags: [Doctors]
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
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               title:
 *                 type: string
 *                 example: "TS. BS"
 *               specialtyId:
 *                 type: integer
 *                 example: 1
 *               roomId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cập nhật bác sĩ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc phòng đã đầy
 *       404:
 *         description: Không tìm thấy bác sĩ
 */
router.put('/:id', authenticate, authorize('admin'), doctorController.update);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Xóa bác sĩ (Admin only)
 *     tags: [Doctors]
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
 *         description: Xóa bác sĩ thành công
 *       400:
 *         description: Không thể xóa bác sĩ (có lịch khám hoặc đặt lịch)
 *       404:
 *         description: Không tìm thấy bác sĩ
 */
router.delete('/:id', authenticate, authorize('admin'), doctorController.remove);

module.exports = router;

