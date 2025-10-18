import { useParams } from "react-router-dom";
import TerminalComponent from "../components/Terminal";
import FileExplorerComponent from "../components/FileExplorer";
import CodeEditorComponent from "../components/CodeEditor";

const WorkspacePage = () => {
  const { id } = useParams();

  return (
    <>
      <div>WorkspacePage</div>
      <CodeEditorComponent />
      <FileExplorerComponent />
      <TerminalComponent/>
    </>
  );
};

export default WorkspacePage;