import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useFileStore } from "../store/fileStore";
import { useProjectStore } from "../store/projectStore";

import WorkspacePage from "../pages/WorkspacePage";
import LoadingComponent from "./Loading";

const InitComponent = () => {
  const { id: projectId } = useParams();

  const initFiles = useFileStore((s) => s.initFiles);
  const initTabs = useFileStore((s) => s.initTabs);
  const setEC2Ip = useFileStore((s) => s.setEC2Ip);

  const getProject = useProjectStore((s) => s.getProject);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const initialization = async () => {
      const { project, ec2_ip } = await getProject(projectId);
      
      setEC2Ip(ec2_ip);

      const { tabList, activeTab } = project.metadata.tabs;
      initTabs(tabList, activeTab);

      await initFiles();

      setFetching(false);
    };

    initialization();
  }, []);

  if(fetching) {
    return <LoadingComponent />;
  }

  return <WorkspacePage />;
};

export default InitComponent;