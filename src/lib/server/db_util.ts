import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "$lib/server/config";
import type { RuleGroup, RuleSet } from "$lib/schema";
import { db } from "./db";
import migration from "./migration.sql?raw";

/**
 * migrate database
 *
 * what it does:
 *
 * 1. create ruleset and rule group tables.
 *
 * 2. find all rule files.
 *
 *    > a rule file is a file in `rules_dir` with filename matching specific
 *    > pattern.
 *
 * 3. fill tables with content read from rule files.
 *
 *    > if a rule group file owned by a ruleset is not available (it does not
 *    > exists or is not a regular file), the coresponding rule group record
 *    > will be created with `content` field set to an empty string.
 */
export async function migrate() {
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

                const isFile = await stat(path)
                    .then((s) => s.isFile())
                    .catch(() => false);
                if (!isFile) {
                    // if file not exists or path is not a regular file, create
                    // record with empty content.
                    //
                    // it's unnecessary to create missing files because they'll
                    // be created by "generate" handler if records are created.
                    createRuleGroup(id, group, "");
                }

                // get group content
                const content = await readFile(path, { encoding: "utf-8" });

                createRuleGroup(id, group, content);
            }
        }
    });

    // rule file name pattern
    const re = new RegExp(`^(\\d+)_(.*?)_(${config.groups.join("|")})\\.txt`);

    // find all rule files in rules directory. parse information from filenames.
    const entries = await readdir(config.rules_dir);
    const records = entries
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

/**
 * utility to query for a maybe non-exist ruleset record.
 * @see getRuleSetRecord
 */
function tryGetRuleSet(name: string): RuleSet | null {
    const sql = "select * from rulesets where name = ?;";
    const stmt = db.query<RuleSet, [string]>(sql);
    return stmt.get(name);
}

/**
 * get coresponding ruleset record, create if not exists.
 *
 * this is a utility funcition to ensure ruleset record exists before creating
 * rule group of the ruleset, or ruleset be the same across rule groups.
 *
 * @param order ruleset order
 * @param name ruleset name
 * @returns the already-existed or newly created ruleset record
 */
function getRuleSetRecord(order: number, name: string): RuleSet {
    const existedRecord = tryGetRuleSet(name);
    if (existedRecord) {
        return existedRecord;
    }

    const sql = "insert into rulesets (ord, name) values (?, ?) returning *;";
    const stmt = db.query<RuleSet, [number, string]>(sql);
    const row = stmt.get(order, name);

    if (!row) {
        throw Error("failed to get returning row after creating ruleset");
    }

    return row;
}

/**
 * create a group record.
 * @param rulesetId ruleset ID
 * @param group group name
 * @param content group content
 * @returns group record
 */
function createRuleGroup(rulesetId: number, group: string, content: string) {
    const sql =
        "insert into rules (ruleset_id, grp, content) values (?, ?, ?) returning *;";
    const stmt = db.query<RuleGroup, [number, string, string]>(sql);
    const row = stmt.get(rulesetId, group, content);

    if (!row) {
        throw Error("failed to get returning row after creating rule group");
    }

    return row;
}
