const tools = {
    // directory
    listDirectory: "list_directory", // ✅
    createDirectory: "create_directory", // ✅
    deleteDirectory: "delete_directory", // ✅

    // file
    getFileInfo: "get_file_info", // ✅
    readFile: "read_file", // ✅
    writeFile: "write_file", // can't create any files except .txt
    copyFile: "copy_file", // ✅
    moveFile: "move_file", // ✅
    deleteFile: "delete_file", // ✅
};

const constants = {
    fsConfigFile: "file_system_config.json",
};

export {tools, constants};
