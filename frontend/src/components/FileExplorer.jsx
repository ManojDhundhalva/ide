import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 
import { useProjectStore } from "../store/projectStore";

export default function FileExplorerComponent({ socket }) {
  
  const fileTree = useFileStore((s) => s.fileTree);
  const getFilesLoading = useFileStore((s) => s.getFilesLoading);
  const getFilesError = useFileStore((s) => s.getFilesError);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getFiles = useFileStore((s) => s.getFiles);
  const getFilesDirectoryPath = useFileStore((s) => s.getFilesDirectoryPath);
  const getFileContentFilePath = useFileStore((s) => s.getFileContentFilePath);

  const openTab = useFileStore((s) => s.openTab);
  const initFiles = useFileStore((s) => s.initFiles);
  const handleRefreshFileExplorer = useFileStore((s) => s.handleRefreshFileExplorer);
  const activeFile = useFileStore((s) => s.activeTab);

  const project = useProjectStore((s) => s.project);
  const [expandedFolders, setExpandedFolders] = useState(new Set(project?.metadata?.expandedDirectories));

  useEffect(() => {
    initFiles();
  }, [initFiles]);

  const handleFolderClick = async (folderPath, folderName) => {
    const fullPath = folderPath ? `${folderPath}/${folderName}` : folderName;
    
    if (expandedFolders.has(fullPath)) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.delete(fullPath);
      setExpandedFolders((prev) => newExpanded);

      socket.emit("file-explorer:collapse-folder", { path: fullPath });

    } else {
      // Expand folder - fetch data if not already loaded
      if (!fileTree.has(fullPath)) {
        await getFiles(fullPath);
      }
      
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(fullPath);
      setExpandedFolders((prev) => newExpanded);

      socket.emit("file-explorer:expand-folder", { path: fullPath });
    }
  };

  const handleFileClick = async (filePath, fileName) => {
    const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
    openTab(fullPath, socket);
  };

  useEffect(() => {
    if(!socket) return;

    socket.on("file-explorer:refresh", handleRefreshFileExplorer);

    return () => {
      socket.off("file-explorer:refresh", handleRefreshFileExplorer);
    };

  }, [socket]);

  const renderFileTree = (path = '', level = 0) => {
    const entries = fileTree.get(path) || [];
    
    return entries.map((entry) => {
      const fullPath = path ? `${path}/${entry.name}` : entry.name;
      const isExpanded = expandedFolders.has(fullPath);
      const isCurrentDirectoryLoading = getFilesLoading && getFilesDirectoryPath === fullPath;
      const isCurrentFileLoading = getFileContentLoading && getFileContentFilePath === fullPath;
      
      return (
        <div key={fullPath} style={{ marginLeft: `${level * 10}px` }}>
          {entry.type === 'directory' ? (
            <div>
              <div
                onClick={() => handleFolderClick(path, entry.name)}
                style={{
                  cursor: 'pointer',
                  padding: '2px',
                  backgroundColor: isExpanded ? '#000' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{isExpanded ? '📂' : '📁'}</span>
                <span>{entry.name}</span>
                {isCurrentDirectoryLoading && <span>⏳</span>}
              </div>
              {isExpanded && renderFileTree(fullPath, level + 1)}
            </div>
          ) : (
            <div
              onClick={() => handleFileClick(path, entry.name)}
              style={{
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: activeFile === fullPath ? "grey" : "transparent",
              }}
            >
              <span>📄</span>
              <span>{entry.name}</span>
              {isCurrentFileLoading && <span>⏳</span>}
            </div>
          )}
        </div>
      );
    });
  };

  if (getFilesError) {
    return (
      <div style={{ color: 'red', padding: '10px' }}>
        Error: {getFilesError}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', fontFamily: 'Arial, sans-serif', padding: '8px' }}>
      {getFilesLoading && !fileTree.size && (
        <div>Loading files...</div>
      )}
      
      <div style={{ padding: '10px', height: "100%", width: "100%", backgroundColor: "rgba(50, 50, 50, 1)" }}>
        {renderFileTree()}
      </div>
    </div>
  );
};