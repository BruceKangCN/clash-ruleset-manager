import { json } from "@sveltejs/kit";
import type { RuleGroup } from "$lib/schema";
import { db } from "$lib/server/db";

/**
 * get all rule groups owned by a ruleset, whose id equals `id`
 * @see RuleGroup
 */
export async function GET({ params }) {
    const sql = "select * from rules where ruleset_id = ?;";
    const stmt = db.prepare<[number], RuleGroup>(sql);
    const ruleGroups = stmt.all(parseInt(params.id));

    return json(ruleGroups);
}
