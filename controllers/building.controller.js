const buildingService = require('../services/building.service');

const getAll = async (req, res) => {
  try {
    const buildings = await buildingService.getAll();
    res.json({
      success: true,
      data: buildings
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
    const building = await buildingService.getById(id);
    
    if (!building) {
      return res.status(404).json({
        success: false,
        error: 'Tòa nhà không tồn tại'
      });
    }
    
    res.json({
      success: true,
      data: building
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
    const { name, address, description, floors } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp tên tòa nhà'
      });
    }

    const data = await buildingService.create({
      name,
      address,
      description,
      floors
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo tòa nhà thành công',
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
    const { name, address, description, floors } = req.body;
    
    const data = await buildingService.update(id, {
      name,
      address,
      description,
      floors
    });
    
    res.json({
      success: true,
      message: 'Cập nhật tòa nhà thành công',
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
    
    await buildingService.remove(id);
    
    res.json({
      success: true,
      message: 'Xóa tòa nhà thành công'
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

