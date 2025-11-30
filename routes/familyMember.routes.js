const express = require('express');
const router = express.Router();
const familyMemberController = require('../controllers/familyMember.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/family-members:
 *   get:
 *     summary: Lấy danh sách thành viên gia đình
 *     tags: [Family Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thành viên
 */
router.get('/', authenticate, familyMemberController.getAll);

/**
 * @swagger
 * /api/family-members/{id}:
 *   get:
 *     summary: Lấy thông tin thành viên
 *     tags: [Family Members]
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
 *         description: Thông tin thành viên
 */
router.get('/:id', authenticate, familyMemberController.getById);

/**
 * @swagger
 * /api/family-members:
 *   post:
 *     summary: Thêm thành viên gia đình
 *     tags: [Family Members]
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
 *               - dateOfBirth
 *               - gender
 *             properties:
 *               fullName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               relationship:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành viên thành công
 */
router.post('/', authenticate, familyMemberController.create);

/**
 * @swagger
 * /api/family-members/{id}:
 *   put:
 *     summary: Cập nhật thông tin thành viên
 *     tags: [Family Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', authenticate, familyMemberController.update);

/**
 * @swagger
 * /api/family-members/{id}:
 *   delete:
 *     summary: Xóa thành viên
 *     tags: [Family Members]
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
 *         description: Xóa thành công
 */
router.delete('/:id', authenticate, familyMemberController.delete);

module.exports = router;

