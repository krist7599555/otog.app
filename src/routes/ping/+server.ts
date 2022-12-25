import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { prisma } }) => {
  return json({
    message: await prisma.$queryRaw`SELECT 1 + 1`.then(ok => {
      console.log('PING OK', ok);
      return 'pong';
    })
  });
};
