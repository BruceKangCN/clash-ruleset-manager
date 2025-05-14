# TODO

## Work in Progress

- [x] port flowbite-svelte to version 1

- [x] extract service handlers in API routes to `$lib/server/{API-group}.ts`

- [x] replace `better-sqlite3` with `bun:sqlite`

- [x] fix unsupported protocol 'bun:'

- [x] add documentation for code

- [x] replace fetcher with jsr:@bruce/rest-client

- [x] add apidoc

- [x] add documentation in index page

- [x] add tests

    currently excepts:

    - `$lib/api.ts`
    - `$lib/server/db_util.ts` because of `$lib/server/db.ts`
    - `$lib/server/rules.ts` because of `$lib/server/db.ts`

    > see [Need Support](<#Need Support>) section

## Planned

## Need Support

- [ ] replace TailwindCSS with UnoCSS

    > currently buggy for Svelte 5

    > Flowbite does not support UnoCSS currently

- [ ] add test for `$lib/api.ts`.

    > `vitest-fetch-mock` cannot handle relative URLs for now

- [ ] add test for `$lib/server/db_util.ts`

    > `db.ts` uses `bun:sqlite`, but bun seems to have issue running vitest
