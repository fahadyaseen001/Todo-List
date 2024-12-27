import { userSchema } from '@/schema/user-schema';
import User from '@/models/user';
import dbConnect from '@/utils/dbConnect';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  // Validate inputs using the Zod schema
  try {
    userSchema.pick({ email, password }).parse({ email, password }); // Validating only email and password for sign-in
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Unexpected error during validation' });
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'User Login successful',
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}