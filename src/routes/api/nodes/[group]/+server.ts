import { json } from "@sveltejs/kit";
import { updateGroupContent } from "$lib/server/nodes";

interface PatchData {
    content: string;
}

/**
 * update node group content
 * @see PatchData
 */
export async function PATCH({ params, request }) {
    const group = params.group;
    const { content }: PatchData = await request.json();

    updateGroupContent(group, content);

    return json({ msg: "success" });
}
