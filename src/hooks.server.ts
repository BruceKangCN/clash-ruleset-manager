import { readFile } from "node:fs/promises";
import { lstatSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { config } from "$lib/server/config";
import { db } from "$lib/server/db";
import { createRuleGroup, createRuleSetRecord } from "$lib/server/db_util";
import migration from "./migration.sql?raw";
import type { RuleSet } from "$lib/schema";

export async function init() {
    await migrate();
    createMissing();
}

/**
 * migrate database
 *
 * what it does:
 * 1. create ruleset and rule group tables.
 * 2. find all rule files.
 *     > a rule file is a file in `rules_dir` with filename matching specific
 *     > pattern.
 * 3. fill tables with content read from rule files.
 */
async function migrate() {
    db.exec(migration);

    // rule file name pattern
    const re = new RegExp(`^(\\d+)_(.*?)_(${config.groups.join("|")})\\.txt`);

    // find all files in rules directory, get their paths.
    //
    // file list will be filtered in database setup transaction.
    //
    // use sync API for simplicity.
    const paths = readdirSync(config.rules_dir)
        .map((entry) => join(config.rules_dir, entry))
        .filter((path) => lstatSync(path).isFile());

    // database setup transaction
    const tx = db.transaction(async () => {
        for (const path of paths) {
            const filename = basename(path);

            const match = filename.match(re);
            // if not match, continue
            if (!match) {
                continue;
            }
            const [_, order, name, group]: string[] = match;

            const ruleset = createRuleSetRecord(parseInt(order), name);

            const content = await readFile(path);
            createRuleGroup(ruleset.id, group, content.toString());
        }
    });

    await tx();
}

/**
 * create missing group records according to ruleset records
 *
 * find all existing rulesets, for each ruleset, check whether all its groups
 * records exists. if a record is missing, it will be created with `content`
 * field set to an empty string.
 *
 * it's unnecessary to create missing files, since they'll be created by "generate"
 * handler if records are created.
 */
function createMissing() {
    const tx = db.transaction((rulesets: RuleSet[]) => {
        for (const ruleset of rulesets) {
            for (const group of config.groups) {
                // select group record by ruleset id and group name
                const sql1 =
                    "select id from rules where ruleset_id = ? and grp = ?;";
                const stmt1 = db.prepare<[number, string], number>(sql1);

                // if exists, continue
                if (stmt1.get(ruleset.id, group) !== undefined) {
                    continue;
                }

                // not exist, create record
                const sql2 =
                    "insert into rules (ruleset_id, grp) values (?, ?);";
                const stmt2 = db.prepare<[number, string], void>(sql2);
                stmt2.run(ruleset.id, group);
            }
        }
    });

    const sql = "select * from rulesets;";
    const stmt = db.prepare<[], RuleSet>(sql);
    const rulesets = stmt.all();

    tx(rulesets);
}
