import type { RuleGroup, RuleSet } from "$lib/schema";
import { db } from "./db";

function tryGetRuleSet(name: string) {
    const stmt = db.prepare<[string], RuleSet>(
        "select * from rulesets where name = ?;",
    );
    return stmt.get(name);
}

export function createRuleSetRecord(order: number, name: string) {
    const existedRecord = tryGetRuleSet(name);
    if (existedRecord) {
        return existedRecord;
    }

    const sql = "insert into rulesets (ord, name) values (?, ?) returning *;";
    const stmt = db.prepare<[number, string], RuleSet>(sql);
    const row = stmt.get(order, name);

    if (!row) {
        throw Error("failed to get returning row after creating ruleset");
    }

    return row;
}

export function createRuleGroup(
    rulesetId: number,
    group: string,
    content: string,
) {
    const sql =
        "insert into rules (ruleset_id, grp, content) values (?, ?, ?) returning *;";
    const stmt = db.prepare<[number, string, string], RuleGroup>(sql);
    const row = stmt.get(rulesetId, group, content);

    if (!row) {
        throw Error("failed to get returning row after creating rule group");
    }

    return row;
}
