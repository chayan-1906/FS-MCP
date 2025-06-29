const tools = {
    // directory
    listDirectory: "list-directory", // ✅
    createDirectory: "create-directory", // ✅
    deleteDirectory: "delete-directory", // ✅

    // file
    getFileInfo: "get-file-info", // ✅
    readFile: "read-file", // ✅
    writeFile: "write-file", // can't create any files except .txt
    copyFile: "copy-file", // ✅
    moveFile: "move-file", // ✅
    deleteFile: "delete-file", // ✅
    searchFileDirectory: "search-file-directory", // ✅
};

const constants = {
    fsConfigFile: "file_system_config.json",
};

export {tools, constants};
