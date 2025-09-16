import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const modifyFile = async (filePath: string, operation: "insert" | "replace" | "delete", lineNumber: number, content?: string, lineCount: number = 1, encoding: string = "utf8") => {
    const fullPath = await resolvePath(filePath, 'write');

    const fileContent = await fs.readFile(fullPath, encoding as BufferEncoding);
    const lines = fileContent.split('\n');

    const targetLine = lineNumber - 1;

    if (targetLine < 0 || targetLine > lines.length) {
        throw new Error(`Line number ${lineNumber} is out of range (1-${lines.length})`);
    }

    switch (operation) {
        case "insert":
            if (!content) throw new Error("Content required for insert operation");
            lines.splice(targetLine, 0, content);
            break;

        case "replace":
            if (!content) throw new Error("Content required for replace operation");
            lines.splice(targetLine, lineCount, content);
            break;

        case "delete":
            lines.splice(targetLine, lineCount);
            break;
    }

    const modifiedContent = lines.join('\n');
    await fs.writeFile(fullPath, modifiedContent, encoding as BufferEncoding);

    return `File modified successfully: ${filePath} ✅`;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.modifyFile;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
            operation: z.enum(["insert", "replace", "delete"]).describe(toolConfig.parameters.find(p => p.name === 'operation')?.techDescription || ''),
            lineNumber: z.number().describe(toolConfig.parameters.find(p => p.name === 'lineNumber')?.techDescription || ''),
            content: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'content')?.techDescription || ''),
            lineCount: z.number().optional().describe(toolConfig.parameters.find(p => p.name === 'lineCount')?.techDescription || ''),
            encoding: z.enum(["utf8", "ascii", "base64", "hex"]).optional().describe(toolConfig.parameters.find(p => p.name === 'encoding')?.techDescription || '')
        },
        async ({filePath, operation, lineNumber, content, lineCount, encoding}) => {
            try {
                const result = await modifyFile(filePath, operation, lineNumber, content, lineCount, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to modify file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to modify file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
