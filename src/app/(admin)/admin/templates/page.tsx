import AddTemplate from "@/components/AddTemplate";
import TemplatesTable from "@/components/TemplatesTable";

export default async function Page() {
  return (
    <>
      <h1 className="mb-6 font-semibold text-lg block">Templates</h1>
      <div className="border border-gray-200 rounded-xl bg-white">
        <TemplatesTable />
        <AddTemplate />
      </div>
    </>
  );
}
