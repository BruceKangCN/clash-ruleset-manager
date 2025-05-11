import { readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "$lib/server/config";
import { db } from "$lib/server/db";
import type { RuleGroup, RuleSet } from "$lib/schema";

/**
 * get all rulesets
 * @see RuleSet
 */
export async function getAllRuleSets(): Promise<RuleSet[]> {
    const sql = "select * from rulesets order by ord asc;";
    const stmt = db.query<RuleSet, []>(sql);
    const rulesets = stmt.all();

    return rulesets;
}

/**
 * get ruleset by id
 * @returns ruleset
 * @see RuleSet
 */
export async function getRuleSet(id: number) {
    const sql = "select * from rulesets where id = ?;";
    const stmt = db.query<RuleSet, [number]>(sql);
    const ruleset = stmt.get(id);

    if (!ruleset) {
        throw new Error("ruleset not exist");
    }

    return ruleset;
}

/**
 * create ruleset named `name`, and its coresponding rule groups. returns the
 * created ruleset.
 */
export async function createRuleSet(name: string) {
    const config = await getConfig();

    // transaction to create rule groups for a ruleset
    const tx = db.transaction((ruleset: RuleSet) => {
        // create empty coresponding groups
        for (const group of config.groups) {
            const sql = "insert into rules (ruleset_id, grp) values (?, ?);";
            const stmt = db.query<void, [number, string]>(sql);
            stmt.run(ruleset.id, group);
        }

        // return created ruleset
        return ruleset;
    });

    // get ruleset count, to generate proper order
    const sql1 = "select count(*) as count from rulesets;";
    const stmt1 = db.query<{ count: number }, []>(sql1);
    const result = stmt1.get();
    if (!result) {
        throw new Error("failed to get ruleset count");
    }
    const { count } = result;

    // create ruleset, return id
    const sql2 = "insert into rulesets (ord, name) values (?, ?) returning *;";
    const stmt2 = db.query<RuleSet, [number, string]>(sql2);
    const ruleset = stmt2.get(count + 1, name);
    if (!ruleset) {
        throw new Error("failed to create ruleset");
    }

    // create rule groups for the ruleset
    tx(ruleset);

    return ruleset;
}

/**
 * rename a ruleset
 */
export async function renameRuleSet(id: number, name: string) {
    const sql = "update rulesets set name = ? where id = ?;";
    const stmt = db.query<void, [string, number]>(sql);
    stmt.run(name, id);
}

/**
 * update ruleset order
 * @see ReorderInfo
 */
export function updateOrder(updates: ClashDashboard.ReorderInfo[]) {
    const tx = db.transaction((updates: ClashDashboard.ReorderInfo[]) => {
        const sql = "update rulesets set ord = ? where id = ?;";
        const stmt = db.query<void, [number, number]>(sql);
        for (const info of updates) {
            stmt.run(info.newOrder, info.id);
        }
    });

    tx(updates);
}

/**
 * delete a rulesets and its coresponding rule groups, reorder rest rulesets.
 */
export function deleteRuleSet(id: number) {
    const tx = db.transaction((id: number) => {
        // delete associated rules first, to fulfil foreign key constrain
        const sql1 = "delete from rules where ruleset_id = ?;";
        const stmt1 = db.query<void, [number]>(sql1);
        stmt1.run(id);

        // delete ruleset, return order
        const sql2 = "delete from rulesets where id = ? returning ord;";
        const stmt2 = db.query<{ ord: number }, [number]>(sql2);
        const rec2 = stmt2.get(id);
        if (!rec2) {
            throw new Error("failed to delete ruleset record");
        }
        const { ord: deletedOrder } = rec2;

        // find rulesets to be reordered
        const sql3 = "select * from rulesets where ord > ?;";
        const stmt3 = db.query<RuleSet, [number]>(sql3);
        const rulesets = stmt3.all(deletedOrder);

        // generate update information
        const updates: ClashDashboard.ReorderInfo[] = rulesets.map((r) => ({
            id: r.id,
            newOrder: r.ord - 1,
        }));

        // sort
        updateOrder(updates);
    });

    tx(id);
}

/**
 * get all rule groups owned by a ruleset, whose id equals `id`
 * @see RuleGroup
 */
export async function getAllRuleGroups(id: number) {
    const sql = "select * from rules where ruleset_id = ?;";
    const stmt = db.query<RuleGroup, [number]>(sql);
    const ruleGroups = stmt.all(id);

    return ruleGroups;
}

/**
 * get rule group by ruleset id and group name
 * @see RuleGroup
 */
export function getRuleGroup(id: number, group: string): RuleGroup {
    const sql = "select * from rules where ruleset_id = ? and grp = ?;";
    const stmt = db.query<RuleGroup, [number, string]>(sql);

    const ruleGroup = stmt.get(id, group);

    if (!ruleGroup) {
        throw new Error("rule group not exist");
    }

    return ruleGroup;
}

/**
 * update rule group content
 * @see RuleGroup
 */
export function updateRuleGroupContent(
    id: number,
    group: string,
    content: string,
): void {
    const sql =
        "update rules set content = ? where ruleset_id = ? and grp = ?;";
    const stmt = db.query<void, [string, number, string]>(sql);
    stmt.run(content, id, group);
}

/**
 * generate ruleset files using ruleset and rule group information stored in database
 * @see RuleSet
 * @see RuleGroup
 */
export async function generate() {
    const config = await getConfig();

    // clear dir
    const entries = await readdir(config.rules_dir);
    for (const entry of entries) {
        const path = join(config.rules_dir, entry);
        await rm(path, { recursive: true });
    }

    // get ruleset info
    const rulesets = await getAllRuleSets();

    // generate files
    for (const ruleset of rulesets) {
        // generate files per group
        for (const group of config.groups) {
            // get file path
            const filename = `${ruleset.ord}_${ruleset.name}_${group}.txt`;
            const path = join(config.rules_dir, filename);

            const { content } = getRuleGroup(ruleset.id, group);

            // write to file
            await writeFile(path, content);
        }
    }
}
