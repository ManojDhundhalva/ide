import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 

export default function FileExplorerComponent() {
  
  const fileTree = useFileStore((s) => s.fileTree);
  const getFilesLoading = useFileStore((s) => s.getFilesLoading);
  const getFilesError = useFileStore((s) => s.getFilesError);
  // const getFileContent = useFileStore((s) => s.getFileContent);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getFiles = useFileStore((s) => s.getFiles);
  const setCurrentFilePath = useFileStore((s) => s.setCurrentFilePath);

  const [currentPath, setCurrentPath] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Load root directory on component mount
  useEffect(() => {
    getFiles();
  }, [getFiles]);

  const handleFolderClick = async (folderPath, folderName) => {
    const fullPath = folderPath ? `${folderPath}/${folderName}` : folderName;
    
    // Toggle expanded state
    if (expandedFolders.has(fullPath)) {
      // Collapse folder
      const newExpanded = new Set(expandedFolders);
      newExpanded.delete(fullPath);
      setExpandedFolders(newExpanded);
    } else {
      // Expand folder - fetch data if not already loaded
      if (!fileTree.has(fullPath)) {
        await getFiles(fullPath);
      }
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(fullPath);
      setExpandedFolders(newExpanded);
    }
  };

  const handleFileClick = async (filePath, fileName) => {
    const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
    setCurrentFilePath(fullPath);
    
  };

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