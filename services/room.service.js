const db = require('../config/database');

const getAll = async () => {
  const results = await db.query(`
    SELECT r.*, b.name as building, s.id as specialty_id, s.name as specialty_name
    FROM rooms r 
    LEFT JOIN buildings b ON r.building_id = b.id 
    LEFT JOIN specialties s ON r.specialty_id = s.id
    ORDER BY b.name, r.room_number
  `);
  return results.map(row => ({
    id: row.id,
    roomNumber: row.room_number,
    buildingId: row.building_id,
    building: row.building,
    specialtyId: row.specialty_id,
    specialty: row.specialty_name,
    floor: row.floor,
    capacity: row.capacity,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id) => {
  const results = await db.query(`
    SELECT r.*, b.name as building, s.id as specialty_id, s.name as specialty_name
    FROM rooms r 
    LEFT JOIN buildings b ON r.building_id = b.id 
    LEFT JOIN specialties s ON r.specialty_id = s.id
    WHERE r.id = ?
  `, [id]);
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    roomNumber: row.room_number,
    buildingId: row.building_id,
    building: row.building,
    specialtyId: row.specialty_id,
    specialty: row.specialty_name,
    floor: row.floor,
    capacity: row.capacity,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const create = async (data) => {
  const existing = await db.query(
    'SELECT id FROM rooms WHERE room_number = ? AND building_id = ?',
    [data.roomNumber, data.buildingId]
  );
  
  if (existing.length > 0) {
    throw new Error('Phòng này đã tồn tại trong tòa nhà này');
  }

  const result = await db.query(
    'INSERT INTO rooms (room_number, building_id, specialty_id, floor, capacity, description) VALUES (?, ?, ?, ?, ?, ?)',
    [data.roomNumber, data.buildingId, data.specialtyId || null, data.floor || null, data.capacity || 1, data.description || null]
  );
  
  return await getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Phòng không tồn tại');
  }

  // Kiểm tra nếu đổi room_number hoặc building_id thì phải unique
  if (data.roomNumber && data.buildingId) {
    const duplicate = await db.query(
      'SELECT id FROM rooms WHERE room_number = ? AND building_id = ? AND id != ?',
      [data.roomNumber, data.buildingId, id]
    );
    if (duplicate.length > 0) {
      throw new Error('Phòng này đã tồn tại trong tòa nhà này');
    }
  }

  const updates = [];
  const values = [];
  
  if (data.roomNumber !== undefined) {
    updates.push('room_number = ?');
    values.push(data.roomNumber);
  }
  if (data.buildingId !== undefined) {
    updates.push('building_id = ?');
    values.push(data.buildingId);
  }
  if (data.specialtyId !== undefined) {
    updates.push('specialty_id = ?');
    values.push(data.specialtyId || null);
  }
  if (data.floor !== undefined) {
    updates.push('floor = ?');
    values.push(data.floor);
  }
  if (data.capacity !== undefined) {
    updates.push('capacity = ?');
    values.push(data.capacity);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(id);
  await db.query(
    `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  return await getById(id);
};

const remove = async (id) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Phòng không tồn tại');
  }

  // Kiểm tra xem có doctors nào đang sử dụng phòng này không
  const doctors = await db.query('SELECT COUNT(*) as count FROM doctors WHERE room_id = ?', [id]);
  if (doctors[0].count > 0) {
    throw new Error('Không thể xóa phòng đang có bác sĩ sử dụng');
  }

  await db.query('DELETE FROM rooms WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

