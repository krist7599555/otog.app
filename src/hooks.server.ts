/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { S3Client } from '@aws-sdk/client-s3';

console.log({ env });

export const _prisma = new PrismaClient();
export const _s3 = Object.assign(
  new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_ID!,
      secretAccessKey: env.R2_ACCESS_SECRET!
    }
  }),
  { bucket: env.R2_BUCKET! }
);

export const handle: Handle = async ({ event, resolve }) => {
  try {
    event.locals.prisma = _prisma;
    event.locals.s3 = _s3;
    const response = await resolve(event);
    response.headers.set('x-fly-machine-id', env.FLY_ALLOC_ID ?? 'null');
    response.headers.set('x-fly-region', env.FLY_REGION ?? 'null');
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
