class Booking {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.patientId = data.patientId;
    this.appointmentId = data.appointmentId;
    this.doctorId = data.doctorId;
    this.specialtyId = data.specialtyId;
    this.symptoms = data.symptoms;
    this.bookingCode = data.bookingCode;
    this.queueNumber = data.queueNumber;
    this.status = data.status || 'pending';
    this.fee = data.fee;
    this.examinationDate = data.examinationDate;
    this.examinationTime = data.examinationTime;
    this.room = data.room;
    this.building = data.building;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = Booking;

