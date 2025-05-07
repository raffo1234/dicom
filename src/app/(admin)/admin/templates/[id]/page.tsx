import EditTemplate from "@/components/EditTemplate";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  return <EditTemplate id={id} />;
}
