import { useEffect, useState } from "react";
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

  const initFiles = useFileStore((s) => s.initFiles);
  const initTabs = useFileStore((s) => s.initTabs);

  const project = useProjectStore((s) => s.project);
  const getProject = useProjectStore((s) => s.getProject);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const initialization = async () => {
      await initFiles();
      const project = await getProject(projectId);
      const { tabList, activeTab } = project.metadata.tabs;
      initTabs(tabList, activeTab);
      setFetching(false);
    };

    initialization();
  }, []);

  if(fetching) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="workspace-container">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={80} className="sidebar-panel">
          <div className="panel-content">
            <div className="panel-header">
              <h3>Explorer</h3>
            </div>
            <FileExplorerComponent socket={socket}/>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle horizontal" />

        <Panel className="main-content-panel">
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={20} className="editor-panel">
              <div className="editor-panel-content">
                <TabsComponent socket={socket}/>
                <div className="editor-wrapper">
                  <CodeEditorComponent />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle vertical" />

            <Panel 
              defaultSize={30} 
              minSize={10} 
              maxSize={80}
              className="terminal-panel"
            >
              <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
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