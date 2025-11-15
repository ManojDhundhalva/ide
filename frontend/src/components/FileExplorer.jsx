import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 
import { useProjectStore } from "../store/projectStore";

import { CircularProgress } from "@mui/material";

export default function FileExplorerComponent({ socket }) {
  
  const fileTree = useFileStore((s) => s.fileTree);
  const getFilesLoading = useFileStore((s) => s.getFilesLoading);
  const getFilesError = useFileStore((s) => s.getFilesError);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getFiles = useFileStore((s) => s.getFiles);
  const getFilesDirectoryPath = useFileStore((s) => s.getFilesDirectoryPath);
  const getFileContentFilePath = useFileStore((s) => s.getFileContentFilePath);

  const openTab = useFileStore((s) => s.openTab);

  const handleRefreshFileExplorer = useFileStore((s) => s.handleRefreshFileExplorer);
  const activeFile = useFileStore((s) => s.activeTab);

  const project = useProjectStore((s) => s.project);
  const [expandedFolders, setExpandedFolders] = useState(new Set(project?.metadata?.expandedDirectories));

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
        <div key={fullPath} style={{ marginLeft: `${level * 10}px`, marginTop: "2px" }}>
          {entry.type === 'directory' ? (
            <div>
              <div
                onClick={() => handleFolderClick(path, entry.name)}
                style={{
                  color: "rgba(220, 220, 220, 1)",
                  cursor: 'pointer',
                  paddingTop: "2px",
                  paddingBottom: "2px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  backgroundColor: isExpanded ? 'rgba(40, 40, 40, 1)' : 'transparent',
                  display: 'flex',
                  justifyContent:"space-between",
                  alignItems: 'center',
                  borderRadius: "6px",
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <div>
                {isExpanded ? <i className="fa-regular fa-folder-open fa-sm" style={{width:"16px"}}></i> : <i className="fa-regular fa-folder fa-sm" style={{width:"16px"}}></i>}
                <span style={{paddingLeft:"2px"}}>{entry.name}</span>
                </div>
                {isCurrentDirectoryLoading && 
                  <CircularProgress
                    size={10}
                    thickness={6}
                    sx={{
                      color: "white",
                      '& circle': { strokeLinecap: 'round' },
                    }}
                  />}
              </div>
              {isExpanded && renderFileTree(fullPath, level + 1)}
            </div>
          ) : (
            <div
              onClick={() => handleFileClick(path, entry.name)}
              style={{
                cursor: 'pointer',
                paddingTop: "2px",
                paddingBottom: "2px",
                paddingLeft: "8px",
                display: 'flex',
                alignItems: 'center',
                backgroundColor: activeFile === fullPath ? '#4d4d4dff' : "transparent",
                borderRadius: "6px",
              }}
            >
              <div style={{display:"flex"}}>
                <div style={{width:"14px", justifyContent:"center",alignItems:"center"}}>
                  <i className="fa-regular fa-file-lines fa-sm"></i>
                </div>
                <span style={{paddingLeft:"2px"}}>{entry.name}</span>
              </div>
              <div>
              {isCurrentFileLoading && 
                <CircularProgress
                size={10}
                thickness={6}
                sx={{
                  color: "white",
                  '& circle': { strokeLinecap: 'round' },
                }}
                />}
              </div>
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
    <div style={{ flex: 1, overflow: 'auto' }}>
      {getFilesLoading && !fileTree.size && (
        <div>Loading files...</div>
      )}
      
      <div style={{ padding: '8px', height: "100%", width: "100%" }}>
        {renderFileTree()}
      </div>
    </div>
  );
};