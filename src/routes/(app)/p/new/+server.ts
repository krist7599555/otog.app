import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { prisma }}) => {
  const out = await prisma.problem.create({
    data: {
      title: "untitle problem",
    }
  })
  throw redirect(302, `/p/${out.id}`)
};