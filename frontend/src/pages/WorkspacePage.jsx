import { useParams } from "react-router-dom";
import TerminalComponent from "../components/Terminal";
import FileExplorer from "../components/FileExplorer";

const WorkspacePage = () => {
  const { id } = useParams();

  return (
    <>
      <div>WorkspacePage</div>
      <FileExplorer />
      <TerminalComponent/>
    </>
  );
};

export default WorkspacePage;