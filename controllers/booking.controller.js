const bookingService = require('../services/booking.service');
const familyMemberService = require('../services/familyMember.service');

const getAll = async (req, res) => {
  try {
    const data = await bookingService.getAll(req.user.id);
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
    const data = await bookingService.getById(id, req.user.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đặt lịch'
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
    const { appointmentId, doctorId, specialtyId, date, timeSlot, patientId, symptoms, fee } = req.body;
    
    if (!appointmentId && (!doctorId || !specialtyId || !date || !timeSlot)) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp appointmentId hoặc (doctorId, specialtyId, date, timeSlot)'
      });
    }

    let finalPatientId = patientId || req.user.id;
    
    if (patientId && patientId !== req.user.id) {
      const member = await familyMemberService.getById(patientId, req.user.id);
      if (!member) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thành viên gia đình'
        });
      }
      finalPatientId = patientId;
    }

    const data = await bookingService.create({
      userId: req.user.id,
      patientId: finalPatientId,
      appointmentId,
      doctorId,
      specialtyId,
      date,
      timeSlot,
      symptoms,
      fee
    });

    res.status(201).json({
      success: true,
      message: 'Đặt lịch thành công',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await bookingService.cancel(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Hủy đặt lịch thành công',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getQueueInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await bookingService.getQueueInfo(id, req.user.id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const data = await bookingService.getAllAdmin();
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

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  cancel,
  getQueueInfo
};

