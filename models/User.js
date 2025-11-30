class User {
  constructor(data) {
    this.id = data.id;
    this.phone = data.phone;
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.fullName;
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;
    this.address = data.address;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = User;

