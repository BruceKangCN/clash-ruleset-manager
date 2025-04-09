import { Fetcher } from "$lib/fetcher";
import type { RuleGroup, RuleSet } from "$lib/schema";

export interface RuleGroupInfo {
    id: number;
    group: string;
    content: string;
}

export interface RuleSetInfo {
    id: number;
    name: string;
    groups: RuleGroupInfo[];
}

export async function load({ params, fetch }): Promise<RuleSetInfo> {
    const id = parseInt(params.id);
    const fetcher = Fetcher.wrap(fetch);

    // get ruleset name by id
    const rulesetURL = `/api/rulesets/${params.id}`;
    const { name }: RuleSet = await fetcher.get(rulesetURL);

    // get all groups of ruleset
    const ruleGroupsURL = `${rulesetURL}/groups`;
    const records: RuleGroup[] = await fetcher.get(ruleGroupsURL);

    // convert group record to proper representation
    const groups: RuleGroupInfo[] = records.map((rec) => ({
        id: rec.id,
        group: rec.grp,
        content: rec.content,
    }));

    return { id, name, groups };
}
