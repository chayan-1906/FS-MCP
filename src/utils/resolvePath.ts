import * as path from "path";
import {ALLOWED_PATHS} from "../config/config";

const resolvePath = (relativePath: string): string => {
    // If it's already an absolute path, validate it's allowed
    if (path.isAbsolute(relativePath)) {
        const resolved = path.resolve(relativePath);

        const isAllowed = ALLOWED_PATHS.some(allowedPath => {
            const basePath = allowedPath || process.cwd();
            const resolvedBasePath = path.resolve(basePath);
            return resolved.startsWith(resolvedBasePath);
        });

        if (!isAllowed) {
            throw new Error("Access denied: Path is outside allowed directories");
        }

        return resolved;
    }

    // For relative paths, try each allowed path
    for (const allowedPath of ALLOWED_PATHS) {
        const basePath = allowedPath || process.cwd();
        const resolved = path.resolve(basePath, relativePath);

        const resolvedBasePath = path.resolve(basePath);
        if (resolved.startsWith(resolvedBasePath)) {
            return resolved;
        }
    }

    throw new Error("Access denied: Path is outside allowed directories");
}

export default resolvePath;
