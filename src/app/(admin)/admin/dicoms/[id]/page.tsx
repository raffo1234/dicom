import { supabase } from "@/lib/supabase";
import Report from "@/components/Report";
import { TemplateType } from "@/types/templateType";
import { auth } from "@/lib/auth";
import { DicomType } from "@/types/dicomType";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id, role_id")
    .eq("email", userEmail)
    .single();

  const userId = user?.id;

  const { data: dicom } = (await supabase
    .from("dicom")
    .select("*")
    .eq("id", id)
    .single()) as {
    data: DicomType | null;
  };

  const { data: templates } = (await supabase
    .from("template")
    .select("id, name, header_image_url, sign_image_url, footer_image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })) as {
    data: TemplateType[] | null;
  };

  return (
    <div className="print:bg-white">
      <h1 className="print:hidden mb-6 font-semibold text-lg block">
        Medical Report
      </h1>
      <Report templates={templates} dicom={dicom} userId={userId} />
    </div>
  );
}
