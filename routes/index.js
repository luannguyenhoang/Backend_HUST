const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const specialtyRoutes = require('./specialty.routes');
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');
const bookingRoutes = require('./booking.routes');
const familyMemberRoutes = require('./familyMember.routes');
const roomRoutes = require('./room.routes');
const buildingRoutes = require('./building.routes');

router.use('/auth', authRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/bookings', bookingRoutes);
router.use('/family-members', familyMemberRoutes);
router.use('/rooms', roomRoutes);
router.use('/buildings', buildingRoutes);

module.exports = router;

