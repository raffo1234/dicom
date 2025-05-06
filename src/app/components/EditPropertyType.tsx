"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { supabase } from "@/lib/supabase";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button, message } from "antd";
import FormSkeleton from "./FormSkeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Inputs = {
  size: string;
  price: string;
  name: string;
  description: string;
  bathroom_count: number;
  bed_count: number;
  stock: string;
  floor: string;
};

async function fetcher(id: string) {
  const { data, error } = await supabase
    .from("typology")
    .select()
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export default function EditPropertyType({ id }: { id: string }) {
  const [displayEditForm, setDisplayEditForm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { data, error, isLoading } = useSWR(id, () => fetcher(id));

  const { reset, register, handleSubmit } = useForm<Inputs>({
    mode: "onBlur",
    defaultValues: useMemo(() => {
      return data;
    }, [data]),
  });

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Item updated successfully!",
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const { data: updatedData } = await supabase
        .from("typology")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      await mutate(id, updatedData);
      success();
    } catch (error) {
      console.error(error);
    }
  };

  const onClick = () => {
    setDisplayEditForm((prev) => !prev);
  };

  useEffect(() => {
    reset(data);
  }, [data]);

  if (error) return <div>Error loading item details</div>;

  return isLoading ? (
    <FormSkeleton rows={2} />
  ) : (
    <>
      {contextHolder}
      {!displayEditForm ? (
        <button onClick={onClick}>Edit</button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} id="editProperty">
          <fieldset className="flex flex-col gap-4">
            <div>
              <span className="mb-2 font-bold font-manrope">Creado: </span>
              <span>
                {format(new Date(data.created_at), "dd MMMM, yyyy", {
                  locale: es,
                })}
              </span>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block font-bold mb-2 font-manrope"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block font-bold mb-2 font-manrope"
              >
                Descripcion
              </label>
              <textarea
                id="description"
                {...register("description")}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <footer className="flex items-center gap-2 pt-4 mt-4 justify-end">
              <Button htmlType="button">Cancel</Button>
              <Button htmlType="submit" type="primary">
                Guardar
              </Button>
            </footer>
          </fieldset>
        </form>
      )}
    </>
  );
}
