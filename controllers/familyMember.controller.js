const familyMemberService = require('../services/familyMember.service');

const getAll = async (req, res) => {
  try {
    const data = await familyMemberService.getAll(req.user.id);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await familyMemberService.getById(id, req.user.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thành viên'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const create = async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, relationship, phone, address } = req.body;
    
    if (!fullName || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    const data = await familyMemberService.create({
      userId: req.user.id,
      fullName,
      dateOfBirth,
      gender,
      relationship,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Thêm thành viên thành công',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await familyMemberService.update(id, req.user.id, req.body);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thành viên'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await familyMemberService.delete(id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thành viên'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa thành viên thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteMember
};

