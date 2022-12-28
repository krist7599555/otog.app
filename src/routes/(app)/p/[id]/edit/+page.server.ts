import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
  ListObjectsV2Command,
  PutObjectAclCommand,
  PutObjectCommand,
  ObjectCannedACL
} from '@aws-sdk/client-s3';
export const load = (async ({ params, locals: { prisma, s3 } }) => {
  const storage = s3
    .send(
      new ListObjectsV2Command({
        Bucket: s3.bucket,
        Prefix: `problems/${params.id}`
      })
    )
    .then(ls =>
      ls.Contents?.map(i => ({
        filename: i.Key?.split('/').at(-1),
        size: i.Size,
        last_modified: i.LastModified,
        path: i.Key
      }))
    );
  return {
    problem: await prisma.problem.findUniqueOrThrow({
      where: {
        id: +params.id
      }
    }),
    files: await storage
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  async update_problem({ request, locals: { prisma, s3 }, params }) {
    console.log('update_problem');
    const form = await request.formData();
    const files: File[] = form.getAll('files').map(f => {
      if (typeof f === 'string') throw error(400, 'field .files expect File but got string');
      console.log('filename', f.name);
      return f;
    });

    const _ = await Promise.all(
      files.map(async f => {
        return await s3.send(
          new PutObjectCommand({
            Bucket: s3.bucket,
            Key: `problems/${params.id}/${f.name}`,
            // TODO: change to private
            ACL: ObjectCannedACL.public_read,
            Body: Buffer.from(await f.arrayBuffer()),
            ContentType: f.type,
            Tagging: `SERVER=OTOG&PROBLEM_ID=${params.id}`
          })
        );
      })
    );

    console.log({ files });
    form.delete('files');
    const { id = null, ...formo }: any = Object.fromEntries(form.entries());

    console.log(formo);
    if (!id) return fail(400, { success: false, error_message: 'id is not provide' });
    if (!Number.isSafeInteger(+id))
      return fail(400, { success: false, error_message: 'id is not safe integer' });
    if (params.id !== id) return fail(400, { success: false, error_message: 'id is not provide' });
    if (Math.random() < 0.5) {
      return fail(500, { success: false, error_message: 'random error fail' });
    } else {
      try {
        await prisma.problem.update({
          where: {
            id: parseInt(id)
          },
          data: formo
        });
      } catch (err) {
        return fail(500, { success: false, error_message: `${err}` });
      }

      return {
        success: true,
        message: 'updated'
      };
    }
  }
};
