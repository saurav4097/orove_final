import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import  dbConnect from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
   async signIn({ profile }) {
  try {
    await dbConnect();

    const userExists = await User.findOne({ email: profile?.email });

    if (!userExists) {
      await User.create({
        email: profile?.email,
        username: profile?.name?.replace(/\s/g, '').toLowerCase(),
        image: (profile as { picture?: string })?.picture, // ✅ type-safely access picture
        isPremium: false,
      });
    }

    return true;
  } catch (error) {
    console.error('Sign-in error:', error);
    return false;
  }
},

    async session({ session }) {
      // can extend session.user if needed
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
