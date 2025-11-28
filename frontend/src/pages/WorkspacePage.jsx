import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useSocket } from "../hooks/useSocket";

import TerminalComponent from "../components/Terminal";
import FileExplorerComponent from "../components/FileExplorer";
import CodeEditorComponent from "../components/CodeEditor";
import TabsComponent from "../components/Tabs";

import "../css/WorkspacePage.css";
import { useEffect } from "react";

const WorkspacePage = () => {

  const socket = useSocket();
  
  useEffect(() => {
    if(!socket) return;

    socket.on("project-id", (data)=>{
      console.log("data", data);
    });

    return () => {
      socket.off("project-id");
    };
  }, [socket]);
  
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