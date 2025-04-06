import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { RuleSet } from "$lib/schema";
import type { ReorderInfo } from "$lib/types";
import { Fetcher } from "$lib/fetcher.js";

/**
 * get ruleset by id
 * @see RuleSet
 */
export async function GET({ params }) {
    const sql = "select * from rulesets where id = ?;";
    const stmt = db.prepare<[number], RuleSet>(sql);
    const ruleset = stmt.get(parseInt(params.id));

    if (!ruleset) {
        throw new Error("ruleset not exist");
    }

    return json(ruleset);
}

interface PatchData {
    name: string;
}

/**
 * rename a ruleset
 */
export async function PATCH({ params, request }) {
    const id = parseInt(params.id);
    const { name }: PatchData = await request.json();

    const sql = "update rulesets set name = ? where id = ?;";
    const stmt = db.prepare<[string, number], void>(sql);
    stmt.run(name, id);

    return json({});
}

/**
 * delete a rulesets and its coresponding rule groups, reorder rest rulesets.
 */
export async function DELETE({ params, fetch }) {
    const fetcher = Fetcher.wrap(fetch);

    const tx = db.transaction(async (id: number) => {
        // delete associated rules first, to fulfil foreign key constrain
        const sql1 = "delete from rules where ruleset_id = ?;";
        const stmt1 = db.prepare<[number], void>(sql1);
        stmt1.run(id);

        // delete ruleset, return order
        const sql2 = "delete from rulesets where id = ? returning ord;";
        const stmt2 = db.prepare<[number], { ord: number }>(sql2);
        const rec2 = stmt2.get(id);
        if (!rec2) {
            throw new Error("failed to delete ruleset record");
        }
        const { ord: deletedOrder } = rec2;

        // find rulesets to be reordered
        const sql3 = "select * from rulesets where ord > ?;";
        const stmt3 = db.prepare<[number], RuleSet>(sql3);
        const rulesets = stmt3.all(deletedOrder);

        // generate update information
        const updates: ReorderInfo[] = rulesets.map((r) => ({
            id: r.id,
            newOrder: r.ord - 1,
        }));

        // sort
        await fetcher.patch("/api/rulesets", { updates });
    });

    await tx(parseInt(params.id));

    return json({});
}
