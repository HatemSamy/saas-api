// config/connection.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const connectDB = async () => {
    try {
        await prisma.$connect()
        console.log('Database connected successfully with Prisma!')
        return prisma
    } catch (error) {
        console.error('Database connection failed:', error)
        process.exit(1)
    }
}

const disconnectDB = async () => {
    try {
        await prisma.$disconnect()
        console.log('Database disconnected successfully!')
    } catch (error) {
        console.error('Database disconnection failed:', error)
    }
}

export { prisma, connectDB, disconnectDB }