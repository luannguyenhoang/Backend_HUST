const db = require('../config/database');

const getAll = async (page = null, pageSize = null) => {
  let query = `
    SELECT s.*, b.name as building 
    FROM specialties s 
    LEFT JOIN buildings b ON s.building_id = b.id 
    ORDER BY s.id
  `;
  
  if (page !== null && pageSize !== null) {
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;
  }
  
  const results = await db.query(query);
  const data = results.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    symptoms: row.symptoms ? row.symptoms.split(', ') : [],
    buildingId: row.building_id,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
  
  if (page !== null && pageSize !== null) {
    const countResult = await db.query('SELECT COUNT(*) as total FROM specialties');
    const total = countResult[0].total;
    
    return {
      data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
  
  return data;
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

const search = async (keyword, page = null, pageSize = null) => {
  if (!keyword) return await getAll(page, pageSize);
  
  let query = `
    SELECT s.*, b.name as building 
    FROM specialties s 
    LEFT JOIN buildings b ON s.building_id = b.id 
    WHERE s.name LIKE ? OR s.description LIKE ? OR s.symptoms LIKE ?
    ORDER BY s.id
  `;
  
  const searchParam = `%${keyword}%`;
  const params = [searchParam, searchParam, searchParam];
  
  if (page !== null && pageSize !== null) {
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;
  }
  
  const results = await db.query(query, params);
  const data = results.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    symptoms: row.symptoms ? row.symptoms.split(', ') : [],
    buildingId: row.building_id,
    building: row.building,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
  
  if (page !== null && pageSize !== null) {
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM specialties s WHERE s.name LIKE ? OR s.description LIKE ? OR s.symptoms LIKE ?',
      [searchParam, searchParam, searchParam]
    );
    const total = countResult[0].total;
    
    return {
      data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
  
  return data;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  search
};
