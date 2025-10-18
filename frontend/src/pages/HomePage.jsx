import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useProjectStore } from "../store/projectStore";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const logOut = useLogout();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);

  const projects = useProjectStore((s) => s.projects);
  const getAllProjects = useProjectStore((s) => s.getAllProjects);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  useEffect(() => {
    getAllProjects();
  }, [getAllProjects]);

  return (
    <>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {user.name || "User"}</h2>
        <button onClick={logOut} style={{ padding: "8px 16px", cursor: "pointer" }}>LogOut</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Email:</strong> {user.email || "Not available"} <br />
        <strong>User ID:</strong> {user.userId || "Not available"} <br />
        {user.image && 
          <img 
            src={user.image} 
            alt="User" 
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            decoding="async"
            style={{ width: "80px", borderRadius: "50%", marginTop: "10px" }} 
        />}
      </div>

      <h3>My Projects</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {projects.length === 0 && <p>No projects found.</p>}

        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate(`/${project._id}`)}
            style={{
              width: "200px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h4 style={{ margin: "0 0 10px 0" }}>{project.projectName}</h4>
            <p style={{ margin: 0, color: "#555" }}>{project.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default HomePage;