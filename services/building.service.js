const db = require('../config/database');

const getAll = async () => {
  const results = await db.query('SELECT * FROM buildings ORDER BY name');
  return results.map(row => ({
    id: row.id,
    name: row.name,
    address: row.address,
    description: row.description,
    floors: row.floors,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id) => {
  const results = await db.query('SELECT * FROM buildings WHERE id = ?', [id]);
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    description: row.description,
    floors: row.floors,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const create = async (data) => {
  const existing = await db.query(
    'SELECT id FROM buildings WHERE name = ?',
    [data.name]
  );
  
  if (existing.length > 0) {
    throw new Error('Tòa nhà này đã tồn tại');
  }

  const result = await db.query(
    'INSERT INTO buildings (name, address, description, floors) VALUES (?, ?, ?, ?)',
    [data.name, data.address || null, data.description || null, data.floors || null]
  );
  
  return await getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Tòa nhà không tồn tại');
  }

  // Kiểm tra nếu đổi tên thì phải unique
  if (data.name && data.name !== existing.name) {
    const duplicate = await db.query(
      'SELECT id FROM buildings WHERE name = ? AND id != ?',
      [data.name, id]
    );
    if (duplicate.length > 0) {
      throw new Error('Tên tòa nhà này đã tồn tại');
    }
  }

  const updates = [];
  const values = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.address !== undefined) {
    updates.push('address = ?');
    values.push(data.address);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.floors !== undefined) {
    updates.push('floors = ?');
    values.push(data.floors);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(id);
  await db.query(
    `UPDATE buildings SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  return await getById(id);
};

const remove = async (id) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Tòa nhà không tồn tại');
  }

  // Kiểm tra xem có rooms nào đang sử dụng tòa nhà này không
  const rooms = await db.query('SELECT COUNT(*) as count FROM rooms WHERE building_id = ?', [id]);
  if (rooms[0].count > 0) {
    throw new Error('Không thể xóa tòa nhà đang có phòng sử dụng');
  }

  await db.query('DELETE FROM buildings WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

