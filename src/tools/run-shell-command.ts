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
    server.tool(
        tools.runShellCommand,
        'Executes a shell command on the server. Use carefully, this does not touch the GitHub API, but runs commands in the local environment',
        {
            command: z.string().describe('The exact shell command to run'),
            cwd: z.string().describe('Working directory path'),
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
                sendError(transport, new Error(`Failed to run shell command: ${error}`), tools.runShellCommand);
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
