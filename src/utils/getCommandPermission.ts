const getCommandPermission = (command: string): 'read' | 'write' | 'none' => {
    const cmd = command.trim().toLowerCase();

    // No filesystem access needed
    const noAccessPatterns = [
        /^cd\s+/,
        /^pwd$/,
        /^echo\s+[^>]/,
        /^date$/,
        /^whoami$/,
        /^uname/,
        /^which\s+/,
        /^alias/,
        /^history$/,
        /^clear$/,
    ];

    // Read-only commands
    const readOnlyPatterns = [
        /^git\s+(status|log|branch|diff|show|remote|config --get|rev-parse|describe)/,
        /^git\s+(ls-files|ls-tree|cat-file|blame|shortlog|tag --list)/,
        /^(ls|ll|la)\s*$/,
        /^(ls|ll|la)\s+[^>]/,
        /^cat\s+[^>]/,
        /^head\s+[^>]/,
        /^tail\s+[^>]/,
        /^more\s+/,
        /^less\s+/,
        /^grep\s+.*[^>]/,
        /^find\s+.*(?<!-delete|--delete)[^>]*$/,
        /^locate\s+/,
        /^du\s+/,
        /^df\s+/,
        /^stat\s+/,
        /^file\s+/,
        /^wc\s+[^>]/,
        /^sort\s+[^>]/,
        /^uniq\s+[^>]/,
        /^cut\s+[^>]/,
        /^awk\s+[^>]/,
        /^sed\s+[^>]/,
        /^npm\s+(list|ls|view|info|search|outdated|audit)$/,
        /^yarn\s+(list|info|outdated|audit)$/,
        /^pip\s+(list|show|search)$/,
    ];

    // Write operations
    const writePatterns = [
        /^git\s+(add|commit|push|pull|clone|init|merge|rebase|reset|checkout|switch|restore)/,
        /^git\s+(clean|stash|cherry-pick|revert|tag(?!\s+--list)|branch\s+(?!$))/,
        /^git\s+(rm|mv|config --set|config --unset|remote add|remote remove)/,
        /^(mkdir|rmdir|rm|cp|mv|ln|touch|chmod|chown|chgrp)$/,
        /^(mkdir|rmdir|rm|cp|mv|ln|touch|chmod|chown|chgrp)\s+/,
        /^(tar|zip|unzip|gzip|gunzip)\s+/,
        /.*>\s*[^&]/,
        /.*>>\s*[^&]/,
        /^echo\s+.*>/,
        /^npm\s+(install|i|update|uninstall|remove|publish|run|start|build|test)$/,
        /^yarn\s+(add|remove|install|upgrade|build|start|test)$/,
        /^pip\s+(install|uninstall|upgrade)$/,
        /^(make|cmake|gradle|maven|ant)\s+/,
        /^(docker|podman)\s+/,
        /^(vim|vi|nano|emacs|code|subl)\s+/,
        /^find\s+.*(-delete|--delete)/,
    ];

    for (const pattern of noAccessPatterns) {
        if (pattern.test(cmd)) return 'none';
    }

    for (const pattern of readOnlyPatterns) {
        if (pattern.test(cmd)) return 'read';
    }

    for (const pattern of writePatterns) {
        if (pattern.test(cmd)) return 'write';
    }

    return 'write';
}

export default getCommandPermission;
