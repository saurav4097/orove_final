// app/api/profile/route.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  const token = cookies().get('token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403 });
  }
}
