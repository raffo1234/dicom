import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Pagination from "@/components/Pagination";

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

  return <Pagination tableName="dicom" userId={userId} />;
}
