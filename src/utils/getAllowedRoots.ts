import path from "path";
import fs from "fs/promises";
import { getClaudeConfigDir, printInConsole } from "mcp-utils/utils";
import { transport } from "../server";
import { constants } from "./constants";

export const getAllowedRoots = async () => {
    const filePath = path.join(getClaudeConfigDir(), constants.fsConfigFile);

    try {
        const content = await fs.readFile(filePath, "utf8");
        const ALLOWED_ROOTS = JSON.parse(content);
        await printInConsole(transport, "ALLOWED_ROOTS loaded from config file ✅");
        // await printInConsole(transport, `ALLOWED_ROOTS: ${JSON.stringify(ALLOWED_ROOTS, null, 2)}`);
        return ALLOWED_ROOTS;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await printInConsole(transport, `Config file not found, creating with default permissions`);

            const defaultPath = getClaudeConfigDir();

            /*const platform = os.platform();
            const homedir = os.homedir();

            switch (platform) {
                case "darwin":
                    defaultPath = path.join(homedir, "Library/Application Support/Claude");
                    break;
                case "win32":
                    defaultPath = path.join(homedir, "AppData/Roaming/Claude");
                    break;
                case "linux":
                    defaultPath = path.join(homedir, ".config/claude");
                    break;
                default:
                    defaultPath = path.join(homedir, ".claude");
            }*/

            const defaultRoots: object[] = [];
            /*const defaultRoots = [
                {
                    path: defaultPath,
                    operation: "write",
                },
            ];*/

            try {
                const dir = path.dirname(filePath);
                await fs.mkdir(dir, {recursive: true});

                await fs.writeFile(filePath, JSON.stringify(defaultRoots, null, 2), "utf8");

                await printInConsole(transport, `Config file created with default ALLOWED_ROOTS: ${JSON.stringify(defaultRoots, null, 2)}`);
            } catch (writeError) {
                await printInConsole(transport, `Failed to create config file: ${writeError}. Using default ALLOWED_ROOTS: ${JSON.stringify(defaultRoots, null, 2)}`);
            }

            return defaultRoots;
        }

        await printInConsole(transport, `❌ Config file error (${error.code || 'UNKNOWN'}): ${error.message}. Please check the file: ${filePath}`);

        if (error instanceof SyntaxError) {
            await printInConsole(transport, `💡 The config file appears to be corrupted or contains invalid JSON. Please check the file format.`);
        } else if (error.code === 'EACCES' || error.code === 'EPERM') {
            await printInConsole(transport, `💡 Permission denied accessing config file. Please check file permissions.`);
        } else if (error.code === 'EBUSY' || error.code === 'ETXTBSY') {
            await printInConsole(transport, `💡 Config file is being used by another process. Please try again.`);
        }

        throw error;
    }
}
