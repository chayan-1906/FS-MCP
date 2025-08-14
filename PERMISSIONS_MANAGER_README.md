# FS-MCP Permissions Manager

## Overview

The FS-MCP Permissions Manager is a web-based interface for managing file system permissions for the MCP (Model Context
Protocol) server. It allows users to control which files and folders AI assistants can access.

## Features

### ✅ **File and Folder Selection**

- **File System Access API**: Modern browsers can use native file/folder pickers
- **Manual Path Entry**: Fallback option for entering paths manually
- **Path Validation**: Basic validation to ensure valid file/folder paths

### ✅ **Permission Management**

- **Read Only Access**: View and list files only
- **Read & Write Access**: Full control over files
- **Visual Indicators**: Clear visual distinction between permission types

### ✅ **User Experience**

- **Real-time Updates**: See changes immediately with pending indicators
- **Undo Functionality**: Easily undo removed permissions
- **Server Status**: Real-time connection status monitoring
- **Refresh Capability**: Reload permissions from server
- **Responsive Design**: Works on desktop and mobile devices

### ✅ **API Integration**

- **Dynamic Config Path**: Automatically detects the correct config file location
- **Error Handling**: Comprehensive error handling and user feedback
- **Connection Monitoring**: Periodic server status checks

## How to Use

### 1. **Starting the Server**

```bash
npm start
# or
node dist/server.js
```

The server will start on `http://localhost:20252`

### 2. **Accessing the Interface**

Open your browser and navigate to:

```
http://localhost:20252
```

### 3. **Adding Permissions**

#### Option A: Using File System Access API (Recommended)

1. Click "Browse for file or folder..."
2. Choose "Add File" or "Add Folder"
3. Select the file/folder using the native picker
4. Enter or confirm the full path when prompted
5. Select permission level (Read Only or Read & Write)
6. Click "Add Permission"

#### Option B: Manual Path Entry

1. Click "Browse for file or folder..."
2. Choose "Enter Path Manually"
3. Type the full path to the file or folder
4. Select permission level
5. Click "Add Permission"

### 4. **Managing Permissions**

- **Remove**: Click the red X button on any permission
- **Undo**: Use the "Undo" button to restore recently removed permissions
- **Save**: Click "Save Changes" to persist your changes
- **Refresh**: Click the refresh button to reload from server

## Technical Details

### API Endpoints

- `GET /api/config-file-path` - Get the config file location
- `POST /api/read-file` - Read the permissions file
- `POST /api/modify-file` - Write permissions to the config file
- `POST /api/initialize-config` - Initialize default permissions

### Config File Location

The permissions are stored in:

```
~/Library/Application Support/Claude/file_system_config.json
```

### File Format

```json
[
    {
        "path": "/path/to/file/or/folder",
        "operation": "read" // or "write"
    }
]
```

## Browser Compatibility

### File System Access API Support

- **Chrome/Edge**: Full support for file/folder pickers
- **Firefox**: Limited support (manual path entry recommended)
- **Safari**: Limited support (manual path entry recommended)

### Fallback Behavior

When File System Access API is not available:

- Users are prompted to enter paths manually
- All other functionality remains the same

## Troubleshooting

### Server Connection Issues

- Check if the server is running on port 20252
- Verify firewall settings
- Check browser console for error messages

### Permission Issues

- Ensure the config directory is writable
- Check file permissions on the config file
- Verify the user has access to the specified paths

### File Path Issues

- Use absolute paths (starting with `/`)
- Ensure paths exist on the file system
- Check for special characters in path names

## Development

### Making Changes

1. Edit `src/public/fs-permissions-manager.html`
2. Restart the server
3. Refresh the browser

### Adding New Features

- Follow the existing code structure
- Add proper error handling
- Test with different browsers
- Update this README as needed

## Security Considerations

- The interface only manages local file permissions
- No file content is transmitted to external servers
- All operations are performed locally
- File System Access API provides secure file selection
- Path validation prevents malicious input

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify server logs for backend issues
3. Ensure all dependencies are installed
4. Test with different browsers if issues persist
