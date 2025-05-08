"use client";

import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import FormSkeleton from "@/components/FormSkeleton";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";

type Inputs = {
  name: string;
  description: string;
  header_image_url: string;
  footer_image_url: string;
  sign_image_url: string;
};

const fetcher = async (id: string) => {
  const { data, error } = await supabase
    .from("template")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export default function EditTemplate({ id }: { id: string }) {
  const {
    data: template,
    isLoading,
    mutate: mutateTemplate,
  } = useSWR(id, () => fetcher(id));

  const { reset, register, handleSubmit } = useForm<Inputs>({
    mode: "onBlur",
    defaultValues: useMemo(() => {
      return template;
    }, [template]),
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const { data: updatedTemplate } = await supabase
        .from("template")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updatedTemplate) {
        await mutateTemplate(updatedTemplate);
        await mutate("templates");
        await reset();
        window.location.href = "/admin/templates";
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    templateId: string
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    const fileExt = selectedFile?.name.split(".").pop();
    const fileName = `header_${templateId}_${uuidv4()}.${fileExt}`;
    const filePath = `template_${templateId}/${fileName}`;
    const bucketName = "dicoms";

    if (!selectedFile) {
      throw new Error("Please select an image file.");
    }

    if (template.header_image_url) {
      const { data: files } = await supabase.storage
        .from(bucketName)
        .list(`template_${templateId}`);

      if (!files || files.length === 0) {
        console.log("Folder is already empty or does not exist.");
      }

      const filesToRemove =
        files?.map((file) => `template_${templateId}/${file.name}`) || [];

      const { data: removeData, error: removeError } = await supabase.storage
        .from(bucketName)
        .remove(filesToRemove);

      if (removeError) {
        console.error("Error removing files:", removeError.message);
      } else {
        console.log("Files removed successfully:", removeData);
        console.log("The folder will disappear automatically once empty.");
      }

      // const oldFileExt = template.header_image_url.split(".").pop();
      // const oldFileName = `header_${templateId}.${oldFileExt}`;
      // const { error: removeError } = await supabase.storage
      //   .from(bucketName)
      //   .remove([`template_${templateId}/${oldFileName}`]);

      // if (removeError) throw removeError;
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile, {
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

    const { data, error: errorTemplate } = await supabase
      .from("template")
      .update({ header_image_url: publicUrl })
      .eq("id", templateId)
      .select()
      .single();

    if (errorTemplate) throw new Error("Could not sync image");
    if (data) await mutateTemplate();
  };

  useEffect(() => {
    reset(template);
  }, [template]);

  return (
    <>
      {isLoading ? (
        <FormSkeleton rows={2} />
      ) : (
        <>
          <h2 className="mb-6 font-semibold text-lg block">
            <span className="capitalize">{template.name}</span> Template
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} id="editUser">
            <fieldset className="flex flex-col gap-4">
              <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
                <h2 className="font-semibold">Header Image</h2>
                <fieldset className="flex flex-col items-center gap-4 w-full">
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
                      Image file, less than 100KB
                    </h2>
                    <h4 className="font-semibold">
                      Drag and Drop your file here
                    </h4>
                    <input
                      id="dropzone-file"
                      {...getInputProps()}
                      onChange={(event) => handleFileChange(event, id)}
                      type="file"
                      className="hidden"
                    />
                  </div>
                  <Image
                    src={template.header_image_url}
                    alt={template.name}
                    width={300}
                    height={300}
                  />
                </fieldset>
              </div>
              <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
                <h2 className="font-semibold">Sign Image</h2>
                <fieldset className="flex items-center gap-4 w-full">
                  <div
                    // {...getRootProps()}
                    className="flex flex-col group items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
                  >
                    <Icon
                      icon="solar:cloud-upload-broken"
                      className="text-gray-700 mb-3 group-hover:text-cyan-400 transition-colors duration-300"
                      fontSize={42}
                    />
                    <h2 className="text-gray-400 text-sm mb-1">
                      Image file, less than 100KB
                    </h2>
                    <h4 className="font-semibold">
                      Drag and Drop your file here
                    </h4>
                    <input
                      // {...getInputProps()}
                      type="file"
                      className="hidden"
                    />
                  </div>
                </fieldset>
              </div>
              <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
                <h2 className="font-semibold">Footer Image</h2>
                <fieldset className="flex items-center gap-4 w-full">
                  <div
                    // {...getRootProps()}
                    className="flex flex-col group items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
                  >
                    <Icon
                      icon="solar:cloud-upload-broken"
                      className="text-gray-700 mb-3 group-hover:text-cyan-400 transition-colors duration-300"
                      fontSize={42}
                    />
                    <h2 className="text-gray-400 text-sm mb-1">
                      Image file, less than 100KB
                    </h2>
                    <h4 className="font-semibold">
                      Drag and Drop your file here
                    </h4>
                    <input
                      // {...getInputProps()}
                      type="file"
                      className="hidden"
                    />
                  </div>
                </fieldset>
              </div>

              <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
                <h2 className="font-semibold">General Information</h2>
                <div>
                  <label htmlFor="name" className="inline-block mb-2 text-sm">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    required
                    className="w-full px-4 bg-white py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="inline-block mb-2 text-sm"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    {...register("description")}
                    required
                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                  />
                </div>
              </div>
            </fieldset>
            <footer className="flex items-center gap-3.5 justify-end mt-6 pt-6">
              <Link
                href="/admin/templates"
                className="font-semibold  disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 bg-white text-sm border border-gray-100 rounded-lg transition-colors hover:border-gray-200 duration-500 active:border-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="text-white font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 text-sm bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
              >
                Save
              </button>
            </footer>
          </form>
        </>
      )}
    </>
  );
}
