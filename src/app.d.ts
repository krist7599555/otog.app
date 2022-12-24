// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	interface Locals {
		prisma: import("@prisma/client").PrismaClient
	}
	// interface PageData {}
	// interface Platform {}
}
