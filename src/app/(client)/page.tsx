import PropertiesList from "@/components/PropertiesList";
import { auth } from "@/lib/auth";
import { propertyQuery } from "@/queries/property";
import { PropertyState } from "@/types/propertyState";
import { supabase } from "@/lib/supabase";
import PropertiesGrid from "@/components/PropertiesGrid";
import PropertyItem from "@/components/PropertyItem";
import SearchForm from "@/components/SearchForm";
import HightLightSelect from "@/components/HighLightSelect";
import { PropertyType } from "@/types/propertyType";

export default async function Index() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: properties } = (await supabase
    .from("property")
    .select(propertyQuery)
    .eq("state", PropertyState.ACTIVE)
    .order("created_at", { ascending: false })
    .limit(4)) as { data: PropertyType[] | null };

  return (
    <>
      <h2
        style={{
          fontSize: "clamp(16px, 6vw + .5rem, 50px)",
        }}
        className="mb-10 leading-relaxed w-full text-center"
      >
        Encuentra tu próximo <br /> hogar
      </h2>
      <SearchForm />
      <HightLightSelect />
      <PropertiesGrid>
        {properties?.map((property) => {
          return (
            <PropertyItem
              key={property.id}
              userEmail={userEmail}
              property={property}
            />
          );
        })}
        <PropertiesList userEmail={userEmail} />
      </PropertiesGrid>
    </>
  );
}
