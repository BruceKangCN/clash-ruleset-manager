import { migrate } from "$lib/server/db_util";

export async function init() {
    await migrate();
}
