// =====================================================
// FILE HELPER UTILITIES
// Handles Image Compression, PDF Base64 Reading, and Safe Previews
// =====================================================

const API_BASE_URL = "";

/**
 * Format relative photo/document URLs into full URL or data URI
 */
export const formatFileUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  const trimmed = fileUrl.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Compress image file to clean JPEG data URI
 */
export const compressImageFile = (
  file,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85
) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      resolve(null);
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Selected file is not a valid image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image for processing."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Read PDF file and convert to Base64 data URL
 */
export const readPdfAsBase64 = (file, maxSizeBytes = 15 * 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      resolve(null);
      return;
    }

    if (file.type && file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
      reject(new Error("Please upload a valid PDF document."));
      return;
    }

    if (file.size > maxSizeBytes) {
      reject(new Error(`PDF file size cannot exceed ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read PDF document."));
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Open PDF file in a new browser tab
 */
export const openPdfInNewTab = (pdfUrl, documentTitle = "Education Document PDF") => {
  if (!pdfUrl) {
    alert("No PDF document available to view.");
    return;
  }

  const cleanUrl = formatFileUrl(pdfUrl);

  try {
    if (cleanUrl.startsWith("data:application/pdf;base64,")) {
      const base64Data = cleanUrl.split(",")[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const win = window.open(blobUrl, "_blank");
      if (!win) {
        window.location.href = blobUrl;
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    const win = window.open(cleanUrl, "_blank");
    if (!win) {
      window.location.href = cleanUrl;
    }
  } catch (err) {
    console.warn("Direct blob open failed, falling back to window.open", err);
    window.open(cleanUrl, "_blank");
  }
};

/**
 * Open photo in a new browser tab or popup
 */
export const openPhotoInNewTab = (photoUrl, title = "Photo Preview") => {
  if (!photoUrl) {
    alert("No photo available to preview.");
    return;
  }
  const cleanUrl = formatFileUrl(photoUrl);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #0f172a;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .preview-card {
              background: #ffffff;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              max-width: 90vw;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            img {
              max-width: 100%;
              max-height: 80vh;
              object-fit: contain;
              border-radius: 8px;
            }
            h4 {
              margin: 12px 0 4px;
              color: #1e293b;
            }
          </style>
        </head>
        <body>
          <div class="preview-card">
            <img src="${cleanUrl}" alt="${title}" />
            <h4>${title}</h4>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  } else {
    window.open(cleanUrl, "_blank");
  }
};

