import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

const ALLOWED_DOMAINS = ['kenkohkai.jp', 'kunimoto-hp.com'];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = (profile as { email?: string } | undefined)?.email ?? '';
      return ALLOWED_DOMAINS.some((d) => email.toLowerCase().endsWith(`@${d}`));
    },
    async session({ session, token }) {
      if (token?.email && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
