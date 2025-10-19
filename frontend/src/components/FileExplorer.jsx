import { useEffect, useState } from "react";
import { useFileStore } from "../store/fileStore"; 

export default function FileExplorerComponent({ socket, project, setCurrentFilePath }) {
  
  const fileTree = useFileStore((s) => s.fileTree);
  const getFilesLoading = useFileStore((s) => s.getFilesLoading);
  const getFilesError = useFileStore((s) => s.getFilesError);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getFiles = useFileStore((s) => s.getFiles);
  const initFiles = useFileStore((s) => s.initFiles);
  const handleRefreshFileExplorer = useFileStore((s) => s.handleRefreshFileExplorer);

  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    initFiles();
  }, [initFiles]);

  useEffect(() => {
    if (!project?.metadata?.expandedDirectories) return;
    setExpandedFolders(new Set(project.metadata.expandedDirectories));
  }, [project]);

  const handleFolderClick = async (folderPath, folderName) => {
    const fullPath = folderPath ? `${folderPath}/${folderName}` : folderName;
    
    // Toggle expanded state
    if (expandedFolders.has(fullPath)) {
      // Collapse folder
      const newExpanded = new Set(expandedFolders);
      newExpanded.delete(fullPath);
      setExpandedFolders(newExpanded);

      socket.emit("file-explorer:collapse-folder", { path: fullPath });

    } else {
      // Expand folder - fetch data if not already loaded
      if (!fileTree.has(fullPath)) {
        await getFiles(fullPath);
      }
      
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(fullPath);
      setExpandedFolders(newExpanded);

      socket.emit("file-explorer:expand-folder", { path: fullPath });
    }
  };

  const handleFileClick = async (filePath, fileName) => {
    const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
    setCurrentFilePath((prev) => fullPath);
  };

  useEffect(() => {
    if(!socket) return;

    socket.on("file-explorer:refresh", handleRefreshFileExplorer);

    return () => {
      socket.off("file-explorer:refresh", handleRefreshFileExplorer);
    };

  }, []);

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


// import { useEffect, useState, useCallback } from "react";
// import { useFileStore } from "../store/fileStore";

// export default function FileExplorerComponent({ socket, project }) {
//   const fileTree = useFileStore((s) => s.fileTree);
//   const getFilesLoading = useFileStore((s) => s.getFilesLoading);
//   const getFilesError = useFileStore((s) => s.getFilesError);
//   const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
//   const getFiles = useFileStore((s) => s.getFiles);
//   const setCurrentFilePath = useFileStore((s) => s.setCurrentFilePath);
//   const handleRefreshFileExplorer = useFileStore((s) => s.handleRefreshFileExplorer);

//   const [expandedFolders, setExpandedFolders] = useState(new Set());

//   // Fetch root files on mount
//   useEffect(() => {
//     getFiles();
//   }, [getFiles]);

//   // Load project-expanded directories when project changes
//   useEffect(() => {
//     if (project?.metadata?.expandedDirectories) {
//       setExpandedFolders(new Set(project.metadata.expandedDirectories));
//     }
//   }, [project]);

//   const handleFolderClick = useCallback(
//     async (folderPath, folderName) => {
//       const fullPath = folderPath ? `${folderPath}/${folderName}` : folderName;
//       const newExpanded = new Set(expandedFolders);

//       if (expandedFolders.has(fullPath)) {
//         // Collapse
//         newExpanded.delete(fullPath);
//         socket?.emit("file-explorer:collapse-folder", { path: fullPath });
//       } else {
//         // Expand (fetch if missing)
//         if (!fileTree.has(fullPath)) {
//           await getFiles(fullPath);
//         }
//         newExpanded.add(fullPath);
//         socket?.emit("file-explorer:expand-folder", { path: fullPath });
//       }

//       setExpandedFolders(newExpanded);
//     },
//     [expandedFolders, fileTree, getFiles, socket]
//   );

//   const handleFileClick = useCallback(
//     (filePath, fileName) => {
//       const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
//       setCurrentFilePath(fullPath);
//     },
//     [setCurrentFilePath]
//   );

//   // Listen for refresh events
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("file-explorer:refresh", handleRefreshFileExplorer);

//     return () => {
//       socket.off("file-explorer:refresh", handleRefreshFileExplorer);
//     };
//   }, [socket, handleRefreshFileExplorer]);

//   // Recursive render function
//   const renderFileTree = useCallback(
//     (path = "", level = 0) => {
//       const entries = fileTree.get(path) || [];

//       return entries.map((entry) => {
//         const fullPath = path ? `${path}/${entry.name}` : entry.name;
//         const isExpanded = expandedFolders.has(fullPath);

//         return (
//           <div key={fullPath} style={{ marginLeft: `${level * 10}px` }}>
//             {entry.type === "directory" ? (
//               <div>
//                 <div
//                   onClick={() => handleFolderClick(path, entry.name)}
//                   style={{
//                     cursor: "pointer",
//                     padding: "2px",
//                     backgroundColor: isExpanded ? "#222" : "transparent",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "5px",
//                   }}
//                 >
//                   <span>{isExpanded ? "📂" : "📁"}</span>
//                   <span>{entry.name}</span>
//                   {getFilesLoading && isExpanded && <span>⏳</span>}
//                 </div>
//                 {isExpanded && renderFileTree(fullPath, level + 1)}
//               </div>
//             ) : (
//               <div
//                 onClick={() => handleFileClick(path, entry.name)}
//                 style={{
//                   cursor: "pointer",
//                   padding: "5px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "5px",
//                 }}
//               >
//                 <span>📄</span>
//                 <span>{entry.name}</span>
//                 {getFileContentLoading && <span>⏳</span>}
//               </div>
//             )}
//           </div>
//         );
//       });
//     },
//     [expandedFolders, fileTree, handleFileClick, handleFolderClick, getFilesLoading, getFileContentLoading]
//   );

//   if (getFilesError) {
//     return (
//       <div style={{ color: "red", padding: "10px" }}>
//         Error: {getFilesError}
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         flex: 1,
//         overflow: "auto",
//         fontFamily: "Arial, sans-serif",
//         padding: "8px",
//       }}
//     >
//       {getFilesLoading && !fileTree.size && <div>Loading files...</div>}

//       <div
//         style={{
//           padding: "10px",
//           height: "100%",
//           width: "100%",
//           backgroundColor: "rgba(50, 50, 50, 1)",
//         }}
//       >
//         {renderFileTree()}
//       </div>
//     </div>
//   );
// }
