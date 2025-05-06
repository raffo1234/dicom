import { Icon } from "@iconify/react";
import { useGlobalState } from "@/lib/globalState";

export default function GlobalModal() {
  const { isEditModalOpen, editModalContent, setEditModalOpen } =
    useGlobalState();

  const onClose = () => {
    if (!isEditModalOpen) return;
    setEditModalOpen(false);
  };

  return (
    <section
      className={`${isEditModalOpen ? "translate-x-0 visible opacity-100" : "-translate-x-2 invisible opacity-0"} absolute left-0 top-0 h-full w-full transition-all z-10 duration-300 px-8 min-h-lvh md:px-10 py-12 bg-slate-50`}
    >
      <div className="mb-8 w-full flex justify-between items-center">
        <h1 className="font-semibold text-lg block">Editar Inmueble</h1>
        <button type="button" className="mb-4" onClick={onClose}>
          <Icon icon="solar:square-alt-arrow-left-broken" fontSize="42" />
        </button>
      </div>
      {editModalContent}
    </section>
  );
}
