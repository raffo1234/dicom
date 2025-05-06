"use client";

import React, { ChangeEvent, useState } from "react";
import JSZip from "jszip";
import dicomParser from "dicom-parser"; // Or dcmjs, etc.
// import { readFileSync } from "fs";
import { Buffer } from "buffer";

function DicomMetadataUpload() {
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (event.target.files)
      formData.append("dicomZipFile", event.target.files[0]); // 'dicomZipFile' is the key expected by the API route

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
      console.log({ dicomFileName });
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

      interface DicomMetadataResponse {
        patientName?: string;
        patientID?: string;
        studyDescription?: string;
        seriesDescription?: string;
        modality?: string;
        studyDate?: string;
        [key: string]: string | undefined;
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
        setMetadata(extractedMetadata);
      } catch (parseError) {
        console.error("DICOM parsing failed:", parseError);
      }
    }
  };

  return (
    <div>
      <h1>Upload Zipped DICOM to Read Metadata</h1>
      <input
        type="file"
        accept=".zip"
        disabled={loading}
        onChange={handleUpload}
      />

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
