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

export const getFileIcon = (filename) => {

  if(filename === "Dockerfile") return { icon: "fa-brands fa-docker", color: "#0db7ed" };

  const ext = filename.split(".").pop().toLowerCase();

  const map = {
    js:   { icon: "fa-brands fa-js", color: "#F7DF1E" },
    jsx:  { icon: "fa-brands fa-js", color: "#F7DF1E" },

    // ts:   { icon: "fa-brands fa-ts", color: "#3178C6" },
    // tsx:  { icon: "fa-brands fa-ts", color: "#3178C6" },

    html: { icon: "fa-brands fa-html5", color: "#E54C21" },
    css:  { icon: "fa-brands fa-css3-alt",  color: "#1572B6" },

    json: { icon: "fa-solid fa-code", color: "#9CDCFE" },
    md:   { icon: "fa-brands fa-markdown", color: "#fff" },

    py:   { icon: "fa-brands fa-python", color: "#53a8eeff" },
    java: { icon: "fa-brands fa-java", color: "#E51F24" },

    c:    { icon: "fa-solid fa-c", color: "#A8B9CC" },  
    cpp:  { icon: "fa-solid fa-c", color: "#00599C" },
    h:    { icon: "fa-solid fa-c", color: "#00599C" }, 

    cs:   { icon: "fa-solid fa-code", color: "#9B4F96" },

    php:  { icon: "fa-brands fa-php", color: "#777BB4" },
    go:   { icon: "fa-brands fa-golang", color: "#00ADD8" },
    rs:   { icon: "fa-brands fa-rust", color: "#DEA584" },

    sh:   { icon: "fa-solid fa-terminal", color: "#89E051" },

    yml:  { icon: "fa-solid fa-file-code", color: "#FFA000" },
    yaml: { icon: "fa-solid fa-file-code", color: "#FFA000" },

    sql:  { icon: "fa-solid fa-database", color: "#F29111" },
    xml:  { icon: "fa-solid fa-code", color: "#FFB74D" },

    txt:  { icon: "fa-regular fa-file-lines", color: "#53D497" },
    env:  { icon: "fa-solid fa-gear", color: "#53D497" },

    png:  { icon: "fa-regular fa-image", color: "#8BC34A" },
    jpg:  { icon: "fa-regular fa-image", color: "#8BC34A" },
    jpeg: { icon: "fa-regular fa-image", color: "#8BC34A" },
    svg:  { icon: "fa-regular fa-image", color: "#8BC34A" },

    dockerignore: { icon: "fa-brands fa-docker", color: "#0db7ed" },
    gitignore:    { icon: "fa-brands fa-git-alt", color: "#F14E32" },
  };

  return map[ext] || { icon: "fa-solid fa-file-lines", color: "#53D497" };
};