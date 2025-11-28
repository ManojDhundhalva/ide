import { useState } from 'react';
import axios from "axios";

import { useProjectStore } from "../store/projectStore";
import { useFileStore } from '../store/fileStore';

export default function UploadDialog({ open, onClose, targetPath }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const project = useProjectStore((s) => s.project);
  const ec2_ip = useFileStore((s) => s.ec2_ip);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setError(null);
    setSuccess(false);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);


    const formData = new FormData();
    
    const path = project.projectName + "/" + targetPath;
    formData.append("path", path);

    selectedFiles.forEach(file => formData.append("files", file));

    const url = `${ec2_ip}:9000/upload`;

    try {
      await axios.post(url, formData, { 
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      setSuccess(true);
      setSelectedFiles([]);

      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      setError('Failed to upload files');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      clearInterval(interval);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setError(null);
      setSuccess(false);
      setUploadProgress(0);
      onClose();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setError(null);
    setSuccess(false);
  };

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Upload Files</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            style={{...styles.closeBtn, opacity: uploading ? 0.5 : 1}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.pathInfo}>
            <span style={styles.pathLabel}>Upload to:</span>
            <span style={styles.pathValue}>{targetPath || '/'}</span>
          </div>

          {/* Alerts */}
          {error && (
            <div style={styles.alertError}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={styles.alertIcon}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.alertSuccess}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={styles.alertIcon}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Files uploaded successfully!
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div style={styles.progressContainer}>
              <p style={styles.progressText}>Uploading... {uploadProgress}%</p>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${uploadProgress}%`}} />
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            style={{
              ...styles.dropZone,
              borderColor: isDragging ? '#6ECFF8' : '#555',
              backgroundColor: isDragging ? '#454545' : '#3a3a3a',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6ECFF8" strokeWidth="2" style={styles.uploadIcon}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p style={styles.dropZoneText}>Drag & drop files here or click to browse</p>
            <p style={styles.dropZoneSubtext}>Multiple files supported</p>
          </div>

          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div style={styles.fileListContainer}>
              <p style={styles.fileListTitle}>Selected Files ({selectedFiles.length}):</p>
              <div style={styles.fileList}>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={styles.fileItem}>
                    <div style={styles.fileInfo}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#6ECFF8" style={styles.fileIcon}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6" fill="#2d2d2d"/>
                      </svg>
                      <div>
                        <p style={styles.fileName}>{file.name}</p>
                        <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      disabled={uploading}
                      style={{...styles.deleteBtn, opacity: uploading ? 0.5 : 1}}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleClose}
            disabled={uploading}
            style={{...styles.cancelBtn, opacity: uploading ? 0.5 : 1}}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            style={{
              ...styles.uploadBtn,
              opacity: uploading || selectedFiles.length === 0 ? 0.5 : 1,
              cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    backgroundColor: '#2d2d2d',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 14px',
    borderBottom: '1px solid #444',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Quicksand, sans-serif',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  pathInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#ccc',
    fontFamily: 'Quicksand, sans-serif',
  },
  pathLabel: {
    marginRight: '8px',
  },
  pathValue: {
    fontWeight: 'bold',
    backgroundColor: '#171717',
    padding: '4px 12px',
    borderRadius: '6px',
    color: '#fff',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'Quicksand, sans-serif',
  },
  alertSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'Quicksand, sans-serif',
  },
  alertIcon: {
    flexShrink: 0,
  },
  dropZone: {
    border: '2px dashed #555',
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '20px',
  },
  uploadIcon: {
    marginBottom: '16px',
  },
  dropZoneText: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#ccc',
    fontFamily: 'Quicksand, sans-serif',
  },
  dropZoneSubtext: {
    margin: 0,
    fontSize: '13px',
    color: '#999',
    fontFamily: 'Quicksand, sans-serif',
  },
  fileListContainer: {
    marginTop: '20px',
  },
  fileListTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#ccc',
    fontFamily: 'Quicksand, sans-serif',
  },
  fileList: {
    borderRadius: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  fileItem: {
    backgroundColor: '#1e1e1e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 12px',
    margin: "0px 4px",
    borderRadius: '8px',
    marginBottom: '4px',
    transition: 'background-color 0.2s',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  fileIcon: {
    flexShrink: 0,
  },
  fileName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#fff',
    fontFamily: 'Inter, Quicksand, sans-serif',
  },
  fileSize: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
    fontFamily: 'Quicksand, sans-serif',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  progressContainer: {
    marginTop: '20px',
  },
  progressText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#ccc',
    fontFamily: 'Quicksand, sans-serif',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#555',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6ECFF8',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #444',
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    fontFamily: 'Quicksand, sans-serif',
  },
  uploadBtn: {
    backgroundColor: '#007acc',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    fontFamily: 'Quicksand, sans-serif',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  .file-item:hover {
    background-color: #2a2a2a !important;
  }
`;
document.head.appendChild(styleSheet);