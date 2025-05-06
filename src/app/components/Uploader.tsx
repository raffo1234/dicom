"use client";

import JSZip from "jszip";
import dicomParser from "dicom-parser"; // Or dcmjs, etc.
// import { readFileSync } from "fs";
import { Buffer } from "buffer";
import { supabase } from "@/lib/supabase";
import React, { useCallback, useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import PrimaryButton from "./PrimaryButton";
import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";

interface DicomMetadataResponse {
  patientName?: string;
  patientID?: string;
  studyDescription?: string;
  seriesDescription?: string;
  modality?: string;
  studyDate?: string;
  [key: string]: string | undefined;
}

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

      const formData = new FormData();
      if (file) formData.append("dicomZipFile", file); // 'dicomZipFile' is the key expected by the API route

      const zippedFile = formData.get("dicomZipFile") as Blob | null;

      const zipData = zippedFile
        ? Buffer.from(await zippedFile.arrayBuffer())
        : null;
      const zip = new JSZip();
      const contents = zipData ? await zip.loadAsync(zipData) : null;

      const fileNames = contents ? Object.keys(contents.files) : [];
      let dicomFileName = fileNames.find((name) =>
        name.toLowerCase().endsWith(".dcm")
      );

      if (!dicomFileName) {
        const firstFile = fileNames
          .map((name) => contents?.files[name])
          .find((file) => !file?.dir);

        if (!firstFile) {
          // Return 400 if zip is empty or only contains folders
        }

        dicomFileName = firstFile?.name; // Use the first actual file's name
      }

      if (contents) {
        const dicomFile: JSZip.JSZipObject =
          contents.files[dicomFileName as string];

        if (dicomFile.dir) {
          // Should not happen with the logic above, but added for safety
          // return res.status(400).json({
          //   error: "Selected file inside zip is a directory, not a DICOM file.",
          // });
          console.log(
            "Selected file inside zip is a directory, not a DICOM file."
          );
        }

        const arrayBuffer: ArrayBuffer = await dicomFile.async("arraybuffer");
        const byteArray: Uint8Array = new Uint8Array(arrayBuffer);

        interface DicomDataSet {
          string: (tag: string) => string | undefined;
          // Add other methods if you use them, e.g.:
          // int16: (tag: string) => number | undefined;
          // sequence: (tag: string) => { items: Array<DicomDataSet | any> } | undefined;
          // ...
        }

        let dataSet: DicomDataSet;

        try {
          dataSet = dicomParser.parseDicom(byteArray);

          const extractedMetadata: DicomMetadataResponse = {
            patientName: dataSet.string("x00100010"),
            patientID: dataSet.string("x00100020"),
            studyDescription: dataSet.string("x00081030"),
            seriesDescription: dataSet.string("x0008103E"),
            modality: dataSet.string("x00080060"),
            studyDate: dataSet.string("x00080020"),
            // Add more tags here as needed, check dicomParser docs or DICOM standard
            // E.g., Manufacturer: dataSet.string('x00080070')
            // E.g., Study Instance UID: dataSet.string('x0020000D')
          };

          const { data: insertData, error: insertError } = await supabase
            .from("dicom")
            .insert([
              {
                dicom_url: publicUrl,
                user_id: userId,
                patient_name: extractedMetadata.patientName,
                patient_id: extractedMetadata.patientID,
                study_description: extractedMetadata.studyDescription,
                series_description: extractedMetadata.seriesDescription,
                modality: extractedMetadata.modality,
                study_date: extractedMetadata.studyDate,
              },
            ])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          if (insertData) {
            setError(null);
            setMessage(null);
          }
        } catch (parseError) {
          console.error("DICOM parsing failed:", parseError);
        }
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
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="flex flex-col group items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
      >
        <Icon
          icon="solar:cloud-upload-broken"
          className="text-gray-700 mb-3 group-hover:text-cyan-400 transition-colors duration-300"
          fontSize={42}
        />
        <h2 className="text-gray-400 text-sm mb-1">
          Zip with .dcim files, less than 200MB
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
      {/* {metadata} */}
      {error && <p className="error-message">Error: {error}</p>}
      {message && <p className="success-message">Success: {message}</p>}
    </>
  );
};

export default ImageUploader;
