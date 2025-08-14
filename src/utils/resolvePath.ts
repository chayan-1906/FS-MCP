import path from "path";
import { getAllowedRoots } from "./getAllowedRoots";
import { getClaudeConfigDir } from "mcp-utils/utils";
import { constants } from "./constants";

// Find directory by name in allowed roots
const findDirectoryByName = async (searchName: string): Promise<string | null> => {
    const ALLOWED_ROOTS = await getAllowedRoots();
    for (const root of ALLOWED_ROOTS) {
        if (path.basename(root.path) === searchName) {
            return root.path;
        }
    }
    return null;
};

const resolvePath = async (relativePath: string, operation: 'read' | 'write'): Promise<string> => {
    const resolved = path.resolve(relativePath);

    // Special case: Always allow write to Claude config file
    const configPath = path.join(getClaudeConfigDir(), constants.fsConfigFile);
    if (resolved === configPath) {
        return resolved;
    }

    const ALLOWED_ROOTS = await getAllowedRoots();

    // If it's already an absolute path, validate it's allowed
    if (path.isAbsolute(relativePath)) {
        // Find ALL matching roots, then pick the most specific one (longest path)
        const matchingRoots = ALLOWED_ROOTS.filter((root: any) => {
            const resolvedBasePath = path.resolve(root.path);
            return resolved.startsWith(resolvedBasePath);
        });

        if (matchingRoots.length === 0) {
            throw new Error("Access denied: Path is outside allowed directories ❌");
        }

        // Sort by path length (descending) to get most specific match first
        const mostSpecificRoot = matchingRoots.sort((a: any, b: any) => b.path.length - a.path.length)[0];

        if (mostSpecificRoot.operation !== operation && mostSpecificRoot.operation !== 'write') {
            throw new Error(`Access denied: Insufficient permissions for ${operation} operation on this path ❌`);
        }

        return resolved;
    }

    // For relative paths, try to resolve intelligently
    const pathParts = relativePath.split('/');
    const firstPart = pathParts[0];
    const remainingPath = pathParts.slice(1).join('/');

    // Try to find the first part as a directory name in allowed roots
    const foundDir = await findDirectoryByName(firstPart);
    if (foundDir) {
        const fullPath = remainingPath ? path.join(foundDir, remainingPath) : foundDir;
        return await resolvePath(fullPath, operation);
    }

    // Fallback: treat as absolute path if it looks like one
    if (relativePath.startsWith('/') || relativePath.includes(':')) {
        return await resolvePath(path.resolve(relativePath), operation);
    }

    throw new Error(`Access denied: ${relativePath} is outside allowed directories ❌`);
}

export default resolvePath;
