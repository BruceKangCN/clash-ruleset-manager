import { error, json } from "@sveltejs/kit";
import { checkGroupExists, updateGroupContent } from "$lib/server/nodes";

interface PatchData {
    content: string;
}

/**
 * @api {patch} /api/nodes/:group update node group content
 * @apiName UpdateNodeGroupContent
 * @apiGroup Node
 * @apiDescription overwrite node group named `group` with content `content`.
 *
 * @apiParam {String} group name of the group to be updated
 *
 * @apiBody {String} content content to be written to the group
 *
 * @apiSuccess (200) {String} msg response message
 *
 * @apiError (403) Forbiden no write permission to the group (maybe group does
 * not exist)
 *
 * @apiError (500) InternalError
 */
export async function PATCH({ params, request }) {
    const group = params.group;
    const exist = await checkGroupExists(group);
    if (!exist) {
        error(403, { message: "group not exists" });
    }

    const { content }: PatchData = await request.json();
    updateGroupContent(group, content);

    return json({ msg: "success" });
}
