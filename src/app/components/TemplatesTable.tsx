"use client";

import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import useSWR, { mutate } from "swr";

const fetcher = async (userId: string) => {
  const { data, error } = await supabase
    .from("template")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export default function TemplatesTable({ userId }: { userId: string }) {
  const {
    data: templates,
    error,
    isLoading,
  } = useSWR(`admin_templates_${userId}`, () => fetcher(userId));

  const deleteUser = async (templateId: string) => {
    const confirmationMessage = confirm(
      "Esta acción no se puede deshacer. ¿Realmente desea eliminar este elemento?"
    );
    if (!confirmationMessage) return;

    try {
      await supabase.from("template").delete().eq("id", templateId);
      await mutate(`admin_templates_${userId}`);
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  if (error) return null;

  if (isLoading)
    return (
      <>
        <div className="px-6  transition-all duration-300 py-4 border-t  border-gray-200 first:border-0">
          <div className="rounded-xl bg-gray-100 h-4 w-1/2"></div>
        </div>
        <div className="px-6  transition-all duration-300 py-4 border-t  border-gray-200 first:border-0">
          <div className="rounded-xl bg-gray-100 h-4 w-1/2"></div>
        </div>
        <div className="px-6  transition-all duration-300 py-4 border-t  border-gray-200 first:border-0">
          <div className="rounded-xl bg-gray-100 h-4 w-1/2"></div>
        </div>
      </>
    );

  return (
    <>
      {templates?.map(({ id, name }) => {
        return (
          <div
            key={id}
            className="relative border-t border-gray-200 first:border-0"
          >
            <Link
              href={`/admin/templates/${id}`}
              className="px-6 hover:bg-gray-50 first:rounded-t-xl transition-all duration-300 py-4 gap-3.5 flex items-center"
            >
              <Icon icon="solar:file-favourite-line-duotone" fontSize={20} />
              <span>{name}</span>
            </Link>
            <button
              onClick={() => deleteUser(id)}
              type="button"
              title="Delete item"
              className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer hover:bg-gray-50 w-11 h-11 rounded-full border-gray-100 border text-red-500 flex items-center justify-center"
            >
              <Icon icon="solar:trash-bin-minimalistic-broken" fontSize={24} />
            </button>
          </div>
        );
      })}
    </>
  );
}
