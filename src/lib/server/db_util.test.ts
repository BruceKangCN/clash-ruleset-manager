import { describe, it } from "vitest";
import { migrate } from "./db_util";

describe("migration", () => {
    // TODO: do I need to create migration file on mocked file system?
    it("success", async () => {
        await migrate();

        // TODO: check records exists
    });
})
