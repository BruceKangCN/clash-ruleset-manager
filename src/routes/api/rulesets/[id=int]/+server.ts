import { json } from "@sveltejs/kit";
import { deleteRuleSet, getRuleSet, renameRuleSet } from "$lib/server/rules";

/**
 * get ruleset by id
 * @see RuleSet
 */
export async function GET({ params }) {
    const id = parseInt(params.id);
    const ruleset = await getRuleSet(id);

    return json(ruleset);
}

interface PatchData {
    name: string;
}

/**
 * rename a ruleset
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const { name }: PatchData = await request.json();

    await renameRuleSet(id, name);

    return json({});
}

/**
 * delete a rulesets and its coresponding rule groups, reorder rest rulesets.
 */
export async function DELETE({ params }) {
    const id = parseInt(params.id);
    deleteRuleSet(id);

    return json({});
}
