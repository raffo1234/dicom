import { Icon } from "@iconify/react";

export default function FilterDropdown() {
  return (
    <div className="relative group">
      <button
        type="button"
        className="h-[52px] pl-6 pr-3 bg-slate-200 font-semibold rounded-full flex items-center gap-1"
      >
        <span> Depas </span>
        <Icon
          fontSize={24}
          icon="material-symbols-light:chevron-left-rounded"
          className="rotate-90 group-hover:-rotate-90 transition-transform duration-200"
        />
      </button>
      <div className="group-hover:translate-y-0 -translate-y-1 invisible group-hover:visible absolute group-hover:opacity-100 opacity-0 transition-all duration-500 top-full left-0 w-[140px] py-3">
        <div className="bg-white shadow-md rounded-[30px] p-2 flex flex-col">
          <button className="w-full text-left px-5 py-3 hover:bg-slate-100 rounded-full">
            Depas
          </button>
          <button className="w-full text-left px-5 py-3 hover:bg-slate-100 rounded-full">
            Casas
          </button>
        </div>
      </div>
    </div>
  );
}
