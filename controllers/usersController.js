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
  if (!username || !password || !Array.isArray(roles) || !roles)
    return res.status(400).json({ message: "All fields are required!" });

  // check dups
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate)
    return res.status(409).json({ message: "User already exists!" });

  // encrypt password
  const hashedPwd = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username: username,
    password: hashedPwd,
    roles: roles,
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
    !Arrays.isArray(roles) ||
    !roles ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const foundUser = await User.findById(id).exec();

  if (!foundUser) return res.status(400).json({ message: "User not found!" });

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id !== id)
    return res
      .status(409)
      .json({ message: "Duplicate username already exists!" });

  foundUser.username = username;
  foundUser.roles = roles;
  foundUser.active = active;

  if (password) {
    foundUser.password = await bcrypt.hash(password, 10);
  }

  const updateUser = await foundUser.save();
  res.json({ message: `User ${updateUser.username} updated successfully!` });
});

// @desc DELETE a users
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: `User ID required!` });

  const hasNotes = await User.findOne({ user: id }).learn().exec();
  if (hasNotes?.length)
    return res.status(400).json({ message: "User has assigned notes!" });

  const user = await User.findByIdAndDelete({ id }).exec();
  if (!user)
    return res.status(400).json({ message: `User with ID ${id} not found!` });

  res.json({
    message: `Username ${user.username} with id ${user.id} deleted!`,
  });
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
