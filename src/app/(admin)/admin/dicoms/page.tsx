import DicomsTable from "@/components/DicomsTable";
import { supabase } from "@/lib/supabase";
import { DicomType } from "@/types/dicomType";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

export default async function Page() {
  const { data: dicoms } = (await supabase
    .from("dicom")
    .select("*, user(id, image_url, first_name, last_name)")
    .order("created_at", { ascending: false })) as { data: DicomType[] | null };

  if (!dicoms) return null;

  return (
    <>
      <div className="flex mb-4 print:hidden items-center justify-between">
        <h1 className=" font-semibold text-lg block">Dicoms</h1>
        <Link
          href="/admin/dicom"
          title="Upload DICOM files"
          className="p-2 hover:text-cyan-400 transition-colors duration-300"
        >
          <Icon icon="solar:backspace-line-duotone" fontSize={36} />
        </Link>
      </div>
      <DicomsTable dicoms={dicoms} />
    </>
  );
}
