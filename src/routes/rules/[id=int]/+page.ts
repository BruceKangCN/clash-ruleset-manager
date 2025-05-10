import { RuleSetClient } from "$lib/api";

export async function load({ params, fetch }) {
    const id = parseInt(params.id);
    const ruleset = new RuleSetClient(fetch);

    const { name } = await ruleset.getRuleSet(id);
    const groups = await ruleset.getRuleGroups(id);

    return { id, name, groups };
}
