declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    namespace ClashDashboard {
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
