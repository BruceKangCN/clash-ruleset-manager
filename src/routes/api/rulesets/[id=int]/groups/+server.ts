import { json } from "@sveltejs/kit";
import { getAllRuleGroups } from "$lib/server/rules";

/**
 * @api {get} /api/rulesets/:id/groups get all rule groups of a ruleset
 * @apiName GetAllRuleGroups
 * @apiGroup Rule
 * @apiDescription get all rule groups owned by a ruleset, whose id equals `id`.
 * return the groups as a JSON array.
 *
 * @apiParam {Number} id ID of the ruleset
 */
export async function GET({ params }) {
    const id = parseInt(params.id);
    const ruleGroups = await getAllRuleGroups(id);

    return json(ruleGroups);
}
