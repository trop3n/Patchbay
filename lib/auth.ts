import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    role: Role
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      username: string
      role: Role
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    username: string
    role: Role
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password || !user.isActive) {
          return null
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.lastVerified = Date.now()
      }

      // Re-validate role and active status from DB every 5 minutes
      const REVALIDATION_INTERVAL = 5 * 60 * 1000
      const lastVerified = (token.lastVerified as number) || 0
      if (Date.now() - lastVerified > REVALIDATION_INTERVAL) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, isActive: true, username: true },
          })

          if (!dbUser || !dbUser.isActive) {
            // Return empty token to force sign-out
            return { ...token, id: '', role: 'VIEWER' as const, invalidated: true }
          }

          token.role = dbUser.role
          token.username = dbUser.username
          token.lastVerified = Date.now()
        } catch {
          // If DB is unreachable, keep existing token to avoid locking everyone out
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        if (token.invalidated) {
          // Force the session to appear invalid so the user gets redirected
          session.user.id = ''
          return session
        }
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const authOptions = { handlers, signIn, signOut, auth }
