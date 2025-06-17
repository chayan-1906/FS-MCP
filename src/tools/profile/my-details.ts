import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {PORT} from "../../config/config";

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.myDetails,
        'Fetches my system username',
        {},
        async ({}) => {
            try {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch my details: ${error}`), 'my-details');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch my details ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
