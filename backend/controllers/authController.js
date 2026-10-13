/** Register / login / profile. */
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { signToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');
const {
  requireString,
  requireEmail,
  requirePassword,
  optionalString,
} = require('../utils/validators');

const SALT_ROUNDS = 10;

const authController = {
  register(req, res) {
    const name = requireString(req.body.name, 'Full name', { min: 2, max: 80 });
    const email = requireEmail(req.body.email);
    const password = requirePassword(req.body.password);
    const phone = optionalString(req.body.phone, { max: 20 });

    if (userModel.findByEmail(email)) {
      throw ApiError.badRequest('That email is already registered.');
    }

    // Passwords are never stored in plain text.
    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);
    // The role is hard-coded: nobody can register themselves as an admin.
    const user = userModel.create({ name, email, password: hashed, phone, role: 'customer' });

    res.status(201).json({
      success: true,
      token: signToken(user),
      user: userModel.toPublicUser(user),
    });
  },

  login(req, res) {
    const email = requireEmail(req.body.email);
    const password = requireString(req.body.password, 'Password');

    const user = userModel.findByEmail(email);
    // Same message for both cases so we do not reveal which emails exist.
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw ApiError.unauthorized('Incorrect email or password.');
    }

    res.json({
      success: true,
      token: signToken(user),
      user: userModel.toPublicUser(user),
    });
  },

  /** Used by the app on start-up to check whether the saved token still works. */
  me(req, res) {
    res.json({ success: true, user: req.user });
  },

  updateProfile(req, res) {
    const name = requireString(req.body.name, 'Full name', { min: 2, max: 80 });
    const phone = optionalString(req.body.phone, { max: 20 });
    const user = userModel.updateProfile(req.user.id, { name, phone });
    res.json({ success: true, user: userModel.toPublicUser(user) });
  },
};

module.exports = authController;
