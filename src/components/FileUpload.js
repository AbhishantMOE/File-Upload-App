import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import FilePreview from "./FilePreview";
import UploadProgress from "./UploadProgress";
import { uploadService } from "../services/uploadService";
import { intercomService } from "../services/intercomService";

const FileUpload = ({ isIntercomReady, currentUser }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    // Validate files
    const { validFiles, errors } = uploadService.validateFiles(
      acceptedFiles,
      50 * 1024 * 1024, // 50MB max
      [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ] // Allowed types
    );

    if (errors.length > 0) {
      alert("Some files were rejected:\n" + errors.join("\n"));
    }

    if (validFiles.length > 0) {
      // Add new files to existing ones
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setUploadResults(null);

      // Track file selection
      intercomService.trackFileUpload("files-selected", {
        count: validFiles.length,
        totalSize: validFiles.reduce((sum, file) => sum + file.size, 0),
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ stage: "starting", current: 0, total: files.length });
    setUploadResults(null);

    // Track upload start
    intercomService.trackFileUpload("upload-started", {
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    });

    try {
      const folder = `intercom-uploads/${
        currentUser?.id || "anonymous"
      }/${Date.now()}/`;

      const result = await uploadService.uploadMultipleFiles(
        files,
        folder,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResults(result);

      if (result.success) {
        // Send success message to Intercom
        const message = `Successfully uploaded ${
          result.summary.successful
        } out of ${
          result.summary.total
        } files. Total size: ${uploadService.formatFileSize(
          result.summary.totalSize
        )}`;
        intercomService.sendMessage(message, {
          uploadResults: result.summary,
        });

        // Track successful upload
        intercomService.trackFileUpload("upload-completed", result.summary);

        // Clear files after successful upload
        setFiles([]);
      } else {
        // Send error message to Intercom
        intercomService.sendMessage(`Upload failed: ${result.error}`, {
          error: result.error,
        });

        // Track failed upload
        intercomService.trackFileUpload("upload-failed", {
          error: result.error,
          fileCount: files.length,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResults({
        success: false,
        error: error.message,
        results: [],
      });

      // Send error message to Intercom
      intercomService.sendMessage(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadResults(null);
  };

  return (
    <div className="file-upload-container">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""} ${
          uploading ? "disabled" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <div>
              <p>Drag & drop files here, or click to select files</p>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Supported: Images, PDF, Documents (Max 50MB each)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <FilePreview
          files={files}
          onRemove={removeFile}
          uploading={uploading}
        />
      )}

      {/* Upload Progress */}
      {uploadProgress && <UploadProgress progress={uploadProgress} />}

      {/* Upload Results */}
      {uploadResults && (
        <div
          className={`upload-results ${
            uploadResults.success ? "success" : "error"
          }`}
        >
          <h3>Upload Results</h3>
          {uploadResults.success ? (
            <div>
              <p>
                ✅ Successfully uploaded {uploadResults.summary.successful} out
                of {uploadResults.summary.total} files
              </p>
              <p>
                Total size:{" "}
                {uploadService.formatFileSize(uploadResults.summary.totalSize)}
              </p>
              <p>
                Success rate: {uploadResults.summary.successRate.toFixed(1)}%
              </p>

              {uploadResults.results.map((result, index) => (
                <div key={index} className="result-item">
                  <span
                    className={
                      result.success ? "result-success" : "result-error"
                    }
                  >
                    {result.success ? "✅" : "❌"}{" "}
                    {result.filename || `File ${index + 1}`}
                  </span>
                  {result.error && <small> - {result.error}</small>}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p>❌ Upload failed: {uploadResults.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading
            ? "Uploading..."
            : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
        </button>

        {files.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={clearFiles}
            disabled={uploading}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Intercom Status */}
      {!isIntercomReady && (
        <div style={{ marginTop: "20px", textAlign: "center", color: "#666" }}>
          <small>Connecting to support system...</small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
