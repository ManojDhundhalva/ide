import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProjectStore } from "../store/projectStore";
import { useLogout } from "../hooks/useLogout";

import { CircularProgress, Chip } from "@mui/material";
import DefaultProfileImg from "../assets/default-avatar-profile-icon.jpg" 

const HomePage = () => {
  const navigate = useNavigate();
  const logOut = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const getAllProjects = useProjectStore((s) => s.getAllProjects);
  const createProject = useProjectStore((s) => s.createProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const createProjectLoading = useProjectStore((s) => s.createProjectLoading);

  useEffect(() => {
    getAllProjects();
  }, [getAllProjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const nameA = a.projectName?.toLowerCase() || "";
    const nameB = b.projectName?.toLowerCase() || "";
    return sortAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject({ 
      projectName: newProjectName,
      description: newProjectDescription 
    });
    setNewProjectName("");
    setNewProjectDescription("");
    setShowCreateModal(false);
    await getAllProjects();
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (confirm("Delete this project?")) {
      await deleteProject(projectId);
      await getAllProjects();
    }
  }

  const handleProjectClick = (projectId) => {
    navigate(`/${projectId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (let key in intervals) {
      const value = Math.floor(seconds / intervals[key]);
      if (value >= 1) {
        return `${value} ${key}${value > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    logOut();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1e1e1e", color: "#d4d4d4", fontFamily: "Quicksand" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#252526",
        borderBottom: "1px solid #3e3e42",
        padding: "4px 16px",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#ffffffff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className="fa-solid fa-code" style={{ color: "#252526" }}></i>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#ffffffff" }}>IDE</h1>
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: "400px", minWidth: "200px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search (ctrl+/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  border: "1px solid #3e3e42",
                  borderRadius: "20px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#3c3c3c",
                  color: "#e2e2e2ff",
                  fontFamily: "Quicksand"
                }}
                onFocus={(e) => e.target.style.borderColor = "#ffffffff"}
                onBlur={(e) => e.target.style.borderColor = "#3e3e42"}
              />
              <svg
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "18px",
                  height: "18px",
                  color: "#e2e2e2ff",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => e.target.src = DefaultProfileImg}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#3e3e42",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: "16px", fontWeight: "500", color: "#cccccc" }}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                backgroundColor: "#252526",
                border: "1px solid #3e3e42",
                borderRadius: "4px",
                minWidth: "200px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
              }}>
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #3e3e42",
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#cccccc", marginBottom: "4px" }}>
                    {user.name || "User"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#858585" }}>
                    {user.email || ""}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#cccccc",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "Quicksand",
                    fontWeight: "bold"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a2d2e"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px", color: "#dcdcdcff" }}>
            Create Workspace
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: "100%",
              maxWidth: "256px",
              height: "200px",
              border: "2px dashed #3e3e42",
              borderRadius: "8px",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007acc";
              e.currentTarget.style.backgroundColor = "#264f78";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3e3e42";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              style={{ width: "64px", height: "64px", color: "#858585" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Projects Table - Desktop */}
        <div style={{
          backgroundColor: "#252526",
          borderRadius: "8px",
          border: "1px solid #3e3e42",
          overflow: "hidden",
          display: window.innerWidth > 768 ? "block" : "none",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead style={{ backgroundColor: "#2d2d30", borderBottom: "1px solid #3e3e42" }}>
                <tr>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "14px", color: "#cccccc", whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Project name
                  </th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "14px", color: "#cccccc", whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Created On
                  </th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "14px", color: "#cccccc", whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Last opened
                  </th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "14px", color: "#cccccc", fontWeight: "bold" }}>
                    <button
                      onClick={() => setSortAscending(!sortAscending)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#cccccc",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {sortAscending ? "A-Z" : "Z-A"}
                      <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortAscending ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "48px 24px", textAlign: "center", color: "#858585" }}>
                      No projects found. Create your first workspace to get started!
                    </td>
                  </tr>
                ) : (
                  sortedProjects.map((project) => (
                    <tr
                      key={project._id}
                      onClick={() => handleProjectClick(project._id)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid #3e3e42",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a2d2e"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#dfdfdfff", whiteSpace: "nowrap" }}>
                        <Chip size="small" sx={{bgcolor:"white"}} label={project.projectName} />
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#dfdfdfff", whiteSpace: "nowrap" }}>
                        {formatDate(project.createdAt)}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#dfdfdfff", whiteSpace: "nowrap" }}>
                        {formatDate(project.updatedAt)}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <button
                          onClick={(e) => handleDeleteProject(e, project._id)}
                          style={{
                            padding: "8px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#932222ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <svg style={{ width: "16px", height: "16px", color: "#dfdfdfff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div
          style={{
            fontFamily: "Quicksand",
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              fontFamily: "Quicksand",
              backgroundColor: "#252526",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid #3e3e42",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "#dcdcdcff" }}>
              Create New Workspace
            </h3>
            <input
              type="text"
              placeholder="Workspace name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #3e3e42",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "12px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#3c3c3c",
                color: "#f2f2f2ff",
                fontFamily: "Quicksand",
                fontWeight: "bold"
              }}
              onFocus={(e) => e.target.style.borderColor = "#ffffffff"}
              onBlur={(e) => e.target.style.borderColor = "#3e3e42"}
              autoFocus
            />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #3e3e42",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#cccccc",
                  fontFamily: "Quicksand",
                  fontWeight: "bold"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a2d2e"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || createProjectLoading}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor: !newProjectName.trim() || createProjectLoading ? "grey" : "#dfdfdfff",
                  color: "black",
                  cursor: !newProjectName.trim() || createProjectLoading ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "Quicksand",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                onMouseEnter={(e) => {
                  if (newProjectName.trim() && !createProjectLoading) {
                    e.currentTarget.style.backgroundColor = "grey";
                  }
                }}
                onMouseLeave={(e) => {
                  if (newProjectName.trim() && !createProjectLoading) {
                    e.currentTarget.style.backgroundColor = "#dfdfdfff";
                  }
                }}
              >
                <div>
                {createProjectLoading ? "Creating..." : "Create"}
                </div>
                {createProjectLoading &&
                <CircularProgress
                  size={12}
                  thickness={6}
                  sx={{
                    marginLeft: "6px",
                    color: "black",
                    '& circle': { strokeLinecap: 'round' },
                  }}
                  />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;