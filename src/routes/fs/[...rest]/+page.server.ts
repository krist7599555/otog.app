import { env } from '$env/dynamic/private';
import * as path from 'path';
import * as fs from 'fs/promises';
import { error } from '@sveltejs/kit';

const mount_volume = path.resolve(env.MOUNT_VOLUME);
const url2path = (url: string) => path.resolve(url.replace('/fs', mount_volume));
const path2url = (path: string) => '/fs' + path.replace(mount_volume, '');
const file_type = async (path: string) => {
  const stats = await fs.lstat(path);
  if (stats.isFile()) return 'file';
  if (stats.isDirectory()) return 'directory';
  return null;
};
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
  if (url.pathname.includes('..'))
    throw error(400, { message: 'not allow parent dir path (./..)' });
  const req_path = url2path(url.pathname);

  switch (await file_type(req_path)) {
    case 'file': {
      return {
        type: 'file',
        path: path2url(req_path),
        data: await fs.readFile(req_path)
      } as const;
    }
    case 'directory': {
      const files = await fs.readdir(req_path);
      return {
        type: 'directory',
        path: path2url(req_path),
        data: await Promise.all(
          files.map(async filename => ({
            name: filename,
            link: path2url(path.resolve(req_path, filename)),
            type: await file_type(path.resolve(req_path, filename))
          }))
        )
      } as const;
    }
    default: {
      throw error(404, {
        message: `path ${req_path} not match any file/directory`
      });
    }
  }
}) satisfies PageServerLoad;
