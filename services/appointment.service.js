const db = require('../config/database');

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const getAll = async () => {
  const results = await db.query('SELECT * FROM appointments ORDER BY id');
  return results.map(row => ({
    id: row.id,
    doctorId: row.doctor_id,
    specialtyId: row.specialty_id,
    date: row.date,
    timeSlot: row.time_slot,
    room: row.room,
    building: row.building,
    maxPatients: row.max_patients,
    currentPatients: row.current_patients,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getAllPaginated = async (page = 0, size = 10, filters = {}) => {
  const { doctorId, specialtyId, date } = filters;
  
  // Đảm bảo page và size là số nguyên
  const pageNum = parseInt(page) || 0;
  const sizeNum = parseInt(size) || 10;
  
  let whereConditions = [];
  let queryParams = [];
  
  if (doctorId) {
    whereConditions.push('a.doctor_id = ?');
    queryParams.push(parseInt(doctorId));
  }
  if (specialtyId) {
    whereConditions.push('a.specialty_id = ?');
    queryParams.push(parseInt(specialtyId));
  }
  if (date) {
    whereConditions.push('a.date = ?');
    queryParams.push(date);
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';
  
  // Đếm số groups (date + doctor) thay vì số appointments
  const countQuery = `
    SELECT COUNT(DISTINCT CONCAT(a.date, '_', a.doctor_id)) as total 
    FROM appointments a
    ${whereClause}
  `;
  
  const countResult = await db.query(countQuery, queryParams);
  const totalElements = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalElements / sizeNum);
  
  // Lấy tất cả appointments để group, sau đó paginate groups ở application level
  // Hoặc dùng subquery để group trước rồi paginate
  const offset = pageNum * sizeNum;
  
  // Query để lấy grouped appointments với pagination
  // Sử dụng window function hoặc subquery để group trước
  const dataQuery = `
    SELECT 
      grouped.date,
      grouped.doctor_id,
      grouped.doctor_name,
      grouped.doctor_title,
      grouped.specialty_id,
      grouped.room,
      grouped.building,
      grouped.total_slots,
      grouped.total_patients,
      grouped.total_max_patients
    FROM (
      SELECT 
        a.date,
        a.doctor_id,
        MAX(d.full_name) as doctor_name,
        MAX(d.title) as doctor_title,
        MAX(a.specialty_id) as specialty_id,
        MAX(COALESCE(r.room_number, a.room, '')) as room,
        MAX(COALESCE(b.name, a.building, '')) as building,
        COUNT(*) as total_slots,
        SUM(a.current_patients) as total_patients,
        SUM(a.max_patients) as total_max_patients
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN buildings b ON r.building_id = b.id
      ${whereClause}
      GROUP BY a.date, a.doctor_id
      ORDER BY a.date DESC, a.doctor_id ASC
    ) as grouped
    LIMIT ${sizeNum} OFFSET ${offset}
  `;
  
  const results = await db.query(dataQuery, queryParams);
  
  // Lấy chi tiết appointments cho mỗi group
  const content = await Promise.all(
    results.map(async (row) => {
      const appointmentsQuery = `
        SELECT 
          a.*,
          d.full_name as doctor_name,
          d.title as doctor_title,
          r.room_number,
          b.name as building_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN rooms r ON d.room_id = r.id
        LEFT JOIN buildings b ON r.building_id = b.id
        WHERE a.date = ? AND a.doctor_id = ?
        ORDER BY a.time_slot ASC
      `;
      
      const appointments = await db.query(appointmentsQuery, [row.date, row.doctor_id]);
      
      return {
        date: row.date,
        doctorId: row.doctor_id,
        doctorName: row.doctor_name || 'N/A',
        doctorTitle: row.doctor_title || '',
        specialtyId: row.specialty_id,
        room: row.room || '',
        building: row.building || '',
        appointments: appointments.map(apt => ({
          id: apt.id,
          doctorId: apt.doctor_id,
          doctorName: apt.doctor_name || 'N/A',
          doctorTitle: apt.doctor_title || '',
          specialtyId: apt.specialty_id,
          date: apt.date,
          timeSlot: apt.time_slot,
          room: apt.room_number || apt.room || '',
          building: apt.building_name || apt.building || '',
          maxPatients: apt.max_patients,
          currentPatients: apt.current_patients,
          createdAt: apt.created_at,
          updatedAt: apt.updated_at
        })),
        totalSlots: row.total_slots,
        totalPatients: row.total_patients,
        totalMaxPatients: row.total_max_patients
      };
    })
  );
  
  return {
    content,
    totalElements,
    totalPages,
    size: sizeNum,
    number: pageNum,
    first: pageNum === 0,
    last: pageNum >= totalPages - 1,
    numberOfElements: content.length,
    empty: content.length === 0
  };
};

const getById = async (id) => {
  const results = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    doctorId: row.doctor_id,
    specialtyId: row.specialty_id,
    date: row.date,
    timeSlot: row.time_slot,
    room: row.room,
    building: row.building,
    maxPatients: row.max_patients,
    currentPatients: row.current_patients,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const getAvailableSlots = async (specialtyId, doctorId, date, title) => {
  const doctorService = require('./doctor.service');
  let doctors = [];
  
  if (doctorId) {
    const doctor = await doctorService.getById(doctorId);
    if (doctor) doctors.push(doctor);
  } else if (title) {
    const results = await db.query(`
      SELECT d.*, r.room_number as room, r.building 
      FROM doctors d 
      LEFT JOIN rooms r ON d.room_id = r.id 
      WHERE d.specialty_id = ? AND d.title = ?
    `, [specialtyId, title]);
    doctors = results.map(row => ({
      id: row.id,
      fullName: row.full_name,
      title: row.title,
      specialtyId: row.specialty_id,
      room: row.room,
      building: row.building
    }));
  } else {
    doctors = await doctorService.getBySpecialty(specialtyId);
  }

  const availableSlots = [];
  
  for (const doctor of doctors) {
    // Chỉ lấy các appointments đã được tạo trong database (không generate tất cả slots)
    const appointments = await db.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND specialty_id = ?',
      [doctor.id, date, specialtyId]
    );

    // Chỉ hiển thị các slots đã có appointment trong database
    for (const appointment of appointments) {
      const availableCount = appointment.max_patients - appointment.current_patients;

      if (availableCount > 0) {
        // Lấy thông tin specialty từ appointment
        const specialtyInfo = await db.query(
          'SELECT id, name FROM specialties WHERE id = ?',
          [specialtyId]
        );
        
        availableSlots.push({
          appointmentId: appointment.id,
          doctorId: doctor.id,
          doctorName: doctor.fullName,
          doctorTitle: doctor.title,
          timeSlot: appointment.time_slot,
          room: doctor.room,
          building: doctor.building,
          specialtyId: specialtyId,
          specialty: specialtyInfo.length > 0 ? specialtyInfo[0].name : null,
          availableCount,
          currentPatients: appointment.current_patients,
          maxPatients: appointment.max_patients
        });
      }
    }
  }

  return availableSlots;
};

const create = async (data) => {
  // Đảm bảo date được format đúng YYYY-MM-DD
  let dateStr = data.date;
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString().split('T')[0];
  } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  
  // Đảm bảo timeSlot được trim và format đúng
  const timeSlot = typeof data.timeSlot === 'string' ? data.timeSlot.trim() : data.timeSlot;
  
  console.log('=== CREATE APPOINTMENT ===');
  console.log('Input data:', data);
  console.log('Formatted date:', dateStr);
  console.log('Formatted timeSlot:', timeSlot);
  console.log('Doctor ID:', data.doctorId);
  
  // Kiểm tra xem appointment đã tồn tại chưa
  // Sử dụng DATE() để đảm bảo so sánh date chính xác, không phụ thuộc vào time
  const existing = await db.query(
    'SELECT * FROM appointments WHERE doctor_id = ? AND DATE(date) = DATE(?) AND time_slot = ?',
    [data.doctorId, dateStr, timeSlot]
  );

  console.log('Existing appointments found:', existing.length);
  if (existing.length > 0) {
    console.log('Existing appointment details:', existing.map(e => ({
      id: e.id,
      doctor_id: e.doctor_id,
      date: e.date,
      date_string: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
      time_slot: e.time_slot
    })));
    // Nếu đã tồn tại, throw error để admin biết không thể tạo duplicate
    throw new Error('Khung giờ này đã tồn tại cho bác sĩ này vào ngày này');
  }
  
  console.log('No duplicate found, creating new appointment');

  // Tạo appointment mới
  const result = await db.query(
    `INSERT INTO appointments (doctor_id, specialty_id, date, time_slot, room, building, max_patients, current_patients) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [data.doctorId, data.specialtyId, dateStr, timeSlot, data.room, data.building, data.maxPatients || 20]
  );
  
  console.log('Appointment created successfully with ID:', result.insertId);
  console.log('========================');
  
  return await getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Lịch khám không tồn tại');
  }

  await db.query(
    'UPDATE appointments SET max_patients = ? WHERE id = ?',
    [data.maxPatients || existing.maxPatients, id]
  );
  
  return await getById(id);
};

const remove = async (id) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Lịch khám không tồn tại');
  }

  if (existing.currentPatients > 0) {
    throw new Error('Không thể xóa lịch khám đã có bệnh nhân đăng ký');
  }

  await db.query('DELETE FROM appointments WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getAll,
  getAllPaginated,
  getById,
  getAvailableSlots,
  create,
  update,
  remove
};
