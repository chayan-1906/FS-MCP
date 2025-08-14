import os from "os";
import path from "path";
import express from "express";

const router = express.Router();

router.get("/system-info", (req, res) => {
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
});

export const SystemControllerRoute = router;
