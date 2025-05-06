import Uploader from "@/components/Uploader";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
// import DicomMetadataUploadLargeFile from "@/components/DicomMetadataUploadLargeFile";

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
      <h1 className="mb-6 font-semibold text-lg block">
        Upload Dicom{" "}
        <span className="text-sm text-gray-500 font-normal">
          (Zip with .dcim files)
        </span>
      </h1>
      <Uploader userId={userId} />
      {/* <DicomMetadataUploadLargeFile /> */}
    </>
  );
}
