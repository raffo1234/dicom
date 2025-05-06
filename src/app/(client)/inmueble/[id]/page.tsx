import Property from "@/components/Property";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PropertyType } from "@/types/propertyType";
import { redirect } from "next/navigation";

type Params = Promise<{ id: string[] }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: property } = (await supabase
    .from("property")
    .select(
      `
      id,
      title,
      description,
      state,
      user_id,
      size,
      delivery_at,
      bathroom_count,
      phase,
      price,
      location,
      bedroom_count,
      company_id,
      user!property_user_id_fkey (
        id,
        name,
        image_url
      ),
      company!property_company_id_fkey (
        id,
        name,
        logo_url
      ),
      typology (
        id,
        name,
        description,
        price,
        size,
        stock,
        bathroom_count,
        bedroom_count
      )
    `
    )
    .eq("id", id)
    .single()) as { data: PropertyType };

  if (!property) {
    console.error("Error fetching item");
    return { notFound: true };
  }

  if (!id || !property) {
    redirect("/404");
  }

  return <Property property={property} userEmail={userEmail} />;
}
