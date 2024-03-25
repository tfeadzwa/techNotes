const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc GET all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const users = await User.find().select("-password").lean();
  if (!users?.length)
    return res.status(400).json({ message: "No users found!" });
  return res.json(users);
});

// @desc Create
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length)
    return res.status(400).json({ message: `All fields are required!` }); // Corrected template literal syntax

  // check dups
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate)
    return res.status(409).json({ message: "User already exists!" });

  // encrypt password
  const hashedPwd = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashedPwd,
    roles,
  });

  if (!newUser)
    return res.status(400).json({ message: "Invalid user data received!" });

  return res.status(201).json(newUser);
});

// @desc UPDATE all users
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    roles.length === 0 ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const foundUser = await User.findById(id).exec();

  if (!foundUser) return res.status(404).json({ message: "User not found!" });

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate._id.toString() !== id)
    return res
      .status(409)
      .json({ message: "Duplicate username already exists!" });

  foundUser.username = username;
  foundUser.roles = roles;
  foundUser.active = active;

  if (password) {
    // Ensure the password is new before hashing
    const isSamePassword = await bcrypt.compare(password, foundUser.password);
    if (!isSamePassword) {
      foundUser.password = await bcrypt.hash(password, 10);
    }
  }

  const updatedUser = await foundUser.save();
  // Exclude the password from the response
  const { password: _, ...updatedUserData } = updatedUser.toObject();
  res.json({
    message: `User ${updatedUserData.username} updated successfully!`,
    user: updatedUserData,
  });
});

// @desc DELETE a user
// @route DELETE /users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "User ID required!" });

  const hasNotes = await Note.findOne({ userId: id }).exec(); // Assuming 'userId' is the correct field
  if (hasNotes)
    return res.status(400).json({ message: "User has assigned notes!" });

  const user = await User.findById(id).exec(); // Find the user before deletion
  if (!user)
    return res.status(404).json({ message: `User with ID ${id} not found!` });

  const username = user.username; // Store username before deletion
  await User.findByIdAndDelete(id).exec(); // Delete the user

  res.json({
    message: `Username ${username} with id ${id} deleted!`,
  });
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
