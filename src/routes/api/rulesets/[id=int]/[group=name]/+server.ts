import { json } from "@sveltejs/kit";
import { getRuleGroup, updateRuleGroupContent } from "$lib/server/rules";

/**
 * get rule group by ruleset id and group name
 * @see RuleGroup
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
 * update rule group content
 * @see RuleGroup
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const group = params.group;
    const { content }: PatchData = await request.json();

    updateRuleGroupContent(id, group, content);

    return json({});
}
