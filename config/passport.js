import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        })
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await prisma.user.findFirst({
            where: { googleId: profile.id }
        })

        if (user) {
            // User exists, return user
            return done(null, user)
        }

        // Check if user exists with the same email
        user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value }
        })

        if (user) {
            // User exists with same email, link Google account
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: profile.id,
                    avatar: profile.photos[0]?.value
                }
            })
            return done(null, user)
        }

        // Create new user
        user = await prisma.user.create({
            data: {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value,
                isEmailVerified: true, // Google accounts are pre-verified
                authProvider: 'google'
            }
        })

        return done(null, user)
    } catch (error) {
        return done(error, null)
    }
}))

export default passport