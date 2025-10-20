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




