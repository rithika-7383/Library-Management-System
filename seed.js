require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");
const connectDB = require("../config/db");

async function seed() {
  await connectDB();

  const adminEmail = "admin@library.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Library Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "admin"
    });
    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }

  const count = await Book.countDocuments();
  if (!count) {
    await Book.insertMany([
      { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Programming", publisher: "Prentice Hall", year: 2008, quantity: 5, availableCopies: 5 },
      { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780061122415", category: "Fiction", publisher: "HarperOne", year: 1993, quantity: 4, availableCopies: 4 },
      { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262046305", category: "Computer Science", publisher: "MIT Press", year: 2022, quantity: 3, availableCopies: 3 },
      { title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "9780078022159", category: "Database", publisher: "McGraw-Hill", year: 2019, quantity: 3, availableCopies: 3 }
    ]);
    console.log("Sample books inserted");
  }

  await mongoose.connection.close();
}
seed();
