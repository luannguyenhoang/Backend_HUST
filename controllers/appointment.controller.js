const appointmentService = require('../services/appointment.service');
const doctorService = require('../services/doctor.service');

const getAll = async (req, res) => {
  try {
    const { doctorId, specialtyId, date, page, size } = req.query;
    
    const pageNum = parseInt(page) || 0;
    const sizeNum = parseInt(size) || 20;
    
    const filters = {};
    if (doctorId) filters.doctorId = parseInt(doctorId);
    if (specialtyId) filters.specialtyId = parseInt(specialtyId);
    if (date) filters.date = date;
    
    const pageResult = await appointmentService.getAllPaginated(pageNum, sizeNum, filters);
    
    res.json({
      success: true,
      data: pageResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { specialtyId, doctorId, date, title } = req.query;
    
    if (!specialtyId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp specialtyId và date'
      });
    }

    const data = await appointmentService.getAvailableSlots(
      specialtyId,
      doctorId,
      date,
      title
    );
    
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
    const { doctorId, specialtyId, date, timeSlot, maxPatients } = req.body;
    
    if (!doctorId || !specialtyId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: doctorId, specialtyId, date, timeSlot'
      });
    }

    const doctor = await doctorService.getById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Bác sĩ không tồn tại'
      });
    }

    // Đảm bảo date được format đúng YYYY-MM-DD
    let dateStr = date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }

    const data = await appointmentService.create({
      doctorId,
      specialtyId,
      date: dateStr,
      timeSlot,
      room: doctor.room,
      building: doctor.building,
      maxPatients: maxPatients || 20
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo lịch khám thành công',
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
    const { maxPatients } = req.body;
    
    if (!maxPatients || maxPatients < 1) {
      return res.status(400).json({
        success: false,
        error: 'Số bệnh nhân tối đa phải lớn hơn 0'
      });
    }

    const data = await appointmentService.update(id, { maxPatients });
    
    res.json({
      success: true,
      message: 'Cập nhật lịch khám thành công',
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
    
    await appointmentService.remove(id);
    
    res.json({
      success: true,
      message: 'Xóa lịch khám thành công'
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
  getAvailableSlots,
  create,
  update,
  remove
};

