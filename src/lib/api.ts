import { RESTClient } from "@bruce/rest-client";
import type { RuleGroup, RuleSet } from "$lib/schema";

export interface RuleGroupInfo {
    id: number;
    group: string;
    content: string;
}

export class RuleSetClient extends RESTClient {
    constructor(fetchFn?: typeof fetch) {
        super("/api/rulesets/", undefined, fetchFn ?? fetch);
    }

    async getAllRuleSets(): Promise<RuleSet[]> {
        return await super.get("../rulesets");
    }

    async getRuleSet(id: number): Promise<RuleSet> {
        return await super.get(`${id}`);
    }

    async createRuleSet(name: string): Promise<RuleSet> {
        return await super.put("../rulesets", undefined, { name });
    }

    async renameRuleSet(id: number, name: string) {
        await super.patch(`${id}`, undefined, { name });
    }

    async reorderRuleSets(updates: ClashDashboard.ReorderInfo[]) {
        await super.patch("../rulesets", undefined, { updates });
    }

    async deleteRuleSet(id: number) {
        await super.delete(`${id}`);
    }

    async getRuleGroups(rulesetId: number): Promise<RuleGroupInfo[]> {
        const records: RuleGroup[] = await super.get(`${rulesetId}/groups`);

        // convert group record to proper representation
        return records.map((rec) => ({
            id: rec.id,
            group: rec.grp,
            content: rec.content,
        }));
    }

    async updateRuleGroupContent(
        rulesetId: number,
        group: string,
        content: string,
    ) {
        await super.patch(`${rulesetId}/${group}`, undefined, { content });
    }

    async generate() {
        await super.post("../rulesets");
    }
}

export class NodeClient extends RESTClient {
    constructor(fetchFn?: typeof fetch) {
        super("/api/nodes/", undefined, fetchFn ?? fetch);
    }

    async getAllGroups(): Promise<ClashDashboard.NodeGroup[]> {
        return await super.get("../nodes");
    }

    async updateNodeGroupContent(group: string, content: string) {
        await super.patch(group, undefined, { content });
    }
}
