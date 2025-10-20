import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 

export default function FileExplorerComponent({ socket, project }) {
  
  const fileTree = useFileStore((s) => s.fileTree);
  const getFilesLoading = useFileStore((s) => s.getFilesLoading);
  const getFilesError = useFileStore((s) => s.getFilesError);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getFiles = useFileStore((s) => s.getFiles);
  const initFiles = useFileStore((s) => s.initFiles);
  const handleRefreshFileExplorer = useFileStore((s) => s.handleRefreshFileExplorer);
  const getExpandedDirectories = useFileStore((s) => s.getExpandedDirectories);
  const setCurrentFilePath = useFileStore((s) => s.setCurrentFilePath);

  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    initFiles();
  }, [initFiles]);

  useEffect(() => {
    const fetchExpanded = async () => {
      if(!project.projectId) return;
      const data = await getExpandedDirectories(project.projectId);
      setExpandedFolders((prev) => new Set(data));
    }
    fetchExpanded();
  }, [project]);

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
    setCurrentFilePath(fullPath);
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
                {getFilesLoading && isExpanded && <span>⏳</span>}
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
                gap: '5px'
              }}
            >
              <span>📄</span>
              <span>{entry.name}</span>
              {getFileContentLoading && <span>⏳</span>}
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