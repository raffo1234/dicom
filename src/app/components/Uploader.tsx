"use client";

import JSZip from "jszip";
import dicomParser from "dicom-parser"; // Or dcmjs, etc.
import { Buffer } from "buffer";
import { supabase } from "@/lib/supabase";
import React, { useCallback, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import Script from "next/script";

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

    // Convert FileList to Array for consistent handling
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

        const zipData = selectedFile
          ? Buffer.from(await selectedFile.arrayBuffer())
          : null;

        let contents: JSZip | null | undefined;

        if (fileExt === "zip") {
          const zip = new JSZip();
          contents = zipData ? await zip.loadAsync(zipData) : null;

          const fileNames = contents ? Object.keys(contents.files) : [];
          let dicomFileName = fileNames.find((name) =>
            name.toLowerCase().endsWith(".dcm")
          );

          // Consider more robust logic here if the first non-dir file isn't guaranteed to be DICOM
          if (!dicomFileName) {
            const firstFile = fileNames
              .map((name) => contents?.files[name])
              .find((file) => file && !file.dir); // Ensure file exists and is not a directory
            dicomFileName = firstFile?.name;
          }

          if (
            !contents ||
            !dicomFileName ||
            contents.files[dicomFileName]?.dir
          ) {
            fileErrors.push(
              `Could not find a suitable DICOM file in ${selectedFile.name}`
            );
            console.error(
              `Could not find a suitable DICOM file in ${selectedFile.name}`
            );
            continue;
          }

          const dicomFile = contents.files[dicomFileName];

          const arrayBuffer = await dicomFile.async("arraybuffer");

          const byteArray: Uint8Array = new Uint8Array(arrayBuffer);

          let dataSet: DicomDataSet;

          try {
            dataSet = dicomParser.parseDicom(byteArray);

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

            // --- File Storage Upload Logic Goes Here (if needed) ---
            // const bucketName = "dicoms"; // Define or get bucket name
            // // Generate unique file name, maybe based on metadata?
            // // const fileExt = selectedFile.name.split(".").pop();
            // // const fileName = `${uuidv4()}.${fileExt}`;
            // // const filePath = `${userId}/${fileName}`;
            //
            // // Example: Upload the *original zipped* file
            // const { error: uploadError } = await supabase.storage
            //  .from(bucketName)
            //  .upload(filePath, selectedFile, {
            //     cacheControl: "3600",
            //     upsert: false, // Or true if you want to allow replacing existing files
            //  });
            //
            // if (uploadError) {
            //  throw new Error(`Storage upload failed for ${selectedFile.name}: ${uploadError.message}`);
            // }
            //
            // const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            // const publicUrl = data?.publicUrl;
            //
            // if (!publicUrl) {
            //    throw new Error(`Could not get public URL for ${selectedFile.name}`);
            // }
            // --- End File Storage Upload Logic ---

            // --- Supabase Metadata Insertion ---
            const { error: insertError } = await supabase.from("dicom").insert([
              {
                // dicom_url: publicUrl, // Include publicUrl if you uploaded the file
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
            // .select() // Only include .select().single() if you need the inserted data back
            // .single();

            if (insertError) {
              throw new Error(
                `Database insertion failed for ${selectedFile.name}: ${insertError.message}`
              );
            }

            // If we reached here, metadata insertion was successful
            successfulFiles.push(selectedFile.name);
          } catch (parseOrInsertError: any) {
            // Catch errors specific to parsing or inserting THIS file
            fileErrors.push(
              `Processing ${selectedFile.name} failed: ${parseOrInsertError.message}`
            );
            console.error(
              `Processing ${selectedFile.name} failed:`,
              parseOrInsertError
            );
          }
        }

        if (fileExt === "tar" || fileExt === "rar" || fileExt === "7z") {
          window.Unarchiver.open(selectedFile).then(async function (archive) {
            const entry = archive.entries[0];
            if (entry.is_file) {
              const entry_file = await entry.read();
              const entry_file_data = await entry_file.arrayBuffer();

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
                  // dicom_url: publicUrl, // Include publicUrl if you uploaded the file
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
          });
        }

        // --- END: Your existing file processing and parsing logic ---
      } catch (overallFileError: any) {
        // Catch errors related to reading the file or loading the zip
        fileErrors.push(
          `Reading or loading ${selectedFile.name} failed: ${overallFileError.message}`
        );
        console.error(
          `Reading or loading ${selectedFile.name} failed:`,
          overallFileError
        );
      }
    } // End of for...of loop

    // Report results after all files have been processed
    if (fileErrors.length > 0) {
      setError(`Some files failed: ${fileErrors.join("; ")}`);
    } else if (successfulFiles.length > 0) {
      setMessage(`Successfully processed ${successfulFiles.length} file(s).`); // Or list names: `${successfulFiles.join(", ")}`
      setFiles([]); // Clear files only on full success
      if (onUploadSuccess) {
        // If you uploaded files and have URLs, pass them here
        onUploadSuccess(); // Assuming onUploadSuccess can handle multiple URLs
      }
    } else {
      // Should ideally not happen if files.length > 0 and no errors occurred
      setMessage("No files were successfully processed.");
    }

    setUploading(false);
  };

  // Corrected type for acceptedFiles
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
    // maxSize: 200 * 1024 * 1024 // 200MB
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`${
          isDragActive
            ? "bg-cyan-50 border-cyan-100"
            : "bg-gray-50 border-gray-300"
        } transition-colors duration-300 flex flex-col group items-center justify-center py-9 w-full border  border-dashed rounded-2xl cursor-pointer `}
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
          id="dropzone-file"
          // onChange is not strictly needed if using onDrop exclusively, but kept for standard input fallback
          onChange={handleFileChange}
          disabled={uploading}
          type="file"
          className="hidden"
          // If you want to allow selecting multiple files via the file picker as well:
          // multiple
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
          <span>
            Error: {error} {/* Removed placeholder text */}
          </span>
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
            className="w-fit text-lg flex items-center gap-4 px-8 py-2  bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
          >
            <Icon icon="solar:bones-broken" fontSize={24}></Icon>
            <span>Go Dicoms</span>
            <Icon icon="solar:arrow-right-broken" fontSize={24}></Icon>
          </Link>
        </div>
      )}
      <Script
        src="/unarchiver.min.js" // Path to your script in the public folder
        strategy="afterInteractive" // Choose a loading strategy (e.g., afterInteractive)
        onLoad={() => {
          if (
            typeof window !== "undefined" &&
            typeof window.Unarchiver !== "undefined"
          ) {
            console.log("window.Unarchiver is now available.");
          }
        }}
      />
    </>
  );
};

export default ImageUploader;
