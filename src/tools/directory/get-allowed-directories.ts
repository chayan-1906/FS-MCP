import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import { getAllowedRoots } from "../../utils/getAllowedRoots";

const getAllowedDirectories = async () => {
    const allowedRoots = await getAllowedRoots();
    return allowedRoots;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.getAllowedDirectories,
        "Returns the list of allowed directories and their permissions from the configuration",
        {},
        async () => {
            try {
                const result = await getAllowedDirectories();

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get allowed directories: ${error.message}`), tools.getAllowedDirectories);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to get allowed directories ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
