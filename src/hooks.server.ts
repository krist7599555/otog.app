import { PrismaClient } from '@prisma/client';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const _prisma = new PrismaClient();

_prisma.$queryRaw`SELECT 1 + 1`
  .then(ok => console.log('PING OK', ok))
  .then(err => console.error('PING ERR', err));

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.prisma = _prisma;
  const response = await resolve(event);
  return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
  console.error(error);
  return {
    message: `${error}`
  };
};
