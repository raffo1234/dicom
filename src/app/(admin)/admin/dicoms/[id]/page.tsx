import { supabase } from "@/lib/supabase";
import Report from "@/components/Report";
import { TemplateType } from "@/types/templateType";

export default async function Page() {
  const { data: templates } = (await supabase
    .from("template")
    .select("id, name")
    .order("created_at", { ascending: false })) as {
    data: TemplateType[] | null;
  };

  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Medical Report</h1>

      <Report templates={templates} />
    </>
  );
}
