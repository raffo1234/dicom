import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import useSWR, { mutate } from "swr";

type Typology = {
  id: string;
};

async function fetcher(propertyId: string): Promise<Typology[]> {
  const { data, error } = await supabase
    .from("typology")
    .select()
    .eq("property_id", propertyId);
  if (error) throw error;
  return data;
}

export default function DeletePropertyType({
  propertyId,
  id,
}: {
  propertyId: string;
  id: string;
}) {
  const { data: typologies } = useSWR(`${propertyId}-typologies`, () =>
    fetcher(propertyId)
  );
  const onDelete = async (id: string) => {
    const confirmationMessage = confirm(
      "Esta acción es irreversible. Esta seguro?"
    );
    if (!confirmationMessage) return;

    try {
      const { data: deletedTypology } = await supabase
        .from("typology")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (deletedTypology && typologies) {
        await mutate(
          `${propertyId}-types`,
          typologies.filter((typology) => typology.id !== deletedTypology.id),
          false
        );
      }
    } catch (error) {
      console.error(`Error eliminando este item: ${error}`);
    }
  };

  return (
    <button
      onClick={() => onDelete(id)}
      type="button"
      className="w-12 h-12 flex items-center justify-center"
    >
      <Icon
        icon="material-symbols-light:delete-outline"
        className="text-3xl text-red-500"
      />
    </button>
  );
}
