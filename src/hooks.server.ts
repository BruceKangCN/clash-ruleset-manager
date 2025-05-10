import { readFile } from "node:fs/promises";
import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getConfig } from "$lib/server/config";
import { db } from "$lib/server/db";
import { createRuleGroup, getRuleSetRecord } from "$lib/server/db_util";
import migration from "./migration.sql?raw";

export async function init() {
    await migrate();
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
 *     > if a rule group file owned by a ruleset is not available (it does not
 *     > exists or is not a regular file), the coresponding rule group record
 *     > will be created with `content` field set to an empty string.
 */
async function migrate() {
    db.exec(migration);

    const config = await getConfig();

    // database setup transaction
    const tx = db.transaction(async (rulesets: Record<string, number>) => {
        for (const name in rulesets) {
            const order = rulesets[name];

            // create ruleset
            const { id } = getRuleSetRecord(order, name);

            // create rule groups with ruleset id
            for (const group of config.groups) {
                const filename = `${order}_${name}_${group}.txt`;
                const path = join(config.rules_dir, filename);

                const isFile = existsSync(path) && lstatSync(path).isFile();
                if (!isFile) {
                    // if file not exists or path is not a regular file, create
                    // record with empty content.
                    //
                    // it's unnecessary to create missing files because they'll
                    // be created by "generate" handler if records are created.
                    createRuleGroup(id, group, "");
                }

                // get group content
                const buffer = await readFile(path);
                const content = buffer.toString();

                createRuleGroup(id, group, content);
            }
        }
    });

    // rule file name pattern
    const re = new RegExp(`^(\\d+)_(.*?)_(${config.groups.join("|")})\\.txt`);

    // find all rule files in rules directory. parse information from filenames.
    //
    // use sync API for simplicity.
    const records = readdirSync(config.rules_dir)
        .map((filename) => filename.match(re))
        .filter((match) => match !== null)
        .map((match) => {
            const [_, orderStr, name] = match;
            const order = parseInt(orderStr);
            return { order, name };
        });

    // get unique rulesets and their order
    //
    // Caveat: if a ruleset has multiple records with different orders, the last
    // order is used. there is no grantee that every ruleset has a unique order.
    const rulesets: Record<string, number> = {};
    for (const record of records) {
        rulesets[record.name] = record.order;
    }

    await tx(rulesets);
}
