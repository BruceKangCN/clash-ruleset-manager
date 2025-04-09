import { readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { json } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";
import { db } from "$lib/server/db";
import type { RuleGroup, RuleSet } from "$lib/schema";
import type { ReorderInfo } from "$lib/types";
import { Fetcher } from "$lib/fetcher";

/**
 * get rulesets
 * @see RuleSet
 */
export async function GET() {
    const sql = "select * from rulesets order by ord asc;";
    const stmt = db.prepare<[], RuleSet>(sql);
    const rulesets = stmt.all();

    return json(rulesets);
}

interface PutData {
    name: string;
}

/**
 * create ruleset named `name`, and its coresponding rule groups.
 */
export async function PUT({ request }) {
    const config = await getConfig();

    const tx = db.transaction((order: number, name: string) => {
        // create ruleset, return id
        const sql =
            "insert into rulesets (ord, name) values (?, ?) returning *;";
        const stmt = db.prepare<[number, string], RuleSet>(sql);
        const ruleset = stmt.get(order, name);
        if (!ruleset) {
            throw new Error("failed to create ruleset");
        }

        // create empty coresponding groups
        for (const group of config.groups) {
            const sql = "insert into rules (ruleset_id, grp) values (?, ?);";
            const stmt = db.prepare<[number, string], void>(sql);
            stmt.run(ruleset.id, group);
        }

        // return created ruleset
        return ruleset;
    });

    const { name }: PutData = await request.json();

    // get ruleset count, to generate proper order
    const sql = "select count(*) from rulesets;";
    const stmt = db.prepare<[], number>(sql).pluck();
    const count = stmt.get();
    if (!count) {
        throw new Error("failed to get ruleset count");
    }

    const ruleset = tx(count + 1, name);

    return json(ruleset);
}

interface PatchData {
    updates: ReorderInfo[];
}

/**
 * update rulesets orders
 * @see ReorderInfo
 */
export async function PATCH({ request }) {
    const tx = db.transaction((updates: ReorderInfo[]) => {
        const sql = "update rulesets set ord = ? where id = ?;";
        const stmt = db.prepare<[number, number], void>(sql);
        for (const info of updates) {
            stmt.run(info.newOrder, info.id);
        }
    });

    const { updates }: PatchData = await request.json();
    tx(updates);

    return json({});
}

/**
 * generate ruleset files using ruleset and rule group information stored in database
 * @see RuleSet
 * @see RuleGroup
 */
export async function POST({ fetch }) {
    const config = await getConfig();
    const fetcher = Fetcher.wrap(fetch);

    // clear dir
    const entries = await readdir(config.rules_dir);
    for (const entry of entries) {
        const path = join(config.rules_dir, entry);
        await rm(path, { recursive: true });
    }

    // get ruleset info
    const rulesets: RuleSet[] = await fetcher.get("/api/rulesets");

    // generate files
    for (const ruleset of rulesets) {
        // generate files per group
        for (const group of config.groups) {
            // get file path
            const filename = `${ruleset.ord}_${ruleset.name}_${group}.txt`;
            const path = join(config.rules_dir, filename);

            // get file content
            const url = `/api/rulesets/${ruleset.id}/${group}`;
            const { content }: RuleGroup = await fetcher.get(url);

            // write to file
            await writeFile(path, content);
        }
    }

    return json({});
}
