import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function TerminalComponent({ socket }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !socket) return;

    const terminal = new Terminal({ cursorBlink: true, convertEol: true });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    // Handle data from server
    const handleRead = (data) => terminal.write(data);

    // Listen for data and connection errors
    socket.on("terminal:read", handleRead);

    // Send user input to server
    terminal.onData((data) => socket.emit("terminal:write", data));

    // Resize handler
    const handleResize = () => {
      fitAddon.fit();
      socket.emit("resize", { cols: terminal.cols, rows: terminal.rows });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial emit

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("terminal:read", handleRead);
      terminal.dispose();
    };
  }, [socket]);

  return (
    <div style={{ flex: 1, backgroundColor: "#000", padding: 0 }}>
      <div
        ref={containerRef}
        id="xterm-container"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}
