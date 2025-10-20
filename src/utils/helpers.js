import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const generateUniqueSlug = async (name) => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.cab.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
