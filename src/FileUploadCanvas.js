import React, { useState, useRef, useEffect } from 'react';
import './FileUploadCanvas.css';

const FileUploadCanvas = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '', visible: false });
  const [isDragOver, setIsDragOver] = useState(false);
  const [folder, setFolder] = useState('intercom-uploads/');
  
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    // Initialize Intercom Canvas SDK when component mounts
    if (window.Intercom) {
      window.Intercom('onShow', () => {
        console.log('Canvas opened');
      });
    }
  }, []);

  const handleFileSelection = (files) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setStatus({ type: '', message: '', visible: false });
  };

  const handleFileInputChange = (event) => {
    handleFileSelection(event.target.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelection(event.dataTransfer.files);
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setStatus({ type: '', message: '', visible: false });

    try {
      // Prepare files data
      const filesData = [];
      let totalSize = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const base64Content = await fileToBase64(file);
        totalSize += file.size;
        
        filesData.push({
          filename: file.name,
          file_content: base64Content
        });

        // Update progress for file processing
        setUploadProgress((i + 1) / selectedFiles.length * 50);
      }

      const payload = {
        files: filesData,
        folder: folder,
        presigned_expiration: 3600
      };

      // Make API call
      const response = await fetch('https://h2z51kyitd.execute-api.ap-south-1.amazonaws.com/stage/upload/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          const results = result.results || [];
          const successful = results.filter(r => r.success).length;
          const failed = results.length - successful;
          
          // Get download URLs for successful uploads
          const downloadUrls = results
            .filter(r => r.success && r.data)
            .map(r => ({
              filename: r.data.filename,
              download_url: r.data.download_url,
              file_size: r.data.file_size
            }));

          setStatus({
            type: 'success',
            message: `Upload completed! Success: ${successful}, Failed: ${failed}`,
            visible: true,
            details: downloadUrls
          });

          // Send results back to Intercom conversation
          if (window.Intercom && downloadUrls.length > 0) {
            const filesText = downloadUrls.map(file => 
              `📎 ${file.filename} (${formatFileSize(file.file_size)})\n${file.download_url}`
            ).join('\n\n');
            
            // You can customize this message format as needed
            window.Intercom('trackEvent', 'files-uploaded', {
              file_count: successful,
              total_size: totalSize,
              files: filesText
            });
          }

          // Clear selected files after successful upload
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

        } else {
          setStatus({
            type: 'error',
            message: `Upload failed: ${result.error || 'Unknown error'}`,
            visible: true
          });
        }
      } else {
        const errorText = await response.text();
        setStatus({
          type: 'error',
          message: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
          visible: true
        });
      }

    } catch (error) {
      setStatus({
        type: 'error',
        message: `Error: ${error.message}`,
        visible: true
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-container">
      <div className="header">
        <h2>📎 Upload Files</h2>
        <div className="folder-input">
          <label htmlFor="folder">Folder:</label>
          <input
            id="folder"
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="folder-name/"
            disabled={isUploading}
          />
        </div>
      </div>
      
      <div 
        ref={dropAreaRef}
        className={`upload-area ${isDragOver ? 'dragover' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="*/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p className="upload-text">Click to select files or drag and drop</p>
          <p className="upload-subtext">Multiple files supported</p>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="file-list">
          <h3>Selected Files ({selectedFiles.length})</h3>
          {selectedFiles.map((file, index) => (