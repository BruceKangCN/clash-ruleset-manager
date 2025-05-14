import { beforeEach, describe, expect, it, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { error, json } from "@sveltejs/kit";
import { NodeClient, RuleSetClient } from "./api";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

describe("Nodes Client", () => {
    const mock = {
        groups: [
            { type: "sub", content: "foo:https://foo.example.com/sub.txt" },
            { type: "zz", content: "vless://dummy" },
        ],
        patchMessage: {
            msg: "success",
        },
    };

    beforeEach(() => {
        fetchMocker.resetMocks();
    });

    const node = new NodeClient(fetchMocker as unknown as typeof fetch);

    it("can get node groups", async () => {
        fetchMocker.mockIf("/api/nodes", async (req) => {
            if (req.method !== "GET") {
                error(405);
            }

            return json(mock.groups);
        });

        const groups = await node.getAllGroups();
        expect(groups).toStrictEqual(mock.groups);
    });

    it("can update group content", async () => {
        fetchMocker.mockIf("/api/nodes/sub", async (req) => {
            if (req.method !== "PATCH") {
                error(405);
            }

            return json(mock.patchMessage);
        });

        await node.updateNodeGroupContent("sub", "foo");
    });
});

describe("Rules Client", () => {
    const mock = {
        rulesets: [
            {
                id: 1,
                ord: 1,
                name: "dir",
            },
        ],
    };

    const rule = new RuleSetClient(fetchMocker as unknown as typeof fetch);

    it("can get all rulesets", async () => {
        fetchMocker.mockIf("/api/rulesets", async (req) => {
            if (req.method !== "GET") {
                error(405);
            }

            return json(mock.rulesets);
        });

        const actual = await rule.getAllRuleSets();
        expect(actual).toStrictEqual(mock.rulesets);
    });
});
