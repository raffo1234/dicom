"use client";

import Image from "next/image";
import { TemplateType } from "@/types/templateType";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { DicomType } from "@/types/dicomType";
import Link from "next/link";

export default function Report({
  templates,
  userId,
  dicom,
}: {
  templates: TemplateType[] | null;
  userId?: string;
  dicom: DicomType | null;
}) {
  console.log(userId);
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(
    null
  );
  // const [value, setValue] = useState("");
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );

  // const generateHtmlContent = (value: string, userId: string) => {
  //   // Create HTML structure for your document
  //   let html = value;
  //   if (userId) {
  //     html += `<p>Doctor: ${userId}</p>`;

  //     // Add more property details...
  //   }

  //   //  if (userData) {
  //   //    html += "<h2>Owner Information</h2>";
  //   //    html += `<p>Name: ${userData.name}</p>`;
  //   //    html += `<p>Email: ${userData.email}</p>`;
  //   //    // Add more user details...
  //   //  }

  //   // You could add more complex HTML structure, tables, images (referenced by URL), etc.
  //   // A server-side library would then convert this HTML to DOCX.

  //   return html;
  // };

  // const handleGenerateDoc = async (value: string, userId: string) => {
  //   const htmlContent = generateHtmlContent(value, userId);

  //   try {
  //     const response = await fetch("/api/generate-doc", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ html: htmlContent }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status}`);
  //     }

  //     // Assuming the backend sends back the file as a Blob
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `report_${userId}.docx`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Failed to generate document:", error);
  //   }
  // };

  const handleTemplateActive = (template: TemplateType) => {
    setActiveTemplate(template);
  };

  useEffect(() => {
    if (templates && templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates]);

  if (!templates) return null;

  return (
    <>
      {/* {value} */}
      {/* <div className="p-4 bg-white border border-gray-200 rounded-xl"> */}

      <div className="flex items-center justify-between mb-6 print:hidden">
        <div
          className="grid gap-2 flex-grow-1"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          }}
        >
          {templates.map((template) => {
            const { id, name } = template;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTemplateActive(template)}
                className={`${
                  activeTemplate?.id === id
                    ? "bg-rose-50 border-rose-200"
                    : "bg-gray-50 border-gray-200"
                } cursor-pointer text-center p-3 rounded-xl border`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <Link
          href="/admin/templates"
          className="flex items-center gap-2 cursor-pointer text-center p-3 text-cyan-400 group"
          title="Add template"
        >
          <Icon icon="solar:file-favourite-line-duotone" fontSize={24} />
          <span className="group-hover:underline">Add template</span>
        </Link>
      </div>
      <div className="bg-white p-3 print:p-0 border-3 print:border-none rounded-xl border-gray-200">
        {activeTemplate?.header_image_url ? (
          <Image
            src={activeTemplate?.header_image_url}
            width={300}
            height={300}
            alt={activeTemplate.name}
            className="bg-gray-100 w-full h-auto print:fixed print:top-0 print:left-0"
          />
        ) : null}
        <table className="w-full">
          <thead>
            <th>
              <td>
                <div className="page-header-space">&nbsp;</div>
              </td>
            </th>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="page">
                  <div className="mb-6">
                    <div>
                      <span className="text-gray-400">Paciente:</span>{" "}
                      {dicom?.patient_name}{" "}
                    </div>
                    <div>
                      <span className="text-gray-400">Edad:</span>{" "}
                      {dicom?.patient_age} Años
                    </div>
                    <div>
                      <span className="text-gray-400">ID:</span>{" "}
                      {dicom?.patient_id}
                    </div>
                    <div>
                      <span className="text-gray-400">Fecha:</span>{" "}
                      {dicom?.study_date}
                    </div>
                    <div>
                      <span className="text-gray-400">Descripción:</span>{" "}
                      {dicom?.study_description}
                    </div>
                  </div>

                  <ReactQuill theme="snow" />

                  {activeTemplate?.sign_image_url ? (
                    <Image
                      src={activeTemplate?.sign_image_url}
                      width={300}
                      height={300}
                      alt={activeTemplate.name}
                      className="bg-gray-100 w-[120px] h-auto"
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <div className="page-footer-space">&nbsp;</div>
              </td>
            </tr>
          </tfoot>
        </table>

        {activeTemplate?.footer_image_url ? (
          <Image
            src={activeTemplate?.footer_image_url}
            width={300}
            height={300}
            alt={activeTemplate.name}
            className="bg-gray-100 w-full h-auto print:fixed print:bottom-0 print:left-0"
          />
        ) : null}
      </div>
      {/* </div> */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="flex print:hidden gap-4 items-center text-white cursor-pointer font-semibold disabled:border-gray-100 disabled:bg-gray-100 py-3 px-10 bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
          // onClick={async () => await handleGenerateDoc(value, userId)}
          onClick={() => window.print()}
        >
          <Icon icon="solar:document-text-line-duotone" fontSize={26} />
          <span>Generate PDF</span>
        </button>
      </div>
    </>
  );
}
