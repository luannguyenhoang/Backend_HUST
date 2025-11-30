class Specialty {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.symptoms = data.symptoms || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = Specialty;

