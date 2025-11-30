const db = require('../config/database');
const appointmentService = require('./appointment.service');

const generateBookingCode = () => {
  return 'BM' + Date.now().toString().slice(-8);
};

const generateQueueNumber = async (specialtyId, date) => {
  const bookings = await db.query(
    'SELECT COUNT(*) as count FROM bookings WHERE specialty_id = ? AND examination_date = ? AND status != ?',
    [specialtyId, date, 'cancelled']
  );
  const number = bookings[0].count + 1;
  return 'A' + number.toString().padStart(2, '0');
};

const getAll = async (userId) => {
  const results = await db.query(
    `SELECT b.*, d.full_name as doctor_name, d.title as doctor_title, s.name as specialty_name
     FROM bookings b
     LEFT JOIN doctors d ON b.doctor_id = d.id
     LEFT JOIN specialties s ON b.specialty_id = s.id
     WHERE b.user_id = ? ORDER BY b.created_at DESC`,
    [userId]
  );
  
  return results.map(row => ({
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorTitle: row.doctor_title,
    specialtyId: row.specialty_id,
    specialtyName: row.specialty_name,
    symptoms: row.symptoms,
    bookingCode: row.booking_code,
    queueNumber: row.queue_number,
    status: row.status,
    fee: parseFloat(row.fee),
    examinationDate: row.examination_date,
    examinationTime: row.examination_time,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getAllAdmin = async () => {
  const results = await db.query(
    `SELECT b.*, 
     d.full_name as doctor_name, 
     d.title as doctor_title, 
     s.name as specialty_name,
     u.full_name as patient_name,
     u.email as patient_email,
     u.phone as patient_phone
     FROM bookings b
     LEFT JOIN doctors d ON b.doctor_id = d.id
     LEFT JOIN specialties s ON b.specialty_id = s.id
     LEFT JOIN users u ON b.patient_id = u.id
     ORDER BY b.created_at DESC`
  );
  
  return results.map(row => ({
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    patientPhone: row.patient_phone,
    appointmentId: row.appointment_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorTitle: row.doctor_title,
    specialtyId: row.specialty_id,
    specialtyName: row.specialty_name,
    symptoms: row.symptoms,
    bookingCode: row.booking_code,
    queueNumber: row.queue_number,
    status: row.status,
    fee: parseFloat(row.fee),
    examinationDate: row.examination_date,
    examinationTime: row.examination_time,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id, userId) => {
  const results = await db.query(
    `SELECT b.*, d.full_name as doctor_name, d.title as doctor_title, s.name as specialty_name
     FROM bookings b
     LEFT JOIN doctors d ON b.doctor_id = d.id
     LEFT JOIN specialties s ON b.specialty_id = s.id
     WHERE b.id = ? AND b.user_id = ?`,
    [id, userId]
  );
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorTitle: row.doctor_title,
    specialtyId: row.specialty_id,
    specialtyName: row.specialty_name,
    symptoms: row.symptoms,
    bookingCode: row.booking_code,
    queueNumber: row.queue_number,
    status: row.status,
    fee: parseFloat(row.fee),
    examinationDate: row.examination_date,
    examinationTime: row.examination_time,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const create = async (data) => {
  let appointment = await appointmentService.getById(data.appointmentId);
  
  if (!appointment && data.doctorId && data.specialtyId && data.date && data.timeSlot) {
    const doctorService = require('./doctor.service');
    const doctor = await doctorService.getById(data.doctorId);
    if (!doctor) {
      throw new Error('Bác sĩ không tồn tại');
    }
    
    appointment = await appointmentService.create({
      doctorId: data.doctorId,
      specialtyId: data.specialtyId,
      date: data.date,
      timeSlot: data.timeSlot,
      room: doctor.room,
      building: doctor.building
    });
  } else if (!appointment) {
    throw new Error('Lịch khám không tồn tại');
  }

  const doctorService = require('./doctor.service');
  const doctor = await doctorService.getById(appointment.doctorId);
  if (!doctor) {
    throw new Error('Bác sĩ không tồn tại');
  }

  const queueNumber = await generateQueueNumber(appointment.specialtyId, appointment.date);
  const bookingCode = generateBookingCode();

  const result = await db.query(
    `INSERT INTO bookings (user_id, patient_id, appointment_id, doctor_id, specialty_id, symptoms, booking_code, queue_number, status, fee, examination_date, examination_time, room, building) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.patientId,
      appointment.id,
      appointment.doctorId,
      appointment.specialtyId,
      data.symptoms,
      bookingCode,
      queueNumber,
      data.fee || 400000,
      appointment.date,
      appointment.timeSlot,
      appointment.room,
      appointment.building
    ]
  );

  return await getById(result.insertId, data.userId);
};

const cancel = async (id, userId) => {
  const bookings = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
  
  if (bookings.length === 0) {
    throw new Error('Đặt lịch không tồn tại');
  }
  
  const booking = bookings[0];
  if (booking.status === 'cancelled') {
    throw new Error('Đặt lịch đã được hủy');
  }

  await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

  const appointment = await appointmentService.getById(booking.appointment_id);
  if (appointment && appointment.currentPatients > 0) {
    await db.query(
      'UPDATE appointments SET current_patients = current_patients - 1 WHERE id = ?',
      [appointment.id]
    );
  }

  return await getById(id, userId);
};

const getQueueInfo = async (bookingId, userId) => {
  const booking = await getById(bookingId, userId);
  if (!booking) {
    throw new Error('Đặt lịch không tồn tại');
  }

  const bookings = await db.query(
    `SELECT COUNT(*) as count FROM bookings 
     WHERE specialty_id = ? AND examination_date = ? AND status != ? AND id <= ?`,
    [booking.specialtyId, booking.examinationDate, 'cancelled', bookingId]
  );

  const waitingCount = bookings[0].count - 1;

  return {
    bookingCode: booking.bookingCode,
    queueNumber: booking.queueNumber,
    waitingCount: waitingCount > 0 ? waitingCount : 0,
    examinationDate: booking.examinationDate,
    examinationTime: booking.examinationTime,
    room: booking.room,
    building: booking.building
  };
};

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  cancel,
  getQueueInfo
};
