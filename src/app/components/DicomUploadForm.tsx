"use client";

// pages/upload-dicom.js or components/DicomUploadForm.js
import React, { useState } from "react";

function DicomMetadataUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMetadata(null);
    setError(null);
  };

  const handleUpload = async (event) => {
    // setSelectedFile(event.target.files[0]);
    // if (!selectedFile) {
    //   setError("Please select a zipped DICOM file.");
    //   return;
    // }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("dicomZipFile", event.target.files[0]); // 'dicomZipFile' is the key expected by the API route

    // console.log(formData);
    // return;

    try {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      const response = await fetch("/api/read-dicom-metadata", {
        method: "POST",
        body: formData,
        // headers,
        // No 'Content-Type' header needed for FormData - browser sets it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to upload and process file."
        );
      }

      const data = await response.json();
      setMetadata(data.metadata); // Assuming the API returns { metadata: {...} }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Zipped DICOM to Read Metadata</h1>
      <input type="file" accept=".zip" onChange={handleUpload} />
      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? "Processing..." : "Read Metadata"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <p>{error}</p>
        </div>
      )}

      {metadata && (
        <div style={{ marginTop: "20px" }}>
          <h2>Extracted Metadata:</h2>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default DicomMetadataUpload;
