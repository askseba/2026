import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import logger from '@/lib/logger'

// Required for /api/auth/session and JWT signing. Never leave undefined in production.
const secret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === 'development' ? 'dev-secret-change-in-production' : undefined)

if (process.env.NODE_ENV === 'production' && !secret) {
  throw new Error(
    'Auth secret is required in production. Set AUTH_SECRET or NEXTAUTH_SECRET in the environment.'
  )
}

const providers = [
  // Google only when credentials are set (avoids "server configuration problem")
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'البريد الإلكتروني', type: 'email' },
      password: { label: 'كلمة المرور', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const email = credentials.email as string
      const password = credentials.password as string

      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            statsVerified: true,
          },
        })

        if (!user) {
          throw new Error('البريد الإلكتروني غير مسجل. هل تريد إنشاء حساب جديد؟')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          throw new Error('كلمة المرور غير صحيحة. حاول مرة أخرى أو اضغط "نسيت كلمة المرور".')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || null,
          image: user.image || null,
          bio: user.bio || undefined,
          role: user.role,
          statsVerified: user.statsVerified,
        }
      } catch (error) {
        logger.error('[Auth] Database error:', error)
        return null
      }
    },
  }),
]

export const authOptions: NextAuthConfig = {
  trustHost: true,
  secret,
  providers,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.bio = user.bio
        token.role = user.role
        token.statsVerified = (user as { statsVerified?: boolean }).statsVerified
      }
      if (trigger === 'update' && session) {
        token.bio = session.bio ?? token.bio
        token.image = session.image ?? token.image
        if (session.statsVerified !== undefined) {
          token.statsVerified = session.statsVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.bio = token.bio as string | undefined
        session.user.image = token.image as string | undefined
        session.user.role = token.role as string | undefined
        session.user.statsVerified = token.statsVerified as boolean | undefined
      }
      return session
    },
  },
}

const nextAuth = NextAuth(authOptions)

export const { handlers, auth, signIn, signOut } = nextAuth
