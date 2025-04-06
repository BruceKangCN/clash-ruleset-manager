export interface RuleSet {
    id: number;
    /** order */
    ord: number;
    name: string;
}

export interface RuleGroup {
    id: number;
    ruleset_id: number;
    /** group name */
    grp: string;
    content: string;
}
