# File System MCP - Permissions Manager

This project includes a simple HTML-based permissions manager for controlling file system access in the MCP (Model
Context Protocol) server.

---

![logo](https://raw.githubusercontent.com/chayan-1906/FS-MCP/master/file-system.png)

## Features

The File System Permissions Manager provides a user-friendly interface to:

- **View** current file system permissions
- **Add** new paths with read or write permissions
- **Edit** existing permissions (change operation type)
- **Delete** permissions
- **Save** changes to the configuration file
- **Auto-create** the config file if it doesn't exist

## How to Use

### 1. Start the server

```bash
npm start
```

### 2. Access the permissions manager

**IMPORTANT**: You must access the HTML page through the server, not by opening the file directly.

Open your browser and navigate to one of these URLs:

```
http://localhost:20252/
http://localhost:20252/permissions
http://localhost:20252/fs-permissions-manager.html
```

**❌ DO NOT** open the HTML file directly from your file system (like `file:///path/to/fs-permissions-manager.html`) as
this will cause API calls to fail.

### 3. Manage permissions

- Click "🔄 Refresh" to load current permissions
- Click "➕ Add Permission" to add a new path
- Click "✏️ Edit" on any permission to modify it
- Click "🗑️ Delete" to remove a permission
- Click "💾 Save Changes" to persist your changes
- Click "⚙️ Initialize Config" to create the config file with default permissions

## Configuration File

The permissions are stored in:

```
~/Library/Application Support/Claude/file_system_config.json
```

The file contains an array of permission objects:

```json
[
    {
        "path": "/path/to/directory",
        "operation": "read"
    },
    {
        "path": "/another/path",
        "operation": "write"
    }
]
```

## Operations

- **read**: Allows reading and listing files in the specified path
- **write**: Allows full read and write access to the specified path

## API Endpoints

The server provides these REST API endpoints:

- `GET /api/config-file-path` - Get the config file path
- `POST /api/read-file` - Read file contents
- `POST /api/modify-file` - Write content to a file
- `POST /api/initialize-config` - Initialize config file with default permissions

## Auto-Creation Feature

When the system tries to read the config file and it doesn't exist:

1. **Automatically creates** the directory structure if needed
2. **Creates the config file** with default permissions
3. **Returns the default permissions** for immediate use
4. **Logs the creation process** for debugging

## Technical Details

- **No frameworks**: Pure HTML, CSS, and JavaScript
- **Responsive design**: Works on desktop and mobile
- **Real-time updates**: Changes are reflected immediately in the UI
- **Error handling**: Graceful fallbacks when the config file doesn't exist
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Debug logging**: Console logs for troubleshooting API calls

## Troubleshooting

### API calls showing "file:///api/..." errors

This happens when you open the HTML file directly instead of through the server. Always use `http://localhost:20252/` to
access the page.

### Config file not found

Click the "⚙️ Initialize Config" button to create the config file with default permissions.

### Permission denied errors

Make sure the server has write permissions to the Claude configuration directory.

## Security

- Only paths explicitly configured in the permissions file are accessible
- Default permissions are limited to the Claude configuration directory
- All file operations are validated against the allowed paths
