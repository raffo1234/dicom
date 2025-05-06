"use client";

import { Icon } from "@iconify/react";
import { PropertyType } from "@/types/propertyState";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
type Inputs = {
  type: string;
  keywords: string;
};

export default function SearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameArray = pathname
    .split("/")
    .filter((segment: string) => segment !== "");

  const [isOpen, setIsOpen] = useState(false);
  const [typeInput, setTypeInput] = useState<string>(
    pathnameArray.length === 0
      ? PropertyType.APARTMENT
      : (pathnameArray?.at(0)?.toUpperCase() as PropertyType)
  );
  const { register, reset, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const keywords = encodeURIComponent(formData.keywords);
    router.push(`/${typeInput?.toLowerCase()}/${keywords}`);
  };

  useEffect(() => {
    if (pathnameArray.length > 0) {
      setTypeInput(
        pathnameArray.length === 0
          ? PropertyType.APARTMENT
          : (pathnameArray?.at(0)?.toUpperCase() as PropertyType)
      );
      if (pathnameArray[1]) {
        reset({ keywords: decodeURI(pathnameArray[1]) });
      }
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-20 w-full max-w-[600px] mx-auto relative z-10"
    >
      <div className="w-full hover:bg-white hover:border-cyan-100 focus-within:bg-white focus-within:border-cyan-100 border-2 transition-colors duration-500 border-gray-100 flex items-center bg-gray-100 rounded-full p-1 gap-2">
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="relative group"
        >
          <button
            type="button"
            className="h-[52px] pl-6 pr-3 bg-slate-200 font-semibold rounded-full flex items-center gap-1"
          >
            <span>
              {typeInput === PropertyType.APARTMENT ? "Depas" : "Casas"}
            </span>
            <div className="w-6">
              <Icon
                fontSize={24}
                icon="material-symbols-light:chevron-left-rounded"
                className={`${isOpen ? "rotate-90" : "-rotate-90"} transition-transform duration-200`}
              />
            </div>
          </button>
          <div
            className={`${isOpen ? "translate-y-0 visible opacity-100" : "-translate-y-1 invisible opacity-0"} absolute transition-all duration-500 top-full left-0 w-[120px] py-3`}
          >
            <div className="bg-white shadow-md rounded-[30px] p-2 flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setTypeInput(PropertyType.APARTMENT);
                  setIsOpen(false);
                }}
                className="w-full text-left px-5 py-3 hover:bg-slate-100 rounded-full"
              >
                Depas
              </button>
              <button
                onClick={() => {
                  setTypeInput(PropertyType.HOUSE);
                  setIsOpen(false);
                }}
                type="button"
                className="w-full text-left px-5 py-3 hover:bg-slate-100 rounded-full"
              >
                Casas
              </button>
            </div>
          </div>
        </div>
        <div className="flex-grow w-[100px]">
          <input
            type="search"
            {...register("keywords")}
            className="w-full flex-grow placeholder:text-gray-400 border-transparent border-2 focus:outline-none py-3 bg-transparent"
            placeholder="Buscar ..."
          />
        </div>
        <button
          type="submit"
          className="h-[52px] aspect-square rounded-full bg-cyan-400 hover:bg-cyan-500 active:bg-cyan-600 transition duration-700 flex items-center justify-center"
        >
          <Icon icon="mingcute:search-line" className="text-white text-2xl" />
        </button>
      </div>
    </form>
  );
}
