"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

export default function Page() {
  const [value, setValue] = useState("");
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );

  console.log(value);
  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Medical Report</h1>
      <div className="bg-white">
        <ReactQuill theme="snow" onChange={setValue} />
      </div>
    </>
  );
}
