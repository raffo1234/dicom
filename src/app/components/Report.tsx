"use client";

import { TemplateType } from "@/types/templateType";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

export default function Report({
  templates,
}: {
  templates: TemplateType[] | null;
}) {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(
    null
  );
  const [value, setValue] = useState("");
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );
  console.log(value);

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
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <div
          className="grid gap-2 mb-6"
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
        <div className="bg-white">
          <ReactQuill theme="snow" onChange={setValue} />
        </div>
      </div>
    </>
  );
}
