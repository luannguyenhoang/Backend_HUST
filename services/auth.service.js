const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const db = require('../config/database');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  return dateString;
};

const register = async (userData) => {
  const existing = await db.query(
    'SELECT id FROM users WHERE phone = ? OR email = ?',
    [userData.phone, userData.email]
  );
  
  if (existing.length > 0) {
    throw new Error('Số điện thoại hoặc email đã được sử dụng');
  }

  const hashedPassword = await hashPassword(userData.password);
  const formattedDate = formatDate(userData.dateOfBirth);
  const role = userData.role || 'user';
  
  const result = await db.query(
    `INSERT INTO users (phone, email, password, full_name, date_of_birth, gender, address, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userData.phone,
      userData.email,
      hashedPassword,
      userData.fullName,
      formattedDate,
      userData.gender,
      userData.address,
      role
    ]
  );

  const user = await db.query('SELECT id, phone, email, full_name, date_of_birth, gender, address, role, created_at, updated_at FROM users WHERE id = ?', [result.insertId]);
  
  return {
    id: user[0].id,
    phone: user[0].phone,
    email: user[0].email,
    fullName: user[0].full_name,
    dateOfBirth: user[0].date_of_birth,
    gender: user[0].gender,
    address: user[0].address,
    role: user[0].role,
    createdAt: user[0].created_at,
    updatedAt: user[0].updated_at
  };
};

const login = async (phoneOrEmail, password) => {
  const users = await db.query(
    'SELECT * FROM users WHERE phone = ? OR email = ?',
    [phoneOrEmail, phoneOrEmail]
  );
  
  if (users.length === 0) {
    throw new Error('Số điện thoại/email hoặc mật khẩu không đúng');
  }

  const user = users[0];
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Số điện thoại/email hoặc mật khẩu không đúng');
  }

  const payload = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role || 'user'
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await db.query(
    'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    [refreshToken, user.id, expiresAt]
  );

  return {
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.full_name,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      role: user.role || 'user',
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async (refreshToken) => {
  const tokens = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refreshToken]
  );
  
  if (tokens.length === 0) {
    throw new Error('Refresh token không hợp lệ');
  }

  const { verifyRefreshToken } = require('../utils/jwt');
  const decoded = verifyRefreshToken(refreshToken);
  
  const users = await db.query('SELECT id, phone, email, role FROM users WHERE id = ?', [decoded.id]);
  if (users.length === 0) {
    throw new Error('Người dùng không tồn tại');
  }

  const user = users[0];
  const payload = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role || 'user'
  };

  const newAccessToken = generateAccessToken(payload);
  return { accessToken: newAccessToken };
};

const logout = async (refreshToken) => {
  await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
};

const getUserById = async (id) => {
  const users = await db.query(
    'SELECT id, phone, email, full_name, date_of_birth, gender, address, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  
  if (users.length === 0) return null;
  
  const user = users[0];
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    fullName: user.full_name,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
    address: user.address,
    role: user.role || 'user',
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getUserById
};
