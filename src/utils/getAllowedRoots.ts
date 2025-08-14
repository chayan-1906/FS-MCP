import path from "path";
import fs from "fs/promises";
import os from "os";
import { getClaudeConfigDir, printInConsole } from "mcp-utils/utils";
import { transport } from "../server";
import { constants } from "./constants";

export const getAllowedRoots = async () => {
    const filePath = path.join(getClaudeConfigDir(), constants.fsConfigFile);

    try {
        const content = await fs.readFile(filePath, "utf8");
        const ALLOWED_ROOTS = JSON.parse(content);
        await printInConsole(transport, `ALLOWED_ROOTS: ${JSON.stringify(ALLOWED_ROOTS, null, 2)}`);
        return ALLOWED_ROOTS;
    } catch (error) {
        // If file doesn't exist, create it with default permissions
        const platform = os.platform();
        const homedir = os.homedir();

        let defaultPath;

        switch (platform) {
            case "darwin": // macOS
                defaultPath = path.join(homedir, "Library/Application Support/Claude");
                break;
            case "win32": // Windows
                defaultPath = path.join(homedir, "AppData/Roaming/Claude");
                break;
            case "linux":
                defaultPath = path.join(homedir, ".config/claude");
                break;
            default:
                defaultPath = path.join(homedir, ".claude");
        }

        const defaultRoots = [
            {
                path: defaultPath,
                operation: "write",
            },
        ];

        try {
            // Ensure the directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, {recursive: true});

            // Create the file with default permissions
            await fs.writeFile(filePath, JSON.stringify(defaultRoots, null, 2), "utf8");

            await printInConsole(
                transport,
                `Config file created with default ALLOWED_ROOTS: ${JSON.stringify(
                    defaultRoots,
                    null,
                    2
                )}`
            );
        } catch (writeError) {
            await printInConsole(
                transport,
                `Failed to create config file: ${writeError}. Using default ALLOWED_ROOTS: ${JSON.stringify(
                    defaultRoots,
                    null,
                    2
                )}`
            );
        }

        return defaultRoots;
    }
};
