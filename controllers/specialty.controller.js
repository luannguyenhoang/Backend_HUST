const specialtyService = require('../services/specialty.service');

const getAll = async (req, res) => {
  try {
    const { search, page, pageSize } = req.query;
    const pageNum = page ? parseInt(page) : null;
    const pageSizeNum = pageSize ? parseInt(pageSize) : null;
    
    const result = search 
      ? await specialtyService.search(search, pageNum, pageSizeNum)
      : await specialtyService.getAll(pageNum, pageSizeNum);
    
    if (pageNum !== null && pageSizeNum !== null) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } else {
      res.json({
        success: true,
        data: result
      });
    }
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
    const data = await specialtyService.getById(id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy chuyên khoa'
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
    const { name, description, symptoms, buildingId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên chuyên khoa'
      });
    }

    const data = await specialtyService.create({
      name,
      description,
      symptoms: symptoms ? (Array.isArray(symptoms) ? symptoms : symptoms.split(',').map(s => s.trim())) : null,
      buildingId
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chuyên khoa thành công',
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
    const { name, description, symptoms, buildingId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên chuyên khoa'
      });
    }

    const data = await specialtyService.update(id, {
      name,
      description,
      symptoms: symptoms ? (Array.isArray(symptoms) ? symptoms : symptoms.split(',').map(s => s.trim())) : null,
      buildingId
    });

    res.json({
      success: true,
      message: 'Cập nhật chuyên khoa thành công',
      data
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
  update
};

