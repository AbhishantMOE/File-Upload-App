import axios from "axios";

class UploadService {
  constructor() {
    this.baseUrl =
      "https://h2z51kyitd.execute-api.ap-south-1.amazonaws.com/stage";
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 300000, // 5 minutes timeout
    });
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:mime;base64, prefix
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files,
    folder = "intercom-uploads/",
    onProgress = null
  ) {
    try {
      const filesData = [];
      let totalSize = 0;

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (onProgress) {
          onProgress({
            stage: "processing",
            current: i + 1,
            total: files.length,
            currentFile: file.name,
          });
        }

        const fileContent = await this.fileToBase64(file);
        totalSize += file.size;

        filesData.push({
          filename: file.name,
          file_content: fileContent,
          size: file.size,
          type: file.type,
        });
      }

      if (onProgress) {
        onProgress({
          stage: "uploading",
          current: files.length,
          total: files.length,
          totalSize: totalSize,
        });
      }

      const payload = {
        files: filesData,
        folder: folder,
        presigned_expiration: 3600,
      };

      const response = await this.axios.post("/upload/multiple", payload);

      if (response.status === 200 && response.data.success) {
        const results = response.data.results || [];
        const successful = results.filter((r) => r.success).length;
        const failed = results.length - successful;

        return {
          success: true,
          results: results,
          summary: {
            total: results.length,
            successful: successful,
            failed: failed,
            totalSize: totalSize,
            successRate:
              results.length > 0 ? (successful / results.length) * 100 : 0,
          },
        };
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
        results: [],
      };
    }
  }

  // Validate files before upload
  validateFiles(files, maxSize = 10 * 1024 * 1024, allowedTypes = null) {
    const errors = [];
    const validFiles = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(
          `${file.name}: File too large (max ${this.formatFileSize(maxSize)})`
        );
        return;
      }

      // Check file type if specified
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  }
}

export const uploadService = new UploadService();
