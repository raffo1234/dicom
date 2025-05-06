"use client";

import { supabase } from "@/lib/supabase";
import useSWR from "swr";
import TypologiesGrid from "./TypologiesGrid";
import { Icon } from "@iconify/react";
import { Button } from "antd";

type Typology = {
  id: string;
  name: string;
  description: string;
  size: string;
  price: string;
  bathroom_count: string;
  bedroom_count: string;
  floor: string;
  stock: string;
};

const fetcher = async (propertyId: string) => {
  const { data, error } = await supabase
    .from("typology")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

function Typology({ typology }: { typology: Typology }) {
  const { name, id, size, bedroom_count, bathroom_count, price, floor } =
    typology;
  return (
    <div key={id}>
      <div className="relative mb-4">
        <button className="relative group block">
          <img
            src="/"
            className="block w-full aspect-[4/3] object-cover rounded-lg z-10 relative"
            alt={name}
          />
          <span className="z-20 group-hover:opacity-100 flex justify-center opacity-0 duration-500 ease-in-out rounded-lg absolute left-0 top-0 items-center w-full h-full bg-black bg-opacity-30 transition-all">
            <Icon
              icon="lets-icons:img-out-box-duotone-line"
              className="text-[40px] text-white"
            />
          </span>
        </button>
        <Button
          color="cyan"
          variant="solid"
          className="block absolute right-2 bottom-3.5 z-30 pb-1"
          size="large"
        >
          Cotizar
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-black rounded-full"></div>
          <p>{name}</p>
        </div>
        <div className="justify-center flex items-center p-3 bg-orange-100 rounded-md">
          <p className="font-semibold">S/. {price}</p>
        </div>
        <div
          className="grid gap-1 rounded-md"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
            <Icon icon="mdi:floor-plan" className="text-2xl text-[#F3B408]" />
            <p className="text-sm">
              {size} m<sup>2</sup>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
            <Icon
              icon="lucide:bed-double"
              className="text-2xl text-[#476CF6]"
            />
            <p className="text-sm">{bedroom_count} Dorms.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
            <Icon
              icon="lucide-lab:shower"
              className="text-2xl text-[#2FCCCC]"
            />
            <p className="text-sm">{bathroom_count} Ba&ntilde;os</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
            <Icon
              icon="carbon:skill-level"
              className="text-xl text-[#8C75FF]"
            />
            <p className="text-sm">Pisos: {floor}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Typologies({ propertyId }: { propertyId: string }) {
  const { data: typologies = [] } = useSWR(`${propertyId}-typologies`, () =>
    fetcher(propertyId)
  );

  return typologies.length > 0 ? (
    <>
      <h3 className="mb-6 text-xl font-semibold">Encuentra tu modelo ideal:</h3>
      <TypologiesGrid>
        {typologies.map((typology) => {
          return <Typology key={typology.id} typology={typology} />;
        })}
      </TypologiesGrid>
    </>
  ) : null;
}
