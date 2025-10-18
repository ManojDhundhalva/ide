import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 

export default function FileExplorerComponent() {
  
  const {
    fileTree,
    getFilesLoading,
    getFilesError,
    getFileContent,
    getFileContentLoading,
    getFiles
  } = useFileStore();

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
    try {
      const content = await getFileContent(fullPath);
      console.log(`Content of ${fileName}:`);
      console.log(content);
    } catch (error) {
      console.error('Failed to get file content:', error);
    }
  };

  const renderFileTree = (path = '', level = 0) => {
    const entries = fileTree.get(path) || [];
    
    return entries.map((entry) => {
      const fullPath = path ? `${path}/${entry.name}` : entry.name;
      const isExpanded = expandedFolders.has(fullPath);
      
      return (
        <div key={fullPath} style={{ marginLeft: `${level * 20}px` }}>
          {entry.type === 'directory' ? (
            <div>
              <div
                onClick={() => handleFolderClick(path, entry.name)}
                style={{
                  cursor: 'pointer',
                  padding: '5px',
                  backgroundColor: isExpanded ? '#f0f0f0' : 'transparent',
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
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>File Explorer</h2>
      
      {getFilesLoading && !fileTree.size && (
        <div>Loading files...</div>
      )}
      
      <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px' }}>
        {renderFileTree()}
      </div>

      {getFileContentLoading && (
        <div style={{ marginTop: '10px' }}>Loading file content...</div>
      )}
    </div>
  );
};