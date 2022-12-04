const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @route   POST /user
// @desc    Create new user
// @access  Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // confirm Data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    res.status(400).json({ message: "All fields are required" });
  }
  // Check duplicate username
  const Duplicate = await User.findOne({ username }).lean().exec();
  if (Duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 is the salt
  const userObject = {
    username,
    password: hashedPwd,
    roles,
  };
  const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `User ${username} successfully created` });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// @route   GET /users
// @desc    Read users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(-"password").lean();
  if (!users?.length) {
    res.status(404).json({ message: "No users found" });
  }
  res.status(200).json(users);
});

// @route   UPDATE /user
// @desc    Update user
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;
  // check data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  // Check duplicate username
  const Duplicate = await User.findOne({ username }).lean().exec();
  // allow duplicate to the original user
  if (Duplicate && Duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  user.username = username;
  user.roles = roles;
  user.active = active;
  if (password) {
    const hashedPwd = await bcrypt.hash(password, 10); // 10 is the salt
    user.password = hashedPwd;
  }
  const updatedUser = await user.save();

  res.json({ message: `User ${updatedUser.username} successfully updated` });
});

// @route   DELETE /user
// @desc    Delete a user
// @access  Private
const deleteUser = asyncHandler( async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
      return res.status(400).json({ message: 'User ID Required' })
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec()
  if (note) {
      return res.status(400).json({ message: 'User has assigned notes' })
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec()

  if (!user) {
      return res.status(400).json({ message: 'User not found' })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`

  res.json(reply)
})

module.exports = {
  createNewUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
