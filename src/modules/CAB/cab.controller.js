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
    schemes,          
    technicalSectors,  
    adminName,
    adminEmail,
    adminPassword,
  } = req.body;

  const existingCab = await prisma.cab.findUnique({ where: { name } });
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingCab)
    return res.status(400).json({ success: false, message: "CAB already exists" });
  if (existingUser)
    return res.status(400).json({ success: false, message: "Admin email already used" });

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
        userType: "CAB",
        roles: {
          create: [{ role: "CAB_ADMIN" }],
        },
      },
    },
  };

  if (schemes?.length) {
    cabData.schemes = {
      create: schemes.map((schemeId) => ({
        scheme: { connect: { id: schemeId } },
      })),
    };
  }

  if (technicalSectors?.length) {
    cabData.technicalSectors = {
      create: technicalSectors.map((sectorId) => ({
        sector: { connect: { id: sectorId } },
      })),
    };
  }

  const cab = await prisma.cab.create({
    data: cabData,
    include: {
      schemes: { include: { scheme: true } },
      technicalSectors: { include: { sector: true } },
      users: { select: { id: true, name: true, email: true, roles: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: "CAB account created successfully",
    data: cab,
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



export const getCabSchemes = asyncHandler(async (req, res) => {
  const { cabId } = req.params;

  const cab = await prisma.cab.findUnique({
    where: { id: Number(cabId) },
  });

  if (!cab) {
    return res.status(404).json({
      success: false,
      message: "CAB not found",
    });
  }

  const cabSchemes = await prisma.cabScheme.findMany({
    where: { cabId: Number(cabId) },
    include: {
      scheme: {
        include: {
          sectors: true,
        },
      },
    },
  });

  if (cabSchemes.length === 0) {
    return res.status(200).json({
      success: true,
      message: "This CAB has no assigned schemes yet",
      data: [],
    });
  }

  const formattedData = cabSchemes.map((cs) => ({
    id: cs.scheme.id,
    name: cs.scheme.name,
    sectors: cs.scheme.sectors.map((s) => ({
      id: s.id,
      name: s.name,
      iafCode: s.iafCode,
      description: s.description,
      criticalCode: s.criticalCode,
    })),
  }));

  res.status(200).json({
    success: true,
    message: "CAB schemes fetched successfully",
    data: formattedData,
  });
});



export const selectCabScheme = asyncHandler(async (req, res) => {
  const { cabId } = req.params;
  const { schemeId, sectorIds } = req.body;

  const cab = await prisma.cab.findUnique({
    where: { id: Number(cabId) },
  });

  if (!cab) {
    return res.status(404).json({
      success: false,
      message: 'CAB not found',
    });
  }

  const existingCabScheme = await prisma.cabScheme.findFirst({
    where: {
      cabId: Number(cabId),
      schemeId: Number(schemeId),
    },
  });

  if (existingCabScheme) {
    return res.status(200).json({
      success: true,
      message: 'This scheme already exists for this CAB',
    });
  }

  const newCabScheme = await prisma.cabScheme.create({
    data: {
      cabId: Number(cabId),
      schemeId: Number(schemeId),
    },
  });

  if (Array.isArray(sectorIds) && sectorIds.length > 0) {
    await Promise.all(
      sectorIds.map(async (sectorId) => {
        const existingSector = await prisma.cabTechnicalSector.findFirst({
          where: {
            cabId: Number(cabId),
            sectorId: Number(sectorId),
          },
        });

        if (!existingSector) {
          await prisma.cabTechnicalSector.create({
            data: {
              cabId: Number(cabId),
              sectorId: Number(sectorId),
            },
          });
        }
      })
    );
  }

  return res.status(201).json({
    success: true,
    message: 'Scheme and related sectors added successfully to CAB',
    data: newCabScheme,
  });
});



export const addCabUser = asyncHandler(async (req, res) => {
  const { cabId, name, email, password, roles } = req.body;

  const cab = await prisma.cab.findUnique({ where: { id: cabId } });
  if (!cab)
    return res.status(404).json({
      success: false,
      message: "CAB not found.",
    });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(400).json({
      success: false,
      message: "Email is already in use.",
    });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      userType: "CAB",
      cab: { connect: { id: cabId } },

      roles: {
        create: roles.map((r) => ({
          role: r,
          cabId,
        })),
      },
    },
    include: {
      roles: true,
      cab: { select: { id: true, name: true, country: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: "CAB user with multiple roles created successfully.",
    data: user,
  });
});






