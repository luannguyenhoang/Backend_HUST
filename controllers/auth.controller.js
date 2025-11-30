const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { phone, email, password, fullName, dateOfBirth, gender, address } = req.body;
    
    if (!phone || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    const user = await authService.register({
      phone,
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;
    
    if (!phoneOrEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập số điện thoại/email và mật khẩu'
      });
    }

    const result = await authService.login(phoneOrEmail, password);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token là bắt buộc'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      authService.logout(refreshToken);
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};

