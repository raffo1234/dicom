"use client";

import ContentPDFDocument from "@/components/ContentPDFDocument";
import { DicomType } from "@/types/dicomType";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function PDFPreview({ dicom }: { dicom: DicomType }) {
  const BlobProvider = useMemo(
    () =>
      dynamic(
        () => import("@react-pdf/renderer").then((mod) => mod.BlobProvider),
        {
          ssr: false,
          loading: () => "Loading...",
        }
      ),
    []
  );

  return (
    <div className="fixed top-0 z-50 left-0 right-0 bg-gray-100">
      <div
        className="mx-auto"
        style={{
          width: "612pt",
          minHeight: "100vh",
        }}
      >
        <BlobProvider
          document={
            <ContentPDFDocument
              dicom={dicom}
              activeTemplate={dicom.template}
              content={dicom.report}
            />
          }
        >
          {({ url }) => {
            if (!url) return null;
            return (
              <iframe
                src={url}
                style={{
                  width: "612pt",
                  minHeight: "100vh",
                }}
              />
            );
          }}
        </BlobProvider>
      </div>
    </div>
  );
}
