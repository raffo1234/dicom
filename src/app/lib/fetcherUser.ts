import { supabase } from "./supabase";

const fetcherUser = async (userEmail: string) => {
  const { data, error } = await supabase
    .from("user")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (error) throw error;
  return data;
};

export const useKeyUser = (userEmail: string | null | undefined) =>
  `${userEmail}-user-id`;

export default fetcherUser;
