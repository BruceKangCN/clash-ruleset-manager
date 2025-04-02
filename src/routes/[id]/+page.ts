import { invoke } from "@tauri-apps/api/core";
import type { RuleSet } from "../RuleSetItem.svelte";

export interface Group {
    type: string,
    content: string,
}

export interface RuleSetInfo {
    id: number,
    name: string,
    groups: Group[],
}

export async function load({ params }): Promise<RuleSetInfo> {
    const id = parseInt(params.id);
    const { name } = await invoke<RuleSet>("get_set", { id });

    const types = ["gs", "zz", "ym", "ip"];
    const groups: Group[] = await Promise.all(
        types.map(async (type) => {
            const content: string = await invoke("get_set_group", { id, group: type });
            return { type, content };
        })
    );

    return { id, name, groups };
}
