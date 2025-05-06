import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { getAdminPropertiesUserKey } from "@/constants";
import { mutate } from "swr";

export default function DeleteProperty({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const onDelete = async (id: string) => {
    const confirmationMessage = confirm(
      "Esta acción es irreversible. Esta seguro?"
    );
    if (!confirmationMessage) return;

    try {
      const { data: deletedProperty } = await supabase
        .from("property")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (deletedProperty) {
        await mutate(getAdminPropertiesUserKey(userId));
      }
    } catch (error) {
      console.error(`Error eliminando este item: ${error}`);
    }
  };

  return (
    <button
      onClick={() => onDelete(id)}
      type="button"
      className="w-11 h-11 rounded-full border-gray-100 border text-red-500 flex items-center justify-center"
    >
      <Icon icon="solar:trash-bin-minimalistic-broken" fontSize={24} />
    </button>
  );
}
