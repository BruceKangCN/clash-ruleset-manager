import { json } from "@sveltejs/kit";
import { deleteRuleSet, getRuleSet, renameRuleSet } from "$lib/server/rules";

/**
 * @api {get} /api/rulesets/:id get ruleset by ID
 * @apiName GetRuleSetByID
 * @apiGroup Rule
 * @apiDescription get ruleset by ID. return the ruleset.
 *
 * @apiParam {Number} id ID of the ruleset
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
 * @api {patch} /api/rulesets/:id rename ruleset by ID
 * @apiName RenameRuleSetByID
 * @apiGroup Rule
 * @apiDescription rename ruleset whose ID equals `id`. return the nothing.
 *
 * @apiParam {Number} id ID of the ruleset
 *
 * @apiBody {String} name new name
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const { name }: PatchData = await request.json();

    await renameRuleSet(id, name);

    return json({});
}

/**
 * @api {delete} /api/rulesets/:id delete ruleset by ID
 * @apiName DeleteRuleSetByID
 * @apiGroup Rule
 * @apiDescription delete ruleset whose ID equals `id`, and its relative rule
 * groups. return the nothing.
 *
 * @apiParam {Number} id ID of the ruleset
 */
export async function DELETE({ params }) {
    const id = parseInt(params.id);
    deleteRuleSet(id);

    return json({});
}
