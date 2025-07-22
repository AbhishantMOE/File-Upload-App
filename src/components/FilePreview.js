import React from "react";
import { uploadService } from "../services/uploadService";

const FilePreview = ({ files, onRemove, uploading }) => {
  if (files.length === 0) return null;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="file-preview">
      <h3>Selected Files ({files.length})</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
        Total size: {uploadService.formatFileSize(totalSize)}
      </p>

      {files.map((file, index) => (
        <div key={index} className="file-item">
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">
              {uploadService.formatFileSize(file.size)} •{" "}
              {file.type || "Unknown type"}
            </div>
          </div>
          <div className="file-actions">
            <button
              className="btn btn-danger"
              onClick={() => onRemove(index)}
              disabled={uploading}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
