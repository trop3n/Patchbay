import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import ldap from 'ldapjs'
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

async function verifyLDAPCredentials(username: string, password: string): Promise<{ email: string; name: string } | null> {
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: process.env.LDAP_URL!,
    })

    const bindDN = process.env.LDAP_SEARCH_FILTER!.replace('{username}', username)

    client.bind(bindDN, password, (err: Error | null) => {
      if (err) {
        client.destroy()
        resolve(null)
        return
      }

      client.search(process.env.LDAP_BASE_DN!, {
        filter: process.env.LDAP_SEARCH_FILTER!.replace('{username}', username),
        scope: 'sub',
      }, (err: Error | null, res: ldap.SearchCallbackResponse) => {
        if (err) {
          client.destroy()
          resolve(null)
          return
        }

        let user: { email: string; name: string } | null = null

        res.on('searchEntry', (entry: ldap.SearchEntry) => {
          const pojo = entry.pojo
          user = {
            email: (pojo.attributes.find(a => a.type === 'mail')?.values[0]) || `${username}@company.local`,
            name: (pojo.attributes.find(a => a.type === 'cn')?.values[0]) || username,
          }
        })

        res.on('error', () => {
          client.destroy()
          resolve(null)
        })

        res.on('end', () => {
          client.destroy()
          resolve(user)
        })
      })
    })
  })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'LDAP',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const ldapUser = await verifyLDAPCredentials(
          credentials.username as string,
          credentials.password as string
        )

        if (!ldapUser) {
          return null
        }

        let user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: ldapUser.email,
              name: ldapUser.name,
              username: credentials.username as string,
              role: 'VIEWER',
            },
          })
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
        }

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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
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
