const bcrypt = require("bcrypt");

// 0 - Not verified user
// 1 - Verified user
const mockUsers = [
  {
    userId: "123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: bcrypt.hashSync("password123", 10), 
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
    userType: "customer",
    isVerified: false
  },
  {
    userId: "124",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    password: bcrypt.hashSync("password123", 10), 
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
    isVerified: true
  }
];

module.exports = { mockUsers };
