class FamilyMember {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.fullName = data.fullName;
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;
    this.relationship = data.relationship;
    this.phone = data.phone;
    this.address = data.address;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = FamilyMember;

