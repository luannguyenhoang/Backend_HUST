const db = require('../config/database');

const getAll = async (userId) => {
  const results = await db.query(
    'SELECT * FROM family_members WHERE user_id = ? ORDER BY id',
    [userId]
  );
  
  return results.map(row => ({
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    relationship: row.relationship,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id, userId) => {
  const results = await db.query(
    'SELECT * FROM family_members WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    relationship: row.relationship,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const create = async (data) => {
  const result = await db.query(
    `INSERT INTO family_members (user_id, full_name, date_of_birth, gender, relationship, phone, address) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.fullName,
      data.dateOfBirth,
      data.gender,
      data.relationship,
      data.phone,
      data.address
    ]
  );
  
  return await getById(result.insertId, data.userId);
};

const update = async (id, userId, updateData) => {
  const fields = [];
  const values = [];
  
  if (updateData.fullName) {
    fields.push('full_name = ?');
    values.push(updateData.fullName);
  }
  if (updateData.dateOfBirth) {
    fields.push('date_of_birth = ?');
    values.push(updateData.dateOfBirth);
  }
  if (updateData.gender) {
    fields.push('gender = ?');
    values.push(updateData.gender);
  }
  if (updateData.relationship) {
    fields.push('relationship = ?');
    values.push(updateData.relationship);
  }
  if (updateData.phone) {
    fields.push('phone = ?');
    values.push(updateData.phone);
  }
  if (updateData.address) {
    fields.push('address = ?');
    values.push(updateData.address);
  }
  
  if (fields.length === 0) {
    return await getById(id, userId);
  }
  
  values.push(id, userId);
  
  await db.query(
    `UPDATE family_members SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );
  
  return await getById(id, userId);
};

const deleteMember = async (id, userId) => {
  const result = await db.query(
    'DELETE FROM family_members WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteMember
};
