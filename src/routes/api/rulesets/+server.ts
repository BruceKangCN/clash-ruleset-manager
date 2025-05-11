import { json } from "@sveltejs/kit";
import {
    createRuleSet,
    generate,
    getAllRuleSets,
    updateOrder,
} from "$lib/server/rules";

/**
 * @api {get} /api/rulesets get all rulesets
 * @apiName GetAllRuleSets
 * @apiGroup Rule
 * @apiDescription get all rulesets. return as a array of `RuleSet`.
 *
 * @apiSuccess (200) {RuleSet[]} ruleset[] rulesets
 */
export async function GET() {
    const rulesets = await getAllRuleSets();

    return json(rulesets);
}

interface PutData {
    name: string;
}

/**
 * @api {put} /api/rulesets create ruleset
 * @apiName CreateRuleSet
 * @apiGroup Rule
 * @apiDescription create ruleset named `name`, and its coresponding rule groups.
 * return the created ruleset.
 *
 * @apiBody {String} name ruleset's name
 */
export async function PUT({ request }) {
    const { name }: PutData = await request.json();
    const ruleset = await createRuleSet(name);

    return json(ruleset);
}

interface PatchData {
    updates: ClashDashboard.ReorderInfo[];
}

/**
 * @api {patch} /api/rulesets reorder rulesets
 * @apiName ReorderRulesets
 * @apiGroup Rule
 * @apiDescription reorder rulesets using the given reorder information. return
 * nothing.
 *
 * @apiBody {ClashDashboard.ReorderInfo[]} updates reorder information
 */
export async function PATCH({ request }) {
    const { updates }: PatchData = await request.json();
    updateOrder(updates);

    return json({});
}

/**
 * @api {post} /api/rulesets generate ruleset files
 * @apiName GenerateRuleSetFiles
 * @apiGroup Rule
 * @apiDescription generate ruleset files using information from database. both
 * file names and contents are generated using the information from database.
 * return nothing.
 */
export async function POST() {
    await generate();

    return json({});
}
