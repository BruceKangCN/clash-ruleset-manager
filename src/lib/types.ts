/**
 * information object used to reorder rulesets.
 */
export interface ReorderInfo {
    id: number;
    newOrder: number;
}

/**
 * clash node group information
 */
export interface NodeGroup {
    type: string;
    content: string;
}
