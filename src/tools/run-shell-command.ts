import { z } from "zod";
import { promisify } from "util";
import { exec } from "child_process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../server";
import { tools } from "../utils/constants";
import resolvePath from "../utils/resolvePath";
import getCommandPermission from "../utils/getCommandPermission";

const execAsync = promisify(exec);

const runShellCommand = async (command: string, cwd: string) => {
    const permission = getCommandPermission(command);

    if (permission !== 'none') {
        const validatedPath = await resolvePath(cwd, permission);
        const {stdout, stderr} = await execAsync(command, {cwd: validatedPath});
        return {stdout, stderr};
    } else {
        // Commands that don't need filesystem access
        const {stdout, stderr} = await execAsync(command, {cwd});
        return {stdout, stderr};
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.runShellCommand;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            command: z.string().describe(toolConfig.parameters.find(p => p.name === 'command')?.techDescription || ''),
            cwd: z.string().describe(toolConfig.parameters.find(p => p.name === 'cwd')?.techDescription || ''),
        },
        async ({command, cwd}) => {
            try {
                const {stdout, stderr} = await runShellCommand(command, cwd);

                return {
                    content: [
                        {type: 'text' as const, text: stdout || '(no output)'},
                        ...(stderr ? [{type: 'text' as const, text: `(stderr) ${stderr}`}] : []),
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to run shell command: ${error}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to run shell command ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
