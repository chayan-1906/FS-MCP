# 🗂️ File System MCP Server

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/chayan-1906/fs-mcp)
[![Node.js](https://img.shields.io/badge/node.js-16.x+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/express-5.1.0-black.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/model_context_protocol-compliant-purple.svg)](https://modelcontextprotocol.io/)

Production-ready Model Context Protocol (MCP) server providing Claude with complete file system integration including
directory management, file operations, Office document creation/editing, and advanced file tree visualization. Pre-built
executables available for macOS, Windows, and Linux for easy end-user installation without Node.js dependencies.

---

<img src="https://raw.githubusercontent.com/chayan-1906/FS-MCP/master/src/public/file-system.png" alt="logo" width="150"/>

## ⚙️ Quick Start

### Option 1: Use Pre-built Package

#### 1. Install Claude Desktop:

Download from [https://claude.ai/download](https://claude.ai/download)

#### 2. Download the Executable:

**macOS:**
📦 [Download macOS Executable](https://github.com/chayan-1906/FS-MCP/releases/download/v1.1.0/file-system)

**Windows:**
📦 [Download Windows Executable](https://github.com/chayan-1906/FS-MCP/releases/download/v1.1.0/file-system.exe)

#### 3. Run the Executable:

- **For macOS/Linux users**:
  ```bash
  chmod +x file-system
  ./file-system
  ```
- **For Windows users**:
  Double-click the file, or run via terminal: `.\file-system.exe`

**Note**:

1. No need to run the executable repeatedly
2. Do NOT delete the executable after running
3. If you rename, move, or modify the executable, you must run it again (Step 3) to restart it properly

#### 4. 🌐 Explore Available Tools (Optional)

Visit the homepage to browse all available tools:

- **Homepage**: **http://localhost:20252/**
- See all 20 File System tools with user-friendly descriptions
- Great for understanding what the server can do

#### 5. Configure Permissions:

**IMPORTANT**: Access the permissions manager at **http://localhost:20252** to configure file system access:

⚠️ **Keep the Application Running**: You must keep either:

- **Claude Desktop open** (recommended for most users), OR
- **The terminal/command window open** where you ran the program (for advanced users)

If you close both Claude Desktop AND the terminal window, the file system server will stop working.

- Navigate to **http://localhost:20252** in your browser
- Add paths manually using the input field (no file picker available - you need to enter paths manually)
- Select appropriate permissions (Read Only or Read & Write)
- Save your configuration

#### 6. (Optional) Stop the Server:

You can stop the server if needed (launching Claude will automatically stop the currently running instance/port)

#### 7. Launch Claude Desktop

Start Claude Desktop application

#### 8. Start Using File Operations:

Claude will now have access to file system operations based on your configured permissions

**Important**: When prompting Claude, include "use file system tools" in your prompts to ensure the LLM utilizes the
file system MCP tools

### Option 2: Build from Source

#### 1. 📁 Clone the repo

```bash
git clone https://github.com/chayan-1906/FS-MCP.git
cd FS-MCP
```

#### 2. 📦 Install dependencies

```bash
npm install
```

#### 3. 🧪 Run the MCP Server

```bash
npm run dev
```

Or compile and run:

```bash
npm run build
npm run bundle
npm run package
```

#### 4. 🔧 Configure Permissions

Visit **http://localhost:20252** to access the permissions manager and configure file system access.

## 🔒 Permissions Manager

The File System MCP includes a built-in permissions manager accessible at **http://localhost:20252**.

### Key Features:

- **Manual Path Entry**: Enter file and folder paths manually in the input field
- **Permission Levels**: Choose between Read Only and Read & Write access
- **Real-time Updates**: See changes immediately with pending indicators
- **Undo Functionality**: Easily undo removed permissions
- **Server Status**: Real-time connection status monitoring

### Important Notes:

⚠️ **No File Picker**: The interface does not support file/folder selection via file picker. You must manually enter the
complete path to files and folders in the input field.

⚠️ **Localhost Access Required**: You must access the permissions manager through **http://localhost:20252** - do not
open the HTML file directly.

### Configuration File Location:

**macOS/Linux:**

```
~/Library/Application Support/Claude/file_system_config.json
```

**Windows:**

```
%APPDATA%\Claude\file_system_config.json
```

### File Format:

```json
[
  {
    "path": "/path/to/file/or/folder",
    "operation": "read"
  },
  {
    "path": "/another/path",
    "operation": "write"
  }
]
```

## 📖 User Guide

Detailed
documentation: [FileSystem MCP User Guide](https://www.notion.so/FileSystem-MCP-User-Guide-25a0c027172280b5bccfcf1dadd9120b)

---

## 🧰 Available Tools

| Tool Name                    | Category  | Description                                                                                             |
|------------------------------|-----------|---------------------------------------------------------------------------------------------------------|
| `get-directory-content`      | Directory | Lists files and folders within the specified directory                                                  |
| `create-directory`           | Directory | Creates a new directory at the specified path                                                           |
| `delete-directory`           | Directory | Deletes a directory                                                                                     |
| `list-allowed-directories`   | Directory | Returns the list of allowed directories and their permissions from the configuration                    |
| `directory-tree`             | Directory | Generates a hierarchical tree view of directory structure with customizable depth and filtering options |
|                              |           |                                                                                                         |
| `read-file`                  | File      | Reads file content with line numbers. Supports reading specific line ranges                             |
| `create-file`                | File      | Creates a new empty file at the specified path                                                          |
| `modify-file`                | File      | Modifies specific lines in a file using insert, replace, or delete operations                           |
| `copy-file`                  | File      | Copies a file from the source path to the destination path                                              |
| `delete-file`                | File      | Deletes a file at the specified path                                                                    |
| `get-file-directory-info`    | File      | Retrieves metadata about a file or directory                                                            |
| `search-file-directory`      | File      | Searches for files or directories by name within allowed directories                                    |
| `move-rename-file-directory` | File      | Moves or renames a file or directory from the source path to the destination path                       |
|                              |           |                                                                                                         |
| `create-excel`               | Office    | Creates an Excel sheet (.xlsx) with specified data and advanced styling                                 |
| `read-excel`                 | Office    | Reads Excel (.xlsx) files and returns data from all sheets                                              |
| `create-presentation`        | Office    | Creates a PowerPoint presentation (.pptx) with specified slides and content                             |
| `read-presentation`          | Office    | Reads PowerPoint (.pptx) files and extracts text content                                                |
| `create-document`            | Office    | Creates a Word document (.docx) with specified content and formatting                                   |
| `read-document`              | Office    | Reads Word (.docx) files and extracts text content                                                      |
|                              |           |                                                                                                         |
| `run-shell-command`          | System    | Executes a shell command on the server                                                                  |

---

## 📋 Changelog

### v1.1.0 (2025-09-18)

#### ✨ New Features

- **Interactive Homepage**: Complete tool browser at `http://localhost:20252/` showcasing all 20 file system MCP tools
- **Advanced Search & Filtering**: Real-time search across tool names and descriptions with category-based filtering
- **Tool Documentation Modals**: Click-to-view detailed information for each tool including parameters, examples, and
  descriptions
- **Responsive Design**: Modern glassmorphism UI with mobile-responsive layout and smooth animations

#### 🔄 Changes

- **Tool Architecture**: Enhanced all tool registrations with structured metadata integration using `mcp-utils` package
- **Route Updates**: Renamed `/input` to `/manage-permissions` for better semantic clarity and user understanding
- **Parameter Descriptions**: Migrated from hardcoded descriptions to dynamic parameter descriptions from tool
  configurations
- **Type Safety**: Added comprehensive TypeScript interfaces for Excel, Document, and Presentation data structures

#### 🏗️ Technical Improvements

- **Homepage Generation**: Created new `src/templates/homepageHTML.ts` with interactive HTML, CSS, and JavaScript
- **Type Definitions**: Added `src/types/index.ts` with interfaces for `TreeNode`, `TreeResult`, `ExcelData`,
  `PresentationData`, and `DocumentData`
- **Build Process**: Unified build script execution across macOS and Windows platforms in `package-script.ts`
- **Error Handling**: Improved error reporting consistency across all tool implementations

#### 📦 Dependencies

- **@modelcontextprotocol/sdk**: Updated from `^1.17.4` to `^1.18.0` for latest MCP protocol support
- **mcp-utils**: Integrated for enhanced tool categorization and parameter management

#### 🧹 Code Quality

- **Interface Consolidation**: Moved type definitions from individual tool files to centralized `src/types/`
- **Configuration Management**: Unified tool constants with comprehensive metadata including categories and descriptions
- **Package Management**: Removed package-lock.json for better cross-platform compatibility

#### 📊 Statistics

- **Total Tools**: 20 comprehensive file system operations organized across 3 categories
- **New Routes**: Homepage (`/`) with searchable tool browser and permissions management (`/manage-permissions`)
- **UI Components**: Interactive modals, search functionality, category filters, and responsive design elements

---

## 🔧 Features

- **📁 Complete File Operations**: Read, write, create, delete, copy, move, and rename files
- **🗂️ Directory Management**: Create, delete, list, and navigate directory structures
- **📊 Office Document Support**: Create and read Excel, PowerPoint, and Word documents
- **🌳 Advanced Tree Visualization**: Hierarchical directory tree with customizable depth and filtering
- **🔒 Security-First Design**: Granular permissions system with read/write access control
- **🖥️ Web-Based Permissions Manager**: User-friendly interface for managing file system access
- **⚡ Real-time Updates**: Live synchronization and status monitoring
- **🔍 Smart Search**: Find files and directories by name with flexible matching
- **📝 Line-by-Line Editing**: Precise file modifications without full rewrites
- **🚀 Shell Integration**: Execute system commands with proper security measures

## 🛠️ Architecture

The server is structured with:

- **Tools**: Individual file system operation handlers
- **Controllers**: Business logic for file operations and web interface
- **Routes**: API endpoints and web routes
- **Utils**: Helper functions, security checks, and path resolution
- **Config**: Environment and configuration management
- **Public**: Web-based permissions manager interface

## 🔍 File System Coverage

This MCP server provides comprehensive file system operations including:

- File and directory CRUD operations
- Advanced tree visualization and navigation
- Office document creation and manipulation
- Metadata extraction and file information
- Search and filtering capabilities
- Shell command execution
- Permissions management and security

## 👨‍💻 Tech Stack

- 🟦 **TypeScript** – Type-safe application development
- 📁 **File System APIs** – Native file system integration
- 🧠 **MCP SDK** – Model Context Protocol server framework
- ✅ **Zod** – Schema-based input validation
- 📊 **ExcelJS** – Excel file manipulation
- 📄 **Docx** – Word document creation
- 🎥 **PptxGenJS** – PowerPoint presentation generation
- 🚀 **Express.js** – Web server framework for permissions manager
- 🎨 **CORS** – Cross-origin resource sharing

## 🔐 Security Features

- **Path Validation**: Prevents directory traversal attacks
- **Permission Boundaries**: Restricts access to explicitly allowed paths
- **Operation Validation**: Validates read/write permissions for each operation
- **Safe Path Resolution**: Resolves and validates all file paths
- **Error Isolation**: Prevents sensitive information leakage through errors
- **Configuration Protection**: Secures permissions configuration file

## 🚀 Performance Optimizations

- **Efficient Tree Generation**: Optimized directory traversal algorithms
- **Memory Management**: Streaming for large file operations
- **Caching**: Smart caching for frequently accessed directory structures
- **Async Operations**: Non-blocking file system operations
- **Error Recovery**: Graceful handling of file system errors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/add-pdf-support` or `git checkout -b fix/permission-validation`)
3. Commit your changes (`git commit -m 'Add PDF file support'` or
   `git commit -m 'Fix permission validation for nested paths'`)
4. Push to the branch (`git push origin feature/add-pdf-support`)
5. Open a Pull Request

## 👨‍💻 Author

**Padmanabha Das**

- GitHub: [@chayan-1906](https://github.com/chayan-1906)
- LinkedIn: [Padmanabha Das](https://www.linkedin.com/in/padmanabha-das-59bb2019b/)
- Email: padmanabhadas9647@gmail.com

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️!

## 📱 Connect With Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/padmanabha-das-59bb2019b/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/chayan-1906)

## 💡 Need More Features?

If you need additional file system tools or features that aren't currently available, please let me know! I'm happy to
extend the functionality based on your requirements.

## 🔗 License

MIT

---

<div align="center">
  <p>Made with ❤️ by Padmanabha Das</p>
  <p>⭐ Star this repo if you found it helpful!</p>
  <p><strong>Note:</strong> This server requires proper file system permissions configuration. Please ensure you have configured allowed paths before running file operations.</p>
</div>
