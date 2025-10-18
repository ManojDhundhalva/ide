import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import config from "../config"

const SOCKET_URL = config.SOCKET_URL;

export default function TerminalComponent() {
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById("xterm-container"));
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // connect socket
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    // on pty output
    socket.on("terminal:read", (data) => {
      term.write(data);
    });

    // on connect error
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      term.writeln(`\r\nError: ${err.message}`);
    });

    // Send user input to server
    term.onData(data => {
      socket.emit("terminal:write", data);
    });

    // handle window resize
    const handleResize = () => {
      fitAddon.fit();
      socket.emit("resize", { cols: term.cols, rows: term.rows });
    };
    window.addEventListener("resize", handleResize);
    // initial resize
    socket.emit("resize", { cols: term.cols, rows: term.rows });

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.disconnect();
      term.dispose();
    };
  }, []);

  return <div id="xterm-container" style={{ width: "100%", height: "400px", background: "#000" }} />;
}
