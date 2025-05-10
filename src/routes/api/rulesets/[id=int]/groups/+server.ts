import { json } from "@sveltejs/kit";
import { getAllRuleGroups } from "$lib/server/rules";

/**
 * get all rule groups owned by a ruleset, whose id equals `id`
 * @see RuleGroup
 */
export async function GET({ params }) {
    const id = parseInt(params.id);
    const ruleGroups = await getAllRuleGroups(id);

    return json(ruleGroups);
}
