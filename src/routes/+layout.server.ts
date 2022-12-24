import type { LayoutServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies LayoutServerLoad;

export const prerender = false;
export const ssr = true;
export const csr = true;