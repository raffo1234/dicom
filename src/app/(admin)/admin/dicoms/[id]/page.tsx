import { supabase } from "@/lib/supabase";
import Report from "@/components/Report";
import { TemplateType } from "@/types/templateType";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id, role_id")
    .eq("email", userEmail)
    .single();

  const userId = user?.id;

  const { data: templates } = (await supabase
    .from("template")
    .select("id, name, header_image_url, sign_image_url, footer_image_url")
    .eq("user_id", userId)
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
