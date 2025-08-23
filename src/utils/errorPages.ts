export const embeddedHtmlErrorPage = (error: string, port: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FS-MCP Server - Embedded HTML Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
            <!-- Error Icon -->
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            
            <!-- Title -->
            <h1 class="text-2xl font-bold mb-2">
                <span class="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                    FS-MCP Server
                </span>
            </h1>
            
            <!-- Status -->
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Server Running
            </div>
            
            <!-- Error Message -->
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 class="font-semibold text-orange-800 mb-2">Embedded HTML Not Found</h3>
                <p class="text-sm text-orange-700 break-all">${error}</p>
            </div>
            
            <!-- Info -->
            <p class="text-gray-600 text-sm mb-6">
                The server is running and available for API requests, but the embedded HTML interface could not be loaded.
            </p>
            
            <!-- Server Info -->
            <div class="bg-gray-50 rounded-lg p-4 text-left">
                <h4 class="font-medium text-gray-800 mb-2">Server Information</h4>
                <div class="text-sm text-gray-600 space-y-1">
                    <div>• Port: ${port}</div>
                    <div>• Status: Active</div>
                    <div>• Mode: Packaged Binary</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const htmlFileErrorPage = (error: string, port: number, expectedPath: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FS-MCP Server - HTML File Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
            <!-- Error Icon -->
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            
            <!-- Title -->
            <h1 class="text-2xl font-bold mb-2">
                <span class="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                    FS-MCP Server
                </span>
            </h1>
            
            <!-- Status -->
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Server Running
            </div>
            
            <!-- Error Message -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 class="font-semibold text-red-800 mb-2">HTML File Not Found</h3>
                <p class="text-sm text-red-700 break-all">${error}</p>
            </div>
            
            <!-- Info -->
            <p class="text-gray-600 text-sm mb-6">
                The server is running and available for API requests, but the permissions manager interface could not be loaded.
            </p>
            
            <!-- Expected Path -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 class="font-medium text-blue-800 mb-2">Expected File Path</h4>
                <code class="text-sm text-blue-700 break-all">
                    ${expectedPath}
                </code>
            </div>
            
            <!-- Server Info -->
            <div class="bg-gray-50 rounded-lg p-4 text-left">
                <h4 class="font-medium text-gray-800 mb-2">Server Information</h4>
                <div class="text-sm text-gray-600 space-y-1">
                    <div>• Port: ${port}</div>
                    <div>• Status: Active</div>
                    <div>• Mode: Development</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;