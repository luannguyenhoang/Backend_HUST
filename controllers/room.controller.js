const roomService = require('../services/room.service');

const getAll = async (req, res) => {
  try {
    const { building, search } = req.query;
    let rooms = await roomService.getAll();
    
    if (building) {
      rooms = rooms.filter(r => r.building === building);
    }
    
    if (search) {
      const keyword = search.toLowerCase();
      rooms = rooms.filter(r => 
        r.roomNumber.toLowerCase().includes(keyword) ||
        r.building.toLowerCase().includes(keyword) ||
        (r.description && r.description.toLowerCase().includes(keyword))
      );
    }
    
    res.json({
      success: true,
      data: rooms
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
    const room = await roomService.getById(id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Phòng không tồn tại'
      });
    }
    
    res.json({
      success: true,
      data: room
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
    const { roomNumber, buildingId, specialtyId, floor, capacity, description } = req.body;
    
    if (!roomNumber || !buildingId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp số phòng và tòa nhà'
      });
    }

    const data = await roomService.create({
      roomNumber,
      buildingId,
      specialtyId,
      floor,
      capacity,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
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
    const { roomNumber, buildingId, specialtyId, floor, capacity, description } = req.body;
    
    const data = await roomService.update(id, {
      roomNumber,
      buildingId,
      specialtyId,
      floor,
      capacity,
      description
    });
    
    res.json({
      success: true,
      message: 'Cập nhật phòng thành công',
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
    
    await roomService.remove(id);
    
    res.json({
      success: true,
      message: 'Xóa phòng thành công'
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

