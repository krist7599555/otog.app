import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { prisma }}) => {
  return {
    problems: await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        created_at: true
      },
      orderBy: {
      
      created_at: "desc"
    }})
  };
}) satisfies PageServerLoad;
