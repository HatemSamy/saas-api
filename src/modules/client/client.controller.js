
import { prisma } from '../../../config/connection.js';
import { asyncHandler } from '../../middleware/errorHandling.js'




export const getClientRequestedServices = asyncHandler(async (req, res) => {
  const client = await prisma.clientProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client profile not found.",
    });
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { clientProfileId: client.id },
    include: {
      scheme: { select: { name: true } },
      sector: { select: { name: true } },
      cab: { select: { name: true } },
    },
  });

  if (!requests.length) {
    return res.status(200).json({
      success: true,
      message: "No service requests found for this client.",
      data: [],
    });
  }

  const formattedRequests = requests.map((r) => ({
    id: r.id,
    cabId: r.cabId,
    clientProfileId: r.clientProfileId,
    schemeId: r.schemeId,
    schemeName: r.scheme?.name,
    sectorId: r.sectorId,
    sectorName: r.sector?.name ,
    cabName: r.cab?.name ,
    status: r.status,
  }));

  return res.status(200).json({
    success: true,
    message: "Client service requests retrieved successfully.",
    data: formattedRequests,
  });
});


