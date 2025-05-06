import UsersTable from "@/components/UsersTable";
import { supabase } from "@/lib/supabase";
import { UserType } from "@/types/userType";

export default async function Page() {
  const { data: users } = (await supabase
    .from("user")
    .select(
      `
      id,
      image_url,
      name,
      username,
      email,
      role_id,
      role(id, name)
      `
    )
    .order("created_at", { ascending: false })) as { data: UserType[] | null };

  return <UsersTable users={users} />;
}
