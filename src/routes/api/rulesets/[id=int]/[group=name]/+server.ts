import { json } from "@sveltejs/kit";
import { getRuleGroup, updateRuleGroupContent } from "$lib/server/rules";

/**
 * @api {get} /api/rulesets/:id/:group get a rule group
 * @apiName GetRuleGroup
 * @apiGroup Rule
 * @apiDescription get rule group by ruleset id and group name. return the rule
 * group.
 *
 * @apiParam {Number} id ruleset ID
 * @apiParam {String} group group name
 */
export async function GET({ params }) {
    const id = parseInt(params.id);
    const group = params.group;

    const ruleGroup = getRuleGroup(id, group);

    return json(ruleGroup);
}

interface PatchData {
    content: string;
}

/**
 * @api {patch} /api/rulesets/:id/:group update rule group content
 * @apiName UpdateRuleGroupContent
 * @apiGroup Rule
 * @apiDescription overwrite content of the rule group owned by ruleset of ID
 * `id` whose name is `name` using content `content`. return nothing.
 *
 * @apiParam {Number} id ruleset ID
 * @apiParam {String} group group name
 *
 * @apiBody {String} content content used to overwrite the rule group
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const group = params.group;
    const { content }: PatchData = await request.json();

    updateRuleGroupContent(id, group, content);

    return json({});
}
