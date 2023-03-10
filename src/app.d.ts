// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  interface Error {
    message: string;
    error_id?: string;
  }
  interface Locals {
    prisma: typeof import('./hooks.server')._prisma;
    s3: typeof import('./hooks.server')._s3;
  }
  // interface PageData {}
  // interface Platform {}
}
