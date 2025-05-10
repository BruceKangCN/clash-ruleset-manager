import { json } from "@sveltejs/kit";
import {
    createRuleSet,
    generate,
    getAllRuleSets,
    updateOrder,
} from "$lib/server/rules";

/**
 * get all rulesets
 * @see RuleSet
 */
export async function GET() {
    const rulesets = await getAllRuleSets();

    return json(rulesets);
}

interface PutData {
    name: string;
}

/**
 * create ruleset named `name`, and its coresponding rule groups.
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
 * update ruleset order
 * @see ReorderInfo
 */
export async function PATCH({ request }) {
    const { updates }: PatchData = await request.json();
    updateOrder(updates);

    return json({});
}

/**
 * generate ruleset files
 * @see RuleSet
 * @see RuleGroup
 */
export async function POST() {
    await generate();

    return json({});
}
