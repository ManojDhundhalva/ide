import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useSocket } from "../hooks/useSocket";

import TerminalComponent from "../components/Terminal";
import FileExplorerComponent from "../components/FileExplorer";
import CodeEditorComponent from "../components/CodeEditor";
import TabsComponent from "../components/Tabs";

import { useFileStore } from "../store/fileStore";
import { useProjectStore } from "../store/projectStore";

import "../css/WorkspacePage.css";

const WorkspacePage = () => {
  const { id: projectId } = useParams();

  const socket = useSocket({ projectId });

  const initTabs = useFileStore((s) => s.initTabs);

  const project = useProjectStore((s) => s.project);
  const getProject = useProjectStore((s) => s.getProject);

  useEffect(() => {
    const fetchProject = async () => {
      const project = await getProject(projectId);
      const { tabList, activeTab } = project.metadata.tabs;
      initTabs(tabList, activeTab);
    };

    fetchProject();
  }, []);

  if(!project) {
    return <h1>Loading...</h1>
  }

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
            <FileExplorerComponent socket={socket}/>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle horizontal" />

        {/* Main Content Area */}
        <Panel className="main-content-panel">
          <PanelGroup direction="vertical">
            <TabsComponent socket={socket}/>

            {/* Code Editor Area */}
            <Panel defaultSize={70} minSize={30} className="editor-panel">
              <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                <CodeEditorComponent />
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle vertical" />

            {/* Terminal Area */}
            <Panel 
              defaultSize={30} 
              minSize={10} 
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