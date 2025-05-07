import { supabase } from "@/lib/supabase";
import { TemplateType } from "@/types/templateType";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default async function Page() {
  const { data: templates } = (await supabase.from("template").select("*")) as {
    data: TemplateType[];
  };

  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Templates</h1>
      <div className="border border-gray-200 rounded-xl bg-white">
        {templates.map(({ id, name }) => {
          return (
            <Link
              href={`/admin/templates/${id}`}
              key={id}
              className="px-6 hover:bg-gray-50 transition-all duration-300 py-4 gap-3.5 flex items-center border-t border-gray-200 first:border-0"
            >
              <Icon icon="solar:file-favourite-line-duotone" fontSize={24} />
              <span>{name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
