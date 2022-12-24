import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, locals: { prisma } }) => {
  return prisma.problem.findUniqueOrThrow({
    where: {
      id: +params.id
    }
  })
}) satisfies PageServerLoad;


export const actions: Actions = {
  async update_problem({ request, locals: { prisma }, params }) {
    console.log("update_problem")
    const form = await request.formData();
    const { id = null, ...formo}: any = Object.fromEntries(form.entries())
    console.log(formo)
    if (!id) return fail(400, { success: false, error_message: "id is not provide" })
    if (!Number.isSafeInteger(+id)) return fail(400, { success: false, error_message: "id is not safe integer" })
    if (params.id !== id) return fail(400, { success: false, error_message: "id is not provide" })
    if (Math.random() < 0.5) {
      return fail(500, { success: false, error_message: "random error fail" })
    } else {
      try {

        await prisma.problem.update({
          where: {
            id: parseInt(id)
          },
          data: formo,
        })
      } catch(err) {
        return fail(500, { success: false, error_message: `${err}` })
      }
      
      return {
        success: true,
        message: "updated"
      }
    }
  }
};