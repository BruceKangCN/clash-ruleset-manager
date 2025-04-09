import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { RuleGroup } from "$lib/schema";

/**
 * get rule group by ruleset id and group name
 * @see RuleGroup
 */
export async function GET({ params }) {
    const sql = "select * from rules where ruleset_id = ? and grp = ?;";
    const stmt = db.prepare<[number, string], RuleGroup>(sql);

    const id = parseInt(params.id);
    const group = params.group;
    const ruleGroup = stmt.get(id, group);

    if (!ruleGroup) {
        throw new Error("rule group not exist");
    }

    return json(ruleGroup);
}

interface PatchData {
    content: string;
}

/**
 * update rule group content
 * @see RuleGroup
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const group = params.group;
    const { content }: PatchData = await request.json();

    const sql =
        "update rules set content = ? where ruleset_id = ? and grp = ?;";
    const stmt = db.prepare<[string, number, string], void>(sql);
    stmt.run(content, id, group);

    return json({});
}
