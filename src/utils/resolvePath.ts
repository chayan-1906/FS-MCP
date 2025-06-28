import * as path from "path";

const basePath = process.env.BASE_PATH || process.cwd();

// Utility function to resolve and validate paths
const resolvePath = (relativePath: string): string => {
    const resolved = path.resolve(basePath, relativePath);

    // Security check: ensure the resolved path is within the base path
    if (!resolved.startsWith(path.resolve(basePath))) {
        throw new Error("Access denied: Path is outside allowed directory");
    }

    return resolved;
};

export default resolvePath;
