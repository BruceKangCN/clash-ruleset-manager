import { describe, expect, it } from "vitest";
import { checkGroupExists, getNodes, updateGroupContent } from "./nodes";

describe("Node groups", () => {
    it("exists", async () => {
        await expect(checkGroupExists("sub")).resolves.toBe(true);
        await expect(checkGroupExists("zz")).resolves.toBe(true);
        await expect(checkGroupExists("foo")).resolves.toBe(false);
    });

    it("can be gotten", async () => {
        const actual = await getNodes();

        expect(actual.length).toBe(2);

        expect(actual.some((item) => item.type === "sub")).toBe(true);
        expect(actual.some((item) => item.type === "zz")).toBe(true);

        expect(actual.some((item) => item.type === "foo")).toBe(false);
    });

    it("can be updated", async () => {
        const group = "zz";
        const content = "foo";

        await updateGroupContent(group, content);

        const groups = await getNodes();
        const zz = groups.find((item) => item.type === group);

        expect(zz).toBeDefined();
        expect(zz!.content).toBe(content);
    });
});
