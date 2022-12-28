import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';
import type { Handle, HandleServerError } from '@sveltejs/kit';

console.log({ env });

export const _prisma = new PrismaClient();

export const handle: Handle = async ({ event, resolve }) => {
  try {
    event.locals.prisma = _prisma;
    const response = await resolve(event);
    return response;
  } catch (err) {
    console.error('handle', err);
    throw err;
  }
};

export const handleError: HandleServerError = async ({ error, event }) => {
  console.error(error);
  return {
    message: `${error}`
  };
};
