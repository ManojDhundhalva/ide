import { useState } from 'react';
import { useFileStore } from '../store/fileStore';
import { getFileIcon } from "../utils/language";

export default function TabsComponent({ socket }) {
  const tabs = useFileStore((s) => s.tabs);
  const activeTab = useFileStore((s) => s.activeTab);
  const setActiveTab = useFileStore((s) => s.setActiveTab);
  const closeTab = useFileStore((s) => s.closeTab);
  const reorderTabs = useFileStore((s) => s.reorderTabs);
  const fileExistsInDirectory = useFileStore((s) => s.fileExistsInDirectory);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleTabClick = (filePath) => {
    setActiveTab(filePath, socket);
  };

  const handleTabClose = (filePath, e) => {
    e.stopPropagation();
    closeTab(filePath, socket);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderTabs(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#2d2d2d',
      borderBottom: '1px solid #3e3e3e',
      overflowX: 'auto'
    }}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.filePath;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        if(!fileExistsInDirectory(tab.filePath)) return null;
        
        return (
          <div
            key={tab.filePath}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => handleTabClick(tab.filePath)}
            style={{
              display: 'flex',
              justifyContent: "space-between",
              alignItems: 'center',
              padding: '6px 10px',
              backgroundColor: isActive ? '#1e1e1e' : '#2d2d2d',
              borderRight: '1px solid #3e3e3e',
              borderLeft: isDragOver ? '2px solid #007acc' : 'none',
              cursor: isDragging ? 'grabbing' : 'pointer',
              minWidth: '120px',
              maxWidth: '200px',
              fontSize: '13px',
              color: isActive ? '#fff' : '#ccc',
              userSelect: 'none',
              opacity: isDragging ? 0.5 : 1,
              transition: 'background-color 0.2s, opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isActive && !isDragging) {
                e.currentTarget.style.backgroundColor = '#383838';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isDragging) {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
              }
            }}
          >
            <div style={{display:"flex", justifyContent: "flex-start", alignItems:"center"}}>
              <div style={{ width: "14px", justifyContent: "center", alignItems: "center" }}>
                {(() => {
                    const { icon, color } = getFileIcon(tab.title);
                    return <i className={`${icon} fa-sm`} style={{ color, fontSize: "smaller"}}></i>;
                })()}
              </div>
              <span
                style={{
                  fontSize: "smaller",
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginLeft: '6px'
                }}
                title={tab.filePath}
              >
                {tab.title}
              </span>
            </div>
            <button
              onClick={(e) => handleTabClose(tab.filePath, e)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ccc',
                cursor: 'pointer',
                borderRadius: '3px',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: "smaller",
                marginLeft: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#505050';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ccc';
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}