import EditPropertyInformation from "@/components/EditPropertyInformation";
import PropertyTypologies from "@/components/PropertyTypologies";
import Tabs from "@/components/Tabs";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const userEmail = session?.user?.email;

  const { data: user } = await supabase
    .from("user")
    .select("id")
    .eq("email", userEmail)
    .single();

  const items = [
    {
      label: "General",
      children: <EditPropertyInformation id={id} userId={user?.id} />,
    },
    {
      label: "Tipologias",
      children: <PropertyTypologies propertyId={id} />,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="mb-6 font-semibold text-lg block">Edit Inmueble</h1>
        <Link href="/admin/property" title="Volver" className="mb-4">
          <Icon icon="solar:square-alt-arrow-left-broken" fontSize="32" />
        </Link>
      </div>
      <Tabs items={items} />;
    </>
  );
}
