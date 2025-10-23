import { prisma } from '../../../config/connection.js';
import { asyncHandler } from '../../middleware/errorHandling.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, role: user.role, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType
    }
  });
});
