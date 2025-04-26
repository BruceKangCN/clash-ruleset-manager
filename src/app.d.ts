declare global {
    namespace App {
        /**
         * information object used to reorder rulesets.
         */
        interface ReorderInfo {
            id: number;
            newOrder: number;
        }

        /**
         * clash node group information
         */
        interface NodeGroup {
            type: string;
            content: string;
        }
    }
}

export {};
