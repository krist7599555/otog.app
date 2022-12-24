import type { RequestHandler } from './$types';

export const PORT: RequestHandler = async ({ request }) => {
    return new Response();
};