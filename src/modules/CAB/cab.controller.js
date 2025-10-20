import { prisma } from '../../../config/connection.js';

import bcrypt from 'bcrypt';
import { asyncHandler } from '../../middleware/errorHandling.js'
import { generateUniqueSlug } from '../../utils/helpers.js';



export const createCab = asyncHandler(async (req, res) => {
  const {
    name,
    country,
    hqAddress,
    branches,
    accreditationBody,
    validTo,
    schemes,           // optional
    technicalSectors,  // optional
    adminName,
    adminEmail,
    adminPassword,
  } = req.body;

  // Check if CAB or admin email already exists
  const existingCab = await prisma.cab.findUnique({ where: { name } });
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingCab)
    return res.status(400).json({ success: false, message: 'CAB already exists' });
  if (existingUser)
    return res.status(400).json({ success: false, message: 'Admin email already used' });

  // Business rule: cannot create technical sectors without schemes
  if ((!schemes || !schemes.length) && technicalSectors?.length) {
    return res.status(400).json({
      success: false,
      message: 'Cannot create technical sectors without schemes'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const slug = await generateUniqueSlug(name);

  const cabData = {
    name,
    country,
    hqAddress,
    branches,
    accreditationBody,
    validTo: validTo ? new Date(validTo) : null,
    slug,
    users: {
      create: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'CAB_ADMIN',
        userType: 'CAB'
      }
    }
  };

  // Optional Schemes
  if (schemes?.length) {
    cabData.schemes = {
      create: schemes.map(s => ({
        scheme: { create: { name: s.name } }
      }))
    };
  }

  // Optional Technical Sectors (only if schemes exist)
  if (technicalSectors?.length && schemes?.length) {
    cabData.technicalSectors = {
      create: technicalSectors.map(t => ({
        sector: {
          create: {
            name: t.name,
            iafCode: t.iafCode,
            description: t.description || null,
            criticalCode: t.criticalCode || null
          }
        }
      }))
    };
  }

  // Create CAB
  const cab = await prisma.cab.create({
    data: cabData,
    include: {
      schemes: { include: { scheme: true } },
      technicalSectors: { include: { sector: true } },
      users: { select: { id: true, name: true, email: true, role: true } }
    }
  });

  res.status(201).json({
    success: true,
    message: 'CAB created successfully',
    data: cab
  });
});


export const generateCabLink = asyncHandler(async (req, res) => {
  const { cabId } = req.params;

  const cab = await prisma.cab.findUnique({ where: { id: Number(cabId) } });
  if (!cab)
    return res.status(404).json({ success: false, message: 'CAB not found' });

  const baseUrl = process.env.MAIN_PLATFORM_URL ;
  const shareableLink = `${baseUrl}/cab/${cab.slug}`;

  const updatedCab = await prisma.cab.update({
    where: { id: cab.id },
    data: { shareableLink },
  });

  res.status(200).json({
    success: true,
    message: 'CAB link generated successfully',
    data: { shareableLink: updatedCab.shareableLink },
  });
});


export const getCabPortal = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const cab = await prisma.cab.findUnique({
    where: { slug },
    include: {
      schemes: true,
      technicalSectors: true,
      
    },
  });

  if (!cab) {
    return res.status(404).json({
      success: false,
      message: 'CAB not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'CAB portal loaded successfully',
    data: cab,
  });
});

