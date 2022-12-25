import { PrismaClient } from '@prisma/client';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const _prisma = new PrismaClient();

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
