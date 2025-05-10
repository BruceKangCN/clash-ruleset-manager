import type { RuleGroup, RuleSet } from "$lib/schema";
import { db } from "./db";

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
export function getRuleSetRecord(order: number, name: string): RuleSet {
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
export function createRuleGroup(
    rulesetId: number,
    group: string,
    content: string,
) {
    const sql =
        "insert into rules (ruleset_id, grp, content) values (?, ?, ?) returning *;";
    const stmt = db.query<RuleGroup, [number, string, string]>(sql);
    const row = stmt.get(rulesetId, group, content);

    if (!row) {
        throw Error("failed to get returning row after creating rule group");
    }

    return row;
}
