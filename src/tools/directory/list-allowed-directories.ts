import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { PORT } from "../../config/config";
import { tools } from "../../utils/constants";
import { getAllowedRoots } from "../../utils/getAllowedRoots";

const listAllowedDirectories = async () => {
    const allowedRoots = await getAllowedRoots();
    return {
        allowed_directories: allowedRoots,
        permissions_manager: `Configure at: http://localhost:${PORT}`,
    };
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.listAllowedDirectories,
        "Returns the list of allowed directories and their permissions from the configuration",
        {},
        async () => {
            try {
                const result = await listAllowedDirectories();

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to list allowed directories: ${error.message}`), tools.listAllowedDirectories);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to list allowed directories ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
