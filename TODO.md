# TODO

## Main Goals

- [x] port flowbite-svelte to version 1
- [x] extract service handlers in API routes to `$lib/server/{API-group}.ts`
- [x] replace `better-sqlite3` with `bun:sqlite`
- [x] fix unsupported protocol 'bun:'
- [x] add documentation for code
- [x] replace fetcher with jsr:@bruce/rest-client
- [x] add apidoc
- [x] add documentation in index page
- [ ] add tests (except for `$lib/api.ts` and `$lib/server/db_util.ts`)

## Need Support

- [ ] replace TailwindCSS with UnoCSS

  > currently buggy for Svelte 5

  > Flowbite does not support UnoCSS currently

- [ ] add test for `$lib/api.ts`.

  > `vitest-fetch-mock` cannot handle relative URLs for now

- [ ] add test for `$lib/server/db_util.ts`

  > `db.ts` uses `bun:sqlite`, but bun seems to have issue running vitest
