import os from "os";
import path from "path";
import fs from "fs/promises";
import { Request, Response } from "express";
import { modifyFile } from "../tools/file/modify-file";

/*
* {
  "success": true,
  "username": "PADMANABHA",
  "homedir": "C:\\Users\\USER",
  "platform": "win32",
  "commonPaths": [
    {
      "path": "C:\\Users\\USER\\Desktop",
      "label": "Desktop"
    },
    {
      "path": "C:\\Users\\USER\\Documents",
      "label": "Documents"
    },
    {
      "path": "C:\\Users\\USER\\Downloads",
      "label": "Downloads"
    },
    {
      "path": "C:\\",
      "label": "C: Drive"
    },
    {
      "path": "C:\\Program Files",
      "label": "Program Files"
    },
    {
      "path": "C:\\Users",
      "label": "Users"
    }
  ],
  "pathSeparator": "\\"
}
* */
const getSystemInfoController = (req: Request, res: Response) => {
    try {
        const username = os.userInfo().username;
        const homedir = os.homedir();
        const platform = os.platform();

        let commonPaths = [];

        switch (platform) {
            case "darwin": // macOS
                commonPaths = [
                    {path: path.join(homedir, "Desktop"), label: "Desktop"},
                    {path: path.join(homedir, "Documents"), label: "Documents"},
                    {path: path.join(homedir, "Downloads"), label: "Downloads"},
                    {path: path.join(homedir, "Applications"), label: "User Applications"},
                    {path: "/Applications", label: "System Applications"},
                    {path: "/Users", label: "Users"},
                ];
                break;

            case "win32": // Windows
                commonPaths = [
                    {path: path.join(homedir, "Desktop"), label: "Desktop"},
                    {path: path.join(homedir, "Documents"), label: "Documents"},
                    {path: path.join(homedir, "Downloads"), label: "Downloads"},
                    {path: "C:\\", label: "C: Drive"},
                    {path: "C:\\Program Files", label: "Program Files"},
                    {path: "C:\\Users", label: "Users"},
                ];
                break;

            case "linux":
                commonPaths = [
                    {path: path.join(homedir, "Desktop"), label: "Desktop"},
                    {path: path.join(homedir, "Documents"), label: "Documents"},
                    {path: path.join(homedir, "Downloads"), label: "Downloads"},
                    {path: "/home", label: "Home"},
                    {path: "/usr", label: "USR"},
                    {path: "/etc", label: "ETC"},
                ];
                break;

            default:
                // Basic paths that should work on most systems
                commonPaths = [{path: homedir, label: "Home Directory"}];
        }

        res.json({
            success: true,
            username,
            homedir,
            platform,
            commonPaths,
            pathSeparator: path.sep,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to get system information",
        });
    }
}

const getConfigFilePathController = async (req: Request, res: Response) => {
    try {
        const {getClaudeConfigDir} = await import("mcp-utils/utils");
        const {constants} = await import("../utils/constants");
        const filePath = path.join(getClaudeConfigDir(), constants.fsConfigFile);
        res.json({success: true, filePath});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
}

const initializeConfigController = async (req: Request, res: Response) => {
    try {
        const {getAllowedRoots} = await import("../utils/getAllowedRoots");
        const permissions = await getAllowedRoots();
        res.json({success: true, permissions});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
}

const readFileController = async (req: Request, res: Response) => {
    try {
        const {filePath} = req.body;
        const content = await fs.readFile(filePath, "utf8");
        res.json({success: true, content});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
}

const modifyFileController = async (req: Request, res: Response) => {
    try {
        const {filePath, content, encoding} = req.body;

        let totalLines = 1;
        try {
            const resolvePath = (await import("../utils/resolvePath")).default;
            const fullPath = await resolvePath(filePath, 'read');
            const existingContent = await fs.readFile(fullPath, (encoding || "utf8") as BufferEncoding);
            totalLines = existingContent.split('\n').length;
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        const result = await modifyFile(filePath, "replace", 1, content, totalLines, encoding);
        res.json({success: true, message: result});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
}

export {
    getSystemInfoController,
    getConfigFilePathController,
    initializeConfigController,
    readFileController,
    modifyFileController,
};
