const extensionToLanguage = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "cpp",
    cs: "csharp",
    php: "php",
    go: "go",
    rs: "rust",
    sh: "shell",
    yml: "yaml",
    yaml: "yaml",
    sql: "sql",
    xml: "xml",
    txt: "plaintext",
};

export const detectLanguage = (path) => {
    if (!path) return "plaintext";
    const ext = path.split(".").pop();
    return extensionToLanguage[ext] || "plaintext";
};