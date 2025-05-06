"use client";

import { supabase } from "@/lib/supabase";
import React, { useCallback, useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import PrimaryButton from "./PrimaryButton";
import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  userId: string | undefined;
  onUploadSuccess?: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  userId,
  onUploadSuccess,
}) => {
  const bucketName = "dicoms";
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setError(null);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Dicom file.");
      return;
    }

    if (!userId) {
      setError("User ID is missing.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Could not get public URL after upload.");
      }

      const { error: insertError } = await supabase
        .from("user_dicom")
        .insert([{ dicom_url: publicUrl, user_id: userId }]);

      if (insertError) {
        throw insertError;
      }

      setMessage("Dicom uploaded and associated successfully!");
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
      console.error("Upload Error:", err);
    } finally {
      setUploading(false);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDrop = useCallback((acceptedFiles: any[]) => {
    setFile(acceptedFiles[0] || null);
    setError(null);
    setMessage(null);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    // accept: {
    //   "application/zip": [],
    // },
    maxFiles: 1,
  });

  return (
    <>
      <div
        {...getRootProps()}
        // htmlFor="dropzone-file"
        className="flex flex-col group items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
      >
        <Icon
          icon="solar:cloud-upload-broken"
          className="text-gray-700 mb-3 group-hover:text-cyan-400 transition-colors duration-300"
          fontSize={42}
        />
        <h2 className="text-gray-400 text-sm mb-1">
          Zip with .dcim files, less than 200KB
        </h2>
        <h4 className="font-semibold">Drag and Drop your file here</h4>
        <input
          {...getInputProps()}
          id="dropzone-file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          type="file"
          className="hidden"
        />
      </div>

      {file && <p>Selecionar imagen: {file.name}</p>}
      <PrimaryButton
        type="button"
        disabled={uploading || !file}
        onClick={handleUpload}
        label={uploading ? "Cargando..." : "Cargar Archivo"}
      />
      {error && <p className="error-message">Error: {error}</p>}
      {message && <p className="success-message">Success: {message}</p>}

      {/* {file && !message && !error && (
        <img
          src={URL.createObjectURL(file)}
          alt="Imagen Seleccionada"
          style={{ maxWidth: "200px", marginTop: "10px" }}
        />
      )} */}
    </>
  );
};

export default ImageUploader;
