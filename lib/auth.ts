import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    // Real Google OAuth — add credentials in .env
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Demo login — works without any credentials (dev only)
    CredentialsProvider({
      id: 'demo',
      name: 'Demo',
      credentials: {
        name: { type: 'text' },
        email: { type: 'email' },
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return {
            id: '1',
            name: credentials.name || 'Étudiant',
            email: credentials.email,
            image: null,
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
}
