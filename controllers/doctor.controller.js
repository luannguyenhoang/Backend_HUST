const doctorService = require('../services/doctor.service');

const getAll = async (req, res) => {
  try {
    const { specialtyId, search } = req.query;
    let data;
    
    if (specialtyId) {
      data = await doctorService.getBySpecialty(specialtyId);
    } else if (search) {
      data = await doctorService.search(search);
    } else {
      data = await doctorService.getAll();
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

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await doctorService.getById(id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy bác sĩ'
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
    const { fullName, title, specialtyId, roomId } = req.body;
    
    if (!fullName || !specialtyId || !roomId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc (fullName, specialtyId, roomId)'
      });
    }

    const data = await doctorService.create({
      fullName,
      title,
      specialtyId,
      roomId
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bác sĩ thành công',
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
    const { fullName, title, specialtyId, roomId } = req.body;
    
    const data = await doctorService.update(id, {
      fullName,
      title,
      specialtyId,
      roomId
    });
    
    res.json({
      success: true,
      message: 'Cập nhật bác sĩ thành công',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await doctorService.remove(id);
    
    res.json({
      success: true,
      message: 'Xóa bác sĩ thành công'
    });
  } catch (error) {
    res.status(400).json({
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
  remove
};

