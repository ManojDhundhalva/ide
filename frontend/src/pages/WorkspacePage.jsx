import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useSocket } from "../hooks/useSocket";

import { useFileStore } from "../store/fileStore";
import { useProjectStore } from "../store/projectStore";

import TerminalComponent from "../components/Terminal";
import FileExplorerComponent from "../components/FileExplorer";
import CodeEditorComponent from "../components/CodeEditor";

import "../css/WorkspacePage.css";

const WorkspacePage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const currentFilePath = useFileStore((s) => s.currentFilePath);
  const getFileContentLoading = useFileStore((s) => s.getFileContentLoading);
  const getProject = useProjectStore((s) => s.getProject);
  
  const socket = useSocket({ projectId });

  const [project, setProject] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
        const data = await getProject(projectId);

        if(!data) navigate("/");

        setProject((prev) => ({
          projectId: data._id ?? null,
          projectName: data.projectName ?? null,
          description: data.description ?? null,
          updatedAt: data.updatedAt ?? null,
          createdAt: data.createdAt ?? null,
          metadata: data.metadata ?? null
        }));
    };

    fetchProject();

  }, [getProject, projectId]);

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
            <FileExplorerComponent socket={socket} project={project}/>
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
                    {currentFilePath && 
                    <span style={{ fontSize: '0.8rem', marginLeft: 10, color: '#aaa' }}>
                      ({currentFilePath})
                    </span>}
                  </h3>
                </div>
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