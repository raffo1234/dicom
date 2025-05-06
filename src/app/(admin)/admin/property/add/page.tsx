import AddProperty from "@/components/AddProperty";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default async function Page() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id")
    .eq("email", userEmail)
    .single();

  const userId = user?.id;

  return <>{userId ? <AddProperty userId={userId} /> : null}</>;
}
