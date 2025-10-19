import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TerminalComponent from "../components/Terminal";
import FileExplorerComponent from "../components/FileExplorer";
import CodeEditorComponent from "../components/CodeEditor";
import "../css/WorkspacePage.css";
import { useSocket } from "../hooks/useSocket";
import { useFileStore } from "../store/fileStore";

const WorkspacePage = () => {
  const { id } = useParams();
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const currentFilePath = useFileStore((s) => s.currentFilePath);

  const breadcrumbPath = currentFilePath ? currentFilePath.split('/').join(' / ') : '';

  const socket = useSocket();

  return (
    <div className="workspace-container">
      <PanelGroup direction="horizontal" className="main-panel-group">
        {/* File Explorer Sidebar */}
        <Panel 
          defaultSize={20} 
          minSize={15} 
          maxSize={80}
          className="sidebar-panel"
        >
          <div className="panel-content">
            <div className="panel-header">
              <h3>Explorer</h3>
            </div>
            <FileExplorerComponent />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle horizontal" />

        {/* Main Content Area */}
        <Panel className="main-content-panel">
          <PanelGroup direction="vertical">
            {/* Code Editor Area */}
            <Panel defaultSize={70} minSize={30} className="editor-panel">
              <div className="panel-content">
                <div className="panel-header">
                  <h3>Editor {getFileContentLoading ? "Loading..." : ""}
                    {breadcrumbPath && 
                    <span style={{ fontSize: '0.8rem', marginLeft: 10, color: '#aaa' }}>
                      ({breadcrumbPath})
                    </span>
                  }
                  </h3>
                </div>
                <CodeEditorComponent />
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle vertical" />

            {/* Terminal Area */}
            <Panel 
              defaultSize={30} 
              minSize={20} 
              maxSize={100}
              className="terminal-panel"
            >
              <div className="panel-content">
                <div className="panel-header">
                  <h3>Terminal</h3>
                </div>
                <TerminalComponent socket={socket} />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default WorkspacePage;