import { prisma } from '../../../config/connection.js';
import { asyncHandler } from '../../middleware/errorHandling.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: true,
      clientProfile: true,
      auditorProfile: true,
      cab: true,
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { userId: user.id, roles: user.roles.map((r) => r.role) },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const cabId =
    user.clientProfile?.cabId ||
    user.auditorProfile?.cabId ||
    user.cab?.id ||
    null;

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      ...(cabId && { cabId }),
    },
  });
});




export const registerClientFromCabLink = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const {
    companyName,
    companyAddress,
    contactPerson,
    email,
    requiredStandardId,
    sectorId,
    invitationCode,
  } = req.body;
  const cab = await prisma.cab.findUnique({ where: { slug } });
  if (!cab)
    return res.status(404).json({ success: false, message: "Invalid CAB link" });

  const scheme = await prisma.scheme.findUnique({
    where: { id: Number(requiredStandardId) },
  });
  if (!scheme)
    return res.status(400).json({ success: false, message: "Invalid Scheme ID" });

  let sector = null;
  if (sectorId) {
    sector = await prisma.sector.findUnique({
      where: { id: Number(sectorId) },
    });
    if (!sector)
      return res.status(400).json({ success: false, message: "Invalid Sector ID" });
  }

  let user = await prisma.user.findUnique({ where: { email } });
  let clientProfile;
  let temporaryPassword = null;

  if (!user) {
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    temporaryPassword = password;

    user = await prisma.user.create({
      data: {
        email,
        name: contactPerson,
        password: hashedPassword,
        userType: "CLIENT",
        roles: { create: [{ role: "CLIENT_USER" }] },
      },
    });

    clientProfile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        cabId: cab.id,
        companyName,
        companyAddress,
        contactPerson,
        invitationCode,
      },
    });
  } else {
    clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: user.id,
          cabId: cab.id,
          companyName,
          companyAddress,
          contactPerson,
          invitationCode,
        },
      });
    }
  }
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      cabId: cab.id,
      clientProfileId: clientProfile.id,
      schemeId: scheme.id,
      sectorId: sector ? sector.id : null,
      status: "PENDING",
    },
    include: {
      scheme: true,
      sector: true,
      cab: { select: { id: true, name: true, slug: true } },
    },
  });

  res.status(user ? 200 : 201).json({
    success: true,
    message: user
      ? "Service Request created for existing client"
      : "Client registered and Service Request created successfully",
    data: {
      cab: serviceRequest.cab,
      client: {
        id: clientProfile.id,
        companyName: clientProfile.companyName,
        contactPerson: clientProfile.contactPerson,
        email: user.email,
      },
      serviceRequest: {
        id: serviceRequest.id,
        status: serviceRequest.status,
        scheme: { id: scheme.id, name: scheme.name },
        sector: sector ? { id: sector.id, name: sector.name } : null,
      },
      ...(temporaryPassword && { temporaryPassword }),
    },
  });
});







