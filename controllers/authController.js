import jwt from 'jsonwebtoken';
import  User from '../models/user.model.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import logger from '../logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';

export const signup = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

    const { name, email, password, role } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.status(201).json({ message: "New user registered", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({ token });
  } catch (error) {
    logger.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

