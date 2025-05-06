import Uploader from "@/components/Uploader";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
// import DicomDataReader from "@/components/DicomDataReader";
import DicomMetadataUpload from "@/components/DicomUploadForm";

export default async function Page() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id")
    .eq("email", userEmail)
    .single();

  const userId = user?.id;

  if (!userId) return null;

  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Archivo Dicom</h1>
      <Uploader userId={userId} />
      {/* <DicomDataReader /> */}

      <DicomMetadataUpload />
    </>
  );
}
