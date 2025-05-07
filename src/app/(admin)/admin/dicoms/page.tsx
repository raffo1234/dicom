import DicomsTable from "@/components/DicomsTable";
import { supabase } from "@/lib/supabase";
import { DicomType } from "@/types/dicomType";

export default async function Page() {
  const { data: dicoms } = (await supabase
    .from("dicom")
    .select("*, user(id, image_url, first_name, last_name)")
    .order("created_at", { ascending: false })) as { data: DicomType[] | null };

  if (!dicoms) return null;

  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Dicoms</h1>
      <DicomsTable dicoms={dicoms} />
    </>
  );
}
