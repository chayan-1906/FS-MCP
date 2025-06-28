import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { transport } from "../server";
import { printInConsole } from "../utils/printInConsole";

import {
    registerCreateDirectory,
    registerDeleteDirectory,
    registerListDirectory,
} from "../tools/fs/directory";
import {
    registerCopyFile,
    registerDeleteFile,
    registerGetFileInfo,
    registerMoveFile,
    registerReadFile,
    registerWriteFile,
} from "../tools/fs/files";

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    //Directory tools
    registerCreateDirectory(server);
    registerDeleteDirectory(server);
    registerListDirectory(server);

    //File tools
    registerCopyFile(server);
    registerDeleteFile(server);
    registerGetFileInfo(server);
    registerMoveFile(server);
    registerReadFile(server);
    registerWriteFile(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export { setupMcpTools };
