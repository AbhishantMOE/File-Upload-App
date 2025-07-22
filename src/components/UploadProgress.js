import React from "react";

const UploadProgress = ({ progress }) => {
  if (!progress) return null;

  const getProgressPercentage = () => {
    if (progress.stage === "completed") return 100;
    if (progress.stage === "uploading") return 90;
    if (progress.stage === "processing") {
      return (progress.current / progress.total) * 80;
    }
    return 10;
  };

  const getProgressText = () => {
    switch (progress.stage) {
      case "starting":
        return "Preparing upload...";
      case "processing":
        return `Processing files: ${progress.current}/${progress.total} - ${
          progress.currentFile || ""
        }`;
      case "uploading":
        return "Uploading to server...";
      case "completed":
        return "Upload completed!";
      default:
        return "Processing...";
    }
  };

  const percentage = getProgressPercentage();

  return (
    <div className="upload-progress">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="progress-text">
        {getProgressText()} ({Math.round(percentage)}%)
      </div>
    </div>
  );
};

export default UploadProgress;
