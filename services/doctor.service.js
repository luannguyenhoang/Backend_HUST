const db = require('../config/database');

const getAll = async () => {
  const results = await db.query(`
    SELECT d.*, r.room_number as room, r.building 
    FROM doctors d 
    LEFT JOIN rooms r ON d.room_id = r.id 
    ORDER BY d.id
  `);
  return results.map(row => ({
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    specialtyId: row.specialty_id,
    roomId: row.room_id,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id) => {
  const results = await db.query(`
    SELECT d.*, r.room_number as room, r.building 
    FROM doctors d 
    LEFT JOIN rooms r ON d.room_id = r.id 
    WHERE d.id = ?
  `, [id]);
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    specialtyId: row.specialty_id,
    roomId: row.room_id,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const getBySpecialty = async (specialtyId) => {
  const results = await db.query(`
    SELECT d.*, r.room_number as room, r.building 
    FROM doctors d 
    LEFT JOIN rooms r ON d.room_id = r.id 
    WHERE d.specialty_id = ? 
    ORDER BY d.id
  `, [specialtyId]);
  return results.map(row => ({
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    specialtyId: row.specialty_id,
    roomId: row.room_id,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const create = async (data) => {
  // Kiểm tra sức chứa của phòng trước khi thêm bác sĩ
  if (data.roomId) {
    // Lấy thông tin phòng
    const room = await db.query(
      'SELECT id, room_number, capacity FROM rooms WHERE id = ?',
      [data.roomId]
    );
    
    if (room.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    
    const roomCapacity = room[0].capacity || 1;
    
    // Đếm số bác sĩ hiện tại trong phòng
    const currentDoctors = await db.query(
      'SELECT COUNT(*) as count FROM doctors WHERE room_id = ?',
      [data.roomId]
    );
    
    const currentCount = currentDoctors[0]?.count || 0;
    
    // Kiểm tra xem phòng còn chỗ không
    if (currentCount >= roomCapacity) {
      throw new Error(`Phòng ${room[0].room_number} đã đầy (${currentCount}/${roomCapacity} bác sĩ)`);
    }
  }
  
  const result = await db.query(
    'INSERT INTO doctors (full_name, title, specialty_id, room_id) VALUES (?, ?, ?, ?)',
    [data.fullName, data.title, data.specialtyId, data.roomId]
  );
  
  return await getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Bác sĩ không tồn tại');
  }

  // Kiểm tra sức chứa của phòng nếu đổi phòng
  if (data.roomId && data.roomId !== existing.roomId) {
    const room = await db.query(
      'SELECT id, room_number, capacity FROM rooms WHERE id = ?',
      [data.roomId]
    );
    
    if (room.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    
    const roomCapacity = room[0].capacity || 1;
    
    // Đếm số bác sĩ hiện tại trong phòng (trừ bác sĩ đang update)
    const currentDoctors = await db.query(
      'SELECT COUNT(*) as count FROM doctors WHERE room_id = ? AND id != ?',
      [data.roomId, id]
    );
    
    const currentCount = currentDoctors[0]?.count || 0;
    
    if (currentCount >= roomCapacity) {
      throw new Error(`Phòng ${room[0].room_number} đã đầy (${currentCount}/${roomCapacity} bác sĩ)`);
    }
  }

  const updates = [];
  const values = [];
  
  if (data.fullName !== undefined) {
    updates.push('full_name = ?');
    values.push(data.fullName);
  }
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.specialtyId !== undefined) {
    updates.push('specialty_id = ?');
    values.push(data.specialtyId);
  }
  if (data.roomId !== undefined) {
    updates.push('room_id = ?');
    values.push(data.roomId);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(id);
  await db.query(
    `UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Nếu đổi phòng, cập nhật appointments tương lai (chưa diễn ra) của bác sĩ này
  if (data.roomId && data.roomId !== existing.roomId) {
    const newRoom = await db.query(
      'SELECT r.room_number, b.name as building FROM rooms r LEFT JOIN buildings b ON r.building_id = b.id WHERE r.id = ?',
      [data.roomId]
    );
    
    if (newRoom.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await db.query(
        `UPDATE appointments 
         SET room = ?, building = ? 
         WHERE doctor_id = ? AND date >= ?`,
        [newRoom[0].room_number, newRoom[0].building, id, today]
      );
    }
  }
  
  return await getById(id);
};

const search = async (keyword) => {
  if (!keyword) return await getAll();
  
  const results = await db.query(`
    SELECT d.*, r.room_number as room, r.building 
    FROM doctors d 
    LEFT JOIN rooms r ON d.room_id = r.id 
    WHERE d.full_name LIKE ? OR d.title LIKE ? 
    ORDER BY d.id
  `, [`%${keyword}%`, `%${keyword}%`]);
  
  return results.map(row => ({
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    specialtyId: row.specialty_id,
    roomId: row.room_id,
    room: row.room,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const remove = async (id) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Bác sĩ không tồn tại');
  }

  // Kiểm tra xem có appointments nào liên quan đến bác sĩ này không
  const appointments = await db.query(
    'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?',
    [id]
  );
  
  if (appointments[0].count > 0) {
    throw new Error('Không thể xóa bác sĩ đang có lịch khám. Vui lòng xóa tất cả lịch khám trước.');
  }

  // Kiểm tra xem có bookings nào liên quan đến bác sĩ này không
  const bookings = await db.query(
    'SELECT COUNT(*) as count FROM bookings WHERE doctor_id = ?',
    [id]
  );
  
  if (bookings[0].count > 0) {
    throw new Error('Không thể xóa bác sĩ đang có đặt lịch. Vui lòng xử lý tất cả đặt lịch trước.');
  }

  await db.query('DELETE FROM doctors WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getAll,
  getById,
  getBySpecialty,
  create,
  update,
  search,
  remove
};
