import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import BashComponent from "./bash";
import BashIcon from "../assets/bash.png";

export default function Bash({ socket }) {
  const [terminals, setTerminals] = useState([{ id: Date.now(), name: "bash" }]);
  const [selectedTerminalId, setSelectedTerminalId] = useState(terminals[0]?.id);

  const createTerminal = () => {
    const newTerminalId = Date.now();
    setTerminals((prev) => [...prev, { id: newTerminalId, name: "bash" }]);
    setSelectedTerminalId(newTerminalId);
  };

  const closeTerminal = (terminalId, e) => {
    e.stopPropagation();
    
    setTerminals((prev) => {
      const filtered = prev.filter(t => t.id !== terminalId);
      
      // If closing the selected terminal, switch to another
      if (selectedTerminalId === terminalId && filtered.length > 0) {
        setSelectedTerminalId(filtered[filtered.length - 1].id);
      }
      
      // Emit socket event to kill the terminal process
      socket.emit("terminal:close", { terminalId });
      
      return filtered;
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={80} minSize={20} maxSize={90} className="sidebar-panel">
          {terminals.length === 0 ? <h1><b>BASH</b></h1> :
          terminals.map(terminal => (
            <div 
            key={terminal.id} 
              style={{ 
                display: terminal.id === selectedTerminalId ? 'block' : 'none',
                height: '100%'
              }}
              >
              <BashComponent 
                socket={socket} 
                terminalId={terminal.id}
                />
            </div>
          ))
          }
        </Panel>
        
        <PanelResizeHandle className="resize-handle horizontal" />

        <Panel defaultSize={20} minSize={10} maxSize={80} className="sidebar-panel">
          <div className="panel-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div 
              className="panel-header" 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={BashIcon} alt="bash-icon" style={{ width: '16px', height: '16px' }}/> 
                Bash
              </h3>
              <button
                onClick={createTerminal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#505050';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ccc';
                }}
                title="New Terminal"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            
            {/* Terminal List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {terminals.map((terminal, index) => (
                <div
                  key={terminal.id}
                  onClick={() => setSelectedTerminalId(terminal.id)}
                  style={{
                    padding: '1px 10px',
                    cursor: 'pointer',
                    backgroundColor: terminal.id === selectedTerminalId ? '#4D4D4D' : 'transparent',
                    color: terminal.id === selectedTerminalId ? 'rgba(220, 220, 220, 1)' : 'transparent',
                    borderLeft: terminal.id === selectedTerminalId ? '2px solid #ffffffff' : '2px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: "smaller",
                    // color: '#d3d3d3ff',
                  }}
                  onMouseEnter={(e) => {
                    if (terminal.id !== selectedTerminalId) {
                      e.currentTarget.style.backgroundColor = '#2a2d2e';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (terminal.id !== selectedTerminalId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{color: terminal.id === selectedTerminalId ? 'rgba(230, 230, 230, 1)' : 'rgba(180, 180, 180, 1)'}}>
                    <i className="fa-solid fa-terminal" style={{ marginRight: '8px', fontSize: "smaller" }}></i>
                    {terminal.name}@{index + 1}
                  </span>
                  <button
                    onClick={(e) => closeTerminal(terminal.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(180, 180, 180, 1)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      fontSize: '12px',
                      borderRadius: '3px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#505050';
                      e.currentTarget.style.color = 'rgba(230, 230, 230, 1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(180, 180, 180, 1)';
                    }}
                    title="Kill Terminal"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </PanelGroup>
   </div>
  );
}