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

interface DicomElement {
  tag: string; // Hexadecimal tag string (e.g., 'x00100010')
  vr?: string; // Value Representation (e.g., 'PN', 'UI', 'DA') - Optional
  length: number; // Length of the value field
  dataOffset: number; // Offset in the byte stream where the value starts

  // If this element is a Sequence (SQ), it has an 'items' array.
  // The items in the array are also DicomElement objects.
  items?: DicomElement[]; // Items within a sequence are also DicomElements

  // If this element is an item within a Sequence (SQ), it has a 'dataSet' property
  // which is a nested DicomDataSet. This is optional because not all elements are sequence items.
  dataSet?: DicomDataSet; // Nested DataSet for sequence items - Optional

  // Add other properties if you use them (e.g., fragments for pixel data)
}

interface DicomDataSet {
  // elements is a map where keys are tag strings and values are DicomElement objects
  elements: { [tag: string]: DicomElement };
  // byteArray is the underlying byte array the dataset was parsed from
  byteArray: Uint8Array;

  // Methods for accessing element values - only including 'string' as used in the code
  string(tag: string): string | undefined;
  // Add other methods like int16, float, bytes etc. if you use them and need strict typing
}

interface DicomMetadata {
  patientId?: string;
  patientName?: string;
  patientAge?: string;
  studyDescription?: string;
  modality?: string;
  studyDate?: string;
  patientSex?: string;
  patientBirthDate?: string;
  institutionName?: string;
}

type ImageUploaderProps = {
  userId: string;
  onUploadSuccess?: () => void;
};

interface ExtractedFilesObject {
  [name: string]: File | ExtractedFilesObject;
}

async function insertDataSetToDb(userId: string, dataSet: DicomMetadata) {
  await supabase.from("dicom").insert([
    {
      user_id: userId,
      patient_name: dataSet.patientName,
      patient_id: dataSet.patientId,
      patient_age: dataSet.patientAge,
      study_description: dataSet.studyDescription,
      modality: dataSet.modality,
      study_date: dataSet.studyDate,
      gender: dataSet.patientSex,
      birthday: dataSet.patientBirthDate,
      institution: dataSet.institutionName,
    },
  ]);
}

interface DicomdirInfo {
  patientName?: string;
  patientId?: string;
  patientBirthDate?: string;
  patientSex?: string;
  studyDate?: string;
  patientAge?: string;
  studyDescription?: string;
  institutionName?: string;
  modality?: string;
}

function extractPatientAndStudyInfo(
  directoryRecordItems: DicomElement[]
): DicomdirInfo {
  const dicomdirInfo: DicomdirInfo = {}; // Initialize as an empty object

  let patientFound = false;
  let studyFound = false;
  let institutionFound = false;
  let modalityFound = false;

  for (const item of directoryRecordItems) {
    if (patientFound && studyFound && institutionFound && modalityFound) {
      break;
    }

    const recordDataSet: DicomDataSet | undefined = item.dataSet;

    if (!recordDataSet) {
      console.warn("Skipping record item with no dataSet.");
      continue;
    }

    if (!institutionFound) {
      const institutionName = recordDataSet.string("x00080080");
      if (institutionName !== undefined && institutionName.trim() !== "") {
        console.warn("Found first Institution Name:", institutionName);
        dicomdirInfo.institutionName = institutionName;
        institutionFound = true;
      }
    }

    if (!modalityFound) {
      const modality = recordDataSet.string("x00080060");
      if (modality !== undefined && modality.trim() !== "") {
        console.warn("Found first Modality:", modality);
        dicomdirInfo.modality = modality;
        modalityFound = true;
      }
    }

    const recordType: string | undefined = recordDataSet.string("x00041430");

    switch (recordType) {
      case "PATIENT":
        if (!patientFound) {
          console.warn("Found first Patient record.");
          dicomdirInfo.patientName = recordDataSet.string("x00100010");
          dicomdirInfo.patientId = recordDataSet.string("x00100020");
          dicomdirInfo.patientBirthDate = recordDataSet.string("x00100030");
          dicomdirInfo.patientSex = recordDataSet.string("x00100040");
          dicomdirInfo.patientAge = recordDataSet.string("x00101010");
          patientFound = true;
        }
        break;
      case "STUDY":
        if (!studyFound) {
          console.warn("Found first Study record.");
          dicomdirInfo.studyDate = recordDataSet.string("x00080020");
          dicomdirInfo.studyDescription = recordDataSet.string("x00081030");
          studyFound = true;
        }
        break;

      default:
        break;
    }
  }

  return dicomdirInfo;
}

function findFirstDcmFileRecursive(
  item: File | ExtractedFilesObject
): File | undefined {
  if (item instanceof File) {
    const lowerCaseName = item.name.toLowerCase();

    if (
      (lowerCaseName === "dicomdir" &&
        item.type === "application/octet-stream") ||
      lowerCaseName.endsWith(".dcm")
    ) {
      return item;
    }
  } else if (typeof item === "object" && item !== null) {
    for (const itemName in item) {
      if (Object.prototype.hasOwnProperty.call(item, itemName)) {
        const nestedItem = item[itemName];

        const foundFile = findFirstDcmFileRecursive(nestedItem);

        if (foundFile) {
          return foundFile;
        }
      }
    }
  }

  return undefined;
}

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
      setError("Please select a compressed file containing .dcim files.");
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
          const extractedFiles = await archive.extractFiles();

          const dcmFile = findFirstDcmFileRecursive(extractedFiles);

          const isDICOMDIR =
            dcmFile?.name.toLowerCase() === "dicomdir" &&
            dcmFile.type === "application/octet-stream";

          if (dcmFile) {
            if (isDICOMDIR) {
              const dcmFileArrayBuffer = await dcmFile.arrayBuffer();
              const byteArray: Uint8Array = new Uint8Array(dcmFileArrayBuffer);
              const dataSet: DicomDataSet = dicomParser.parseDicom(byteArray);

              const directoryRecordSequenceElement: DicomElement | undefined =
                dataSet.elements.x00041220;

              if (!directoryRecordSequenceElement?.items) {
                fileErrors.push(
                  "Could not find Directory Record Sequence (Tag 0004,1220) in the file."
                );
              } else {
                const directoryRecordItems: DicomElement[] =
                  directoryRecordSequenceElement.items;

                const extractedMetadata: DicomMetadata =
                  extractPatientAndStudyInfo(directoryRecordItems);

                await insertDataSetToDb(userId, extractedMetadata);
              }
            } else {
              const dcmFileArrayBuffer = await dcmFile.arrayBuffer();
              const byteArray: Uint8Array = new Uint8Array(dcmFileArrayBuffer);
              const dataSet: DicomDataSet = dicomParser.parseDicom(byteArray);

              const extractedMetadata = {
                patientName: dataSet.string("x00100010"),
                patientId: dataSet.string("x00100020"),
                patientAge: dataSet.string("x00101010"),
                studyDescription: dataSet.string("x00081030"),
                modality: dataSet.string("x00080060"),
                studyDate: dataSet.string("x00080020"),
                patientSex: dataSet.string("x00100040"),
                patientBirthDate: dataSet.string("x00100030"),
                institutionName: dataSet.string("x00080080"),
              };

              await insertDataSetToDb(userId, extractedMetadata);
            }
          } else {
            fileErrors.push("No .dicm files found. Let's try again");
          }
        } else {
          setUploading(false);
          setFiles([]);
          fileErrors.push("File not supported, please try again.");
        }
      } catch {
        fileErrors.push(`Reading or loading ${selectedFile.name}`);
      }
    }

    if (fileErrors.length > 0) {
      setError(`Some files failed: ${fileErrors.join("; ")}`);
    } else if (successfulFiles.length > 0) {
      setMessage(`Successfully processed ${successfulFiles.length} file(s).`);
      setFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } else {
      setMessage("Files were successfully processed.");
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
      "application/octet-stream": [
        ".rar",
        ".7z",
        ".tar",
        ".gz",
        ".bz2",
        ".xz",
        ".lz4",
        ".zst",
      ],
      "application/zip": [".zip"],
      "application/x-tar": [".tar"],
      "application/x-rar-compressed": [".rar"],
      "application/x-7z-compressed": [".7z"],
      "application/gzip": [".gz"],
      "application/x-bzip2": [".bz2"],
      "application/x-xz": [".xz"],
      "application/x-lz4": [".lz4"],
      "application/zstd": [".zst"],
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
        }
        ${uploading ? "cursor-no-drop" : "cursor-pointer"}
        transition-all  hover:outline-8 outline-cyan-50 duration-300 hover:border-cyan-200 hover:bg-white flex flex-col group items-center justify-center py-20 w-full border border-dashed rounded-2xl`}
      >
        <div className="w-11 h-11 relative mb-3">
          <Icon
            icon="solar:record-broken"
            className={`${uploading ? "opacity-100" : "opacity-0"} text-gray-500 animate-spin absolute left-0 top-0 group-hover:text-cyan-400 transition-all duration-300`}
            fontSize={42}
          />
          <Icon
            icon="solar:cloud-upload-broken"
            className={`${uploading ? "opacity-0" : "opacity-100"} text-gray-700 absolute left-0 top-0 group-hover:text-cyan-400 transition-colors duration-300`}
            fontSize={42}
          />
        </div>
        <h2 className="text-gray-400 text-sm mb-1">.zip, .rar, .tar files</h2>
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
      {files.length > 0 && !message ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="flex gap-4 items-center text-white disabled:cursor-no-drop cursor-pointer font-semibold disabled:border-cyan-400 disabled:bg-cyan-400 py-3 px-10 bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <Icon
                icon="solar:record-broken"
                fontSize={26}
                className="animate-spin"
              />
            ) : (
              <Icon icon="solar:upload-minimalistic-linear" fontSize={26} />
            )}
            <span>
              {uploading
                ? "Processing..."
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
            title="View All"
            className="w-fit text-lg flex items-center gap-4 px-8 py-2 bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
          >
            <Icon icon="solar:file-text-linear" fontSize={24}></Icon>
            <span>View All</span>
            <Icon icon="solar:arrow-right-broken" fontSize={24}></Icon>
          </Link>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
