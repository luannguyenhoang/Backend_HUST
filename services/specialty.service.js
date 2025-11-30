const db = require('../config/database');

const getAll = async () => {
  const results = await db.query(`
    SELECT s.*, b.name as building 
    FROM specialties s 
    LEFT JOIN buildings b ON s.building_id = b.id 
    ORDER BY s.id
  `);
  return results.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    symptoms: row.symptoms ? row.symptoms.split(', ') : [],
    buildingId: row.building_id,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const getById = async (id) => {
  const results = await db.query(`
    SELECT s.*, b.name as building 
    FROM specialties s 
    LEFT JOIN buildings b ON s.building_id = b.id 
    WHERE s.id = ?
  `, [id]);
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    symptoms: row.symptoms ? row.symptoms.split(', ') : [],
    buildingId: row.building_id,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const create = async (data) => {
  const result = await db.query(
    'INSERT INTO specialties (name, description, symptoms, building_id) VALUES (?, ?, ?, ?)',
    [data.name, data.description, data.symptoms ? data.symptoms.join(', ') : null, data.buildingId || null]
  );
  
  return await getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Chuyên khoa không tồn tại');
  }

  await db.query(
    'UPDATE specialties SET name = ?, description = ?, symptoms = ?, building_id = ? WHERE id = ?',
    [
      data.name,
      data.description,
      data.symptoms ? data.symptoms.join(', ') : null,
      data.buildingId || null,
      id
    ]
  );
  
  return await getById(id);
};

const search = async (keyword) => {
  if (!keyword) return await getAll();
  
  const results = await db.query(`
    SELECT s.*, b.name as building 
    FROM specialties s 
    LEFT JOIN buildings b ON s.building_id = b.id 
    WHERE s.name LIKE ? OR s.description LIKE ? 
    ORDER BY s.id
  `, [`%${keyword}%`, `%${keyword}%`]);
  
  return results.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    symptoms: row.symptoms ? row.symptoms.split(', ') : [],
    buildingId: row.building_id,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  search
};
