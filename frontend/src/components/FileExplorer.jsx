import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 
import { useProjectStore } from "../store/projectStore";
import { getFileIcon } from "../utils/language";
import { CircularProgress } from "@mui/material";
import UploadDialog from "./UploadDialog";

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
  
  const [hoveredFolder, setHoveredFolder] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTargetPath, setUploadTargetPath] = useState("");

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

  const handleUploadClick = (e, folderPath) => {
    e.stopPropagation();
    setUploadTargetPath(folderPath);
    setUploadDialogOpen(true);
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
      const isHovered = hoveredFolder === fullPath;
      
      return (
        <div key={fullPath} style={{ marginLeft: `${level ? level + 6 : 0}px`, marginTop: "2px" }}>
          {entry.type === 'directory' ? (
            <div>
              <div
                title={fullPath}
                onClick={() => handleFolderClick(path, entry.name)}
                onMouseEnter={(e) => {
                  setHoveredFolder(fullPath);
                  e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 1)';
                  e.currentTarget.style.color = 'rgba(220, 220, 220, 1)';
                }}
                onMouseLeave={(e) => {
                  setHoveredFolder(null);
                  e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(40, 40, 40, 1)' : 'transparent';
                  e.currentTarget.style.color = 'rgba(220, 220, 220, 1)';
                }}
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
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                  {isExpanded ? 
                    <i className="fa-solid fa-folder-open fa-sm" style={{width:"16px", color:"#6ECFF8", flexShrink: 0}}></i> : 
                    <i className="fa-solid fa-folder fa-sm" style={{width:"16px", color:"#6ECFF8", flexShrink: 0}}></i>
                  }
                  <span style={{paddingLeft:"4px", overflow: 'hidden', textOverflow: 'ellipsis'}}>{entry.name}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {isHovered && (
                    <button
                      onClick={(e) => handleUploadClick(e, fullPath)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ccc',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: "0px 0px",
                        fontSize: "smaller"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#505050';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ccc';
                      }}
                      title="Upload files"
                    >
                      <i className="fa-solid fa-arrow-up-from-bracket" style={{width:"10px", color:"#388aaeff", flexShrink: 0}}></i>
                    </button>
                  )}
                  
                  {isCurrentDirectoryLoading && 
                    <CircularProgress
                      size={10}
                      thickness={6}
                      sx={{
                        color: "white",
                        '& circle': { strokeLinecap: 'round' },
                      }}
                    />
                  }
                </div>
              </div>
              {isExpanded && renderFileTree(fullPath, level + 1)}
            </div>
          ) : (
            <div
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = activeFile === fullPath ? 'rgba(77, 77, 77, 1)' : 'rgba(40, 40, 40, 1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = activeFile === fullPath ? 'rgba(77, 77, 77, 1)' : "transparent"
              }}
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
                <div style={{ width: "14px", justifyContent: "center", alignItems: "center" }}>
                  {(() => {
                      const { icon, color } = getFileIcon(entry.name);
                      return <i className={`${icon} fa-sm`} style={{ color }}></i>;
                  })()}
                </div>
                <span style={{ paddingLeft:"4px", textOverflow:"clip", color:"#e7e7e7ff"}}>{entry.name}</span>
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
    <>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {getFilesLoading && !fileTree.size && (
          <div>Loading files...</div>
        )}
        
        <div style={{ padding: '8px', height: "100%", width: "100%" }}>
          {renderFileTree()}
        </div>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        targetPath={uploadTargetPath}
      />
    </>
  );
};