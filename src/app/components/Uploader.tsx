"use client";

import { Archive } from "libarchive.js";
import dicomParser from "dicom-parser"; // Or dcmjs, etc.
import { supabase } from "@/lib/supabase";
import React, { useCallback, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";

Archive.init({
  workerUrl: "/libarchive.js/dist/worker-bundle.js",
});

interface DicomDataSet {
  string: (tag: string) => string | undefined;
  // Add other methods if you use them, e.g.:
  // int16: (tag: string) => number | undefined;
  // sequence: (tag: string) => { items: Array<DicomDataSet | any> } | undefined;
  // ...
}

interface DicomMetadataResponse {
  patientName?: string;
  patientID?: string;
  patientAge?: string;
  studyDescription?: string;
  seriesDescription?: string;
  modality?: string;
  studyDate?: string;
  [key: string]: string | undefined;
}

type ImageUploaderProps = {
  userId: string;
  onUploadSuccess?: () => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  userId,
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files || [];

    setFiles(Array.from(selectedFiles));
    setError(null);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select Dicom files.");
      return;
    }

    if (!userId) {
      setError("User ID is missing.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const fileErrors: string[] = [];
    const successfulFiles: string[] = [];

    for (const selectedFile of Array.from(files)) {
      try {
        const fileName = selectedFile.name;
        const fileExt = fileName.split(".").pop();

        if (fileExt === "zip" || fileExt === "rar" || fileExt === "tar") {
          const archive = await Archive.open(selectedFile);
          const obj = await archive.extractFiles();
          const firstFile = Object.values(obj)[0] as File;
          const entry_file_data = await firstFile.arrayBuffer();
          const byteArray: Uint8Array = new Uint8Array(entry_file_data);
          const dataSet: DicomDataSet = dicomParser.parseDicom(byteArray);

          const extractedMetadata: DicomMetadataResponse = {
            patientName: dataSet.string("x00100010"),
            patientID: dataSet.string("x00100020"),
            patientAge: dataSet.string("x00101010"),
            studyDescription: dataSet.string("x00081030"),
            seriesDescription: dataSet.string("x0008103E"),
            modality: dataSet.string("x00080060"),
            studyDate: dataSet.string("x00080020"),
            // Add more tags here as needed
          };

          await supabase.from("dicom").insert([
            {
              user_id: userId,
              patient_name: extractedMetadata.patientName,
              patient_id: extractedMetadata.patientID,
              patient_age: extractedMetadata.patientAge,
              study_description: extractedMetadata.studyDescription,
              series_description: extractedMetadata.seriesDescription,
              modality: extractedMetadata.modality,
              study_date: extractedMetadata.studyDate,
            },
          ]);
        }
      } catch {
        fileErrors.push(`Reading or loading ${selectedFile.name}`);
      }
    }

    if (fileErrors.length > 0) {
      setError(`Some files failed: ${fileErrors.join("; ")}`);
    } else if (successfulFiles.length > 0) {
      setMessage(`Successfully processed ${successfulFiles.length} file(s).`); // Or list names: `${successfulFiles.join(", ")}`
      setFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } else {
      setMessage("No files were successfully processed.");
    }

    setUploading(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles || []);
    setError(null);
    setMessage(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/x-tar": [".tar"],
    },
    maxSize: 200 * 1024 * 1024, // 200MB
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`${
          isDragActive
            ? "bg-cyan-50 border-cyan-100"
            : "bg-gray-50 border-gray-300"
        } transition-colors duration-300 hover:border-cyan-200 hover:bg-white flex flex-col group items-center justify-center py-9 w-full border  border-dashed rounded-2xl cursor-pointer `}
      >
        <Icon
          icon="solar:cloud-upload-broken"
          className="text-gray-700 mb-3 group-hover:text-cyan-400 transition-colors duration-300"
          fontSize={42}
        />
        <h2 className="text-gray-400 text-sm mb-1">
          .zip, .rar, .tar with .dcm files, less than 200MB
        </h2>{" "}
        {/* Note: The size limit "less than 200MB" is mentioned in the UI text but not enforced in the current code */}
        <h4 className="font-semibold">Drag and Drop your files here</h4>
        {files.length > 0 ? (
          <div className="border border-gray-200 rounded-xl mt-6 max-w-md">
            <div className="text-sm font-semibold px-5 py-2 bg-gray-100 rounded-t-xl">
              Selected File{files.length === 1 ? "" : "s"} ({files.length})
            </div>
            <div className="border-t border-gray-200">
              {Array.from(files).map((file, index) => {
                return (
                  file && (
                    <p
                      key={index}
                      className="truncate text-sm text-gray-500 px-5 py-2 first:border-0 border-t border-gray-200"
                    >
                      {file.name}
                    </p>
                  )
                );
              })}
            </div>
          </div>
        ) : null}
        <input
          {...getInputProps()}
          onChange={handleFileChange}
          disabled={uploading}
          type="file"
          className="hidden"
          multiple
        />
      </div>
      {files.length > 0 ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="flex gap-4 items-center text-white cursor-pointer font-semibold disabled:border-gray-100 disabled:bg-gray-100 py-3 px-10 bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
            disabled={uploading}
            onClick={handleUpload}
          >
            <Icon icon="solar:upload-minimalistic-linear" fontSize={26} />
            <span>
              {uploading
                ? "Processing..." // Changed text to reflect processing, not just uploading
                : `Process File${files.length === 1 ? "" : "s"}`}
            </span>
          </button>
        </div>
      ) : null}

      {error && (
        <p className="w-fit text-sm px-4 py-2 border border-rose-200 flex items-center gap-3 bg-rose-50 rounded-xl mt-3">
          <Icon
            icon="solar:close-circle-broken"
            className="flex-shrink-0"
            fontSize={24}
          ></Icon>
          <span>Error: {error}</span>
        </p>
      )}
      {message && (
        <div className="flex items-center justify-between gap-4 mt-3">
          <p className="w-fit text-sm px-4 py-2 border border-green-200 bg-green-50 flex items-center gap-3 rounded-xl">
            <Icon
              icon="solar:check-circle-broken"
              className="flex-shrink-0"
              fontSize={24}
            ></Icon>
            <span>Success: {message}</span>
          </p>
          <Link
            href="/admin/dicoms"
            title="Go Dicoms"
            className="w-fit text-lg flex items-center gap-4 px-8 py-2 bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
          >
            <Icon icon="solar:bones-broken" fontSize={24}></Icon>
            <span>Go Dicoms</span>
            <Icon icon="solar:arrow-right-broken" fontSize={24}></Icon>
          </Link>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
