class Doctor {
  constructor(data) {
    this.id = data.id;
    this.fullName = data.fullName;
    this.title = data.title;
    this.specialtyId = data.specialtyId;
    this.room = data.room;
    this.building = data.building;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = Doctor;

