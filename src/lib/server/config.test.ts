import { describe, expect, it } from "vitest";
import { getConfig } from "./config";

describe("config", () => {
    it("loads correctly", async () => {
        const config = await getConfig();
        expect(config).toStrictEqual({
            nodes_dir: "data/nodes",
            rules_dir: "data/rules",
            groups: ["ym", "ip"],
        });
    });
});
