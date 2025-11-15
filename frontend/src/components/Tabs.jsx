import { useFileStore } from '../store/fileStore';

export default function TabsComponent({ socket }) {
  const tabs = useFileStore((s) => s.tabs);
  const activeTab = useFileStore((s) => s.activeTab);
  const setActiveTab = useFileStore((s) => s.setActiveTab);
  const closeTab = useFileStore((s) => s.closeTab);
  const fileExistsInDirectory = useFileStore((s) => s.fileExistsInDirectory);

  const handleTabClick = (filePath) => {
    setActiveTab(filePath, socket);
  };

  const handleTabClose = (filePath, e) => {
    e.stopPropagation();
    closeTab(filePath, socket);
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
      {tabs.map((tab) => {
        const isActive = activeTab === tab.filePath;

        if(!fileExistsInDirectory(tab.filePath)) return null;
        
        return (
          <div
            key={tab.filePath}
            onClick={() => handleTabClick(tab.filePath)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: isActive ? '#1e1e1e' : '#2d2d2d',
              borderRight: '1px solid #3e3e3e',
              cursor: 'pointer',
              minWidth: '120px',
              maxWidth: '200px',
              fontSize: '13px',
              color: isActive ? '#fff' : '#ccc',
              userSelect: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#383838';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
              }
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: '8px'
              }}
              title={tab.filePath}
            >
              {tab.title}
            </span>
            
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
                fontSize: '12px'
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