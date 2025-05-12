import CheckPermission from "@/components/CheckPermission";
import FallbackPermission from "@/components/FallbackPermission";
import Uploader from "@/components/Uploader";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
// import DicomMetadataUploadLargeFile from "@/components/DicomMetadataUploadLargeFile";
import { Permissions } from "@/types/propertyState";

export default async function Page() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id, role_id")
    .eq("email", userEmail)
    .single();

  const userId = user?.id;

  if (!userId) return null;

  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">
        Upload Files{" "}
        <span className="text-sm text-gray-500 font-normal">
          Compressed files containing (.dcm) files
        </span>
      </h1>
      <CheckPermission
        userRoleId={user.role_id}
        requiredPermission={Permissions.CARGAR_DICOM}
        fallback={<FallbackPermission />}
      >
        <Uploader userId={userId} />
      </CheckPermission>
      {/* <DicomMetadataUploadLargeFile /> */}
    </>
  );
}
