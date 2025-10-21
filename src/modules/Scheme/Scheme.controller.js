import { prisma } from '../../../config/connection.js'; 

import { asyncHandler } from '../../middleware/errorHandling.js'


export const createScheme = asyncHandler(async (req, res) => {
  const { name, sectors } = req.body;

  // Check if scheme already exists
  const existingScheme = await prisma.scheme.findUnique({ where: { name } });
  if (existingScheme) {
    return res.status(400).json({
      success: false,
      message: 'Scheme already exists',
    });
  }

  // Create scheme with optional sectors
  const scheme = await prisma.scheme.create({
    data: {
      name,
      sectors: sectors?.length
        ? {
            create: sectors.map((s) => ({
              name: s.name,
              iafCode: s.iafCode,
              description: s.description || null,
              criticalCode: s.criticalCode || null,
            })),
          }
        : undefined, 
    },
    include: {
      sectors: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Scheme created successfully',
    data: scheme,
  });
});



export const getSchemes = asyncHandler(async (req, res) => {
  const schemes = await prisma.scheme.findMany({
    include: {
      sectors: true,
    },
  });

  if (!schemes || schemes.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No schemes found',
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    message: 'Schemes fetched successfully',
    data: schemes,
  });
});




// 📍 GET /api/v1/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, userType, page = 1, size = 10 } = req.query;

  const skip = (page - 1) * size;
  const take = parseInt(size);

  // Build filter dynamically
  const filters = {};
  if (role) filters.role = role;
  if (userType) filters.userType = userType;

  const users = await prisma.user.findMany({
    where: filters,
    skip,
    take,
   
    orderBy: { createdAt: 'desc' }
  });

  if (!users.length) {
    return res.status(404).json({
      success: false,
      message: 'No users found'
    });
  }

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});




export const addSectorToScheme = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const { name, iafCode, description, criticalCode } = req.body;
  const existingScheme = await prisma.scheme.findUnique({
    where: { id: Number(schemeId) },
  });

  if (!existingScheme) {
    return res.status(404).json({
      success: false,
      message: 'Scheme not found',
    });
  }

  const existingSector = await prisma.sector.findFirst({
    where: {
      schemeId: Number(schemeId),
      name,
    },
  });

  if (existingSector) {
    return res.status(400).json({
      success: false,
      message: 'Sector already exists in this scheme',
    });
  }

  const sector = await prisma.sector.create({
    data: {
      name,
      iafCode,
      description: description || null,
      criticalCode: criticalCode || null,
      schemeId: Number(schemeId),
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Sector added successfully to the scheme',
    data: sector,
  });
});
