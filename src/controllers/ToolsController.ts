import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../server";
import {printInConsole} from "mcp-utils/utils";


import {registerTool as listDirectory} from '../tools/directory/list-directory';
import {registerTool as createDirectory} from '../tools/directory/create-directory';
import {registerTool as deleteDirectory} from '../tools/directory/delete-directory';

import {registerTool as getFileInfo} from '../tools/file/get-file-info';
import {registerTool as readFile} from '../tools/file/read-file';
import {registerTool as writeFile} from '../tools/file/write-file';
import {registerTool as copyFile} from '../tools/file/copy-file';
import {registerTool as moveFile} from '../tools/file/move-file';
import {registerTool as deleteFile} from '../tools/file/delete-file';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    // directory
    listDirectory(server);
    createDirectory(server);
    deleteDirectory(server);

    // file
    getFileInfo(server);
    readFile(server);
    writeFile(server);
    copyFile(server);
    moveFile(server);
    deleteFile(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
