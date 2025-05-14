declare interface RuleSet {
    id: number;
    /** order */
    ord: number;
    name: string;
}

declare interface RuleGroup {
    id: number;
    ruleset_id: number;
    /** group name */
    grp: string;
    content: string;
}

export { RuleSet, RuleGroup };
