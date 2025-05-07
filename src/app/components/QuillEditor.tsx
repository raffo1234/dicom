"use client";

import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function QuillEditor() {
  const [editorContent, setEditorContent] = useState("");

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"], // Remove formatting
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
    ],
    []
  ); // Empty dependency array means this config is created once

  const handleEditorChange = (html: string) => {
    setEditorContent(html);
    // You can also access other arguments if needed:
    // console.log('Delta:', delta);
    // console.log('Source:', source); // 'user' (user interaction), 'api' (api call), 'silent' (programmatic change)
    // console.log('Editor:', editor); // The Quill editor instance
  };

  return (
    <div>
      <h2>Rich Text Editor Example</h2>
      <div style={{ height: "300px", marginBottom: "40px" }}>
        {/* Adjust height as needed */}
        <ReactQuill
          theme="snow" // Use 'snow' for a standard toolbar, 'bubble' for a floating bubble
          value={editorContent} // Bind the state to the editor's value
          modules={modules} // Specify toolbar and other modules
          formats={formats} // Specify allowed formats
          onChange={handleEditorChange} // Update the state when content changes
          placeholder="Write something amazing..." // Optional placeholder
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Editor Content (Raw HTML):</h3>
        {/* Display the raw HTML content from the state */}
        <textarea
          value={editorContent}
          readOnly // Make it read-only
          style={{
            width: "100%",
            height: "150px",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        />
      </div>
    </div>
  );
}
