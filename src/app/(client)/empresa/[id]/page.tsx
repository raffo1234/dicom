import SearchForm from "@/components/SearchForm";
import { supabase } from "@/lib/supabase";
import PropertiesListByCompany from "@/components/PropertiesListByCompany";
import GetInTouch from "@/components/GetInTouch";
import { PropertyState } from "@/types/propertyState";
import { propertyQuery } from "@/queries/property";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { PropertyType } from "@/types/propertyType";

type Params = Promise<{ id: string[] }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: company } = await supabase
    .from("company")
    .select("id, name, logo_url, description")
    .eq("id", id)
    .single();

  const { data: properties } = (await supabase
    .from("property")
    .select(propertyQuery)
    .eq("company_id", id)
    .eq("state", PropertyState.ACTIVE)
    .order("created_at", { ascending: false })
    .limit(4)) as { data: PropertyType[] | null };

  if (!company) return null;

  return (
    <>
      <SearchForm />
      <div className="mb-5">
        <div className="flex items-center gap-3.5">
          <Image
            src={company.logo_url}
            width={150}
            height={150}
            className="mb-5"
            alt={company.name}
            priority={false}
            quality={70}
          />
          <h1 className="text-md lg:text-2xl font-semibold mb-4">
            {company.name}
          </h1>
        </div>
        <p className="text-lg">{company.description}</p>
      </div>
      <div className="mb-8">
        <GetInTouch
          companyId={company.id}
          companyName={company.name}
          companyLogo={company.logo_url}
        />
      </div>
      <PropertiesListByCompany
        userEmail={userEmail}
        properties={properties}
        companyId={company.id}
      />
    </>
  );
}
