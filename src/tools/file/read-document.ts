import z from "zod";
import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const mammoth = require("mammoth");

const readDocument = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'read');
    const result = await mammoth.extractRawText({path: fullPath});

    return {
        fileName: path.basename(fullPath),
        text: result.value,
        messages: result.messages,
        wordCount: result.value.split(/\s+/).filter((word: string) => word.length > 0).length
    };
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.readDocument;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
        },
        async ({filePath}) => {
            try {
                const result = await readDocument(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to read document: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to read document ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
