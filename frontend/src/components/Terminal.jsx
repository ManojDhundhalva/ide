import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function TerminalComponent({ socket }) {
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !socket) return;

    const terminal = new Terminal({ 
      fontFamily: '"Ubuntu Mono"', 
      cursorBlink: true, 
      convertEol: true 
    });
    const fitAddon = new FitAddon();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    // Wait for the next frame to ensure container is fully rendered
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn("Initial fit failed, retrying...", e);
        // Retry after a short delay if first attempt fails
        setTimeout(() => {
          try {
            fitAddon.fit();
          } catch (err) {
            console.error("Fit failed:", err);
          }
        }, 100);
      }
    });

    // Handle data from server
    const handleRead = (data) => terminal.write(data);

    // Listen for data and connection errors
    socket.on("terminal:read", handleRead);

    // Send user input to server
    terminal.onData((data) => socket.emit("terminal:write", data));

    // Resize handler with safety check
    const handleResize = () => {
      if (!fitAddonRef.current || !terminalRef.current) return;
      
      try {
        fitAddonRef.current.fit();
        socket.emit("resize", { 
          cols: terminalRef.current.cols, 
          rows: terminalRef.current.rows 
        });
      } catch (e) {
        console.warn("Resize fit failed:", e);
      }
    };

    // Use ResizeObserver for more accurate container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    
    // Initial resize after a small delay
    setTimeout(handleResize, 50);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      socket.off("terminal:read", handleRead);
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [socket]);

  return (
    <div
      ref={containerRef}
      id="xterm-container"
      style={{ backgroundColor: "#000", width: "100%", height: "100%" }}
    />
  );
}