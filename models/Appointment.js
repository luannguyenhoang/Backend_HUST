class Appointment {
  constructor(data) {
    this.id = data.id;
    this.doctorId = data.doctorId;
    this.specialtyId = data.specialtyId;
    this.date = data.date;
    this.timeSlot = data.timeSlot;
    this.room = data.room;
    this.building = data.building;
    this.maxPatients = data.maxPatients || 20;
    this.currentPatients = data.currentPatients || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = Appointment;

