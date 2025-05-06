"use client";

import { NumericFormat } from "react-number-format";
import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { supabase } from "@/lib/supabase";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import {
  PropertyCurrency,
  PropertyPhase,
  PropertyState,
  PropertyType,
} from "@/types/propertyState";
import { message } from "antd";
import FormSkeleton from "./FormSkeleton";
import Uploader from "./Uploader";
import { Icon } from "@iconify/react";
import { getAdminPropertiesUserKey } from "@/constants";
import PropertyImagesEdition from "./PropertyImagesEdition";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createNumberMask } from "text-mask-addons";

type Inputs = {
  title: string;
  description: string;
  location: string;
  state: string;
  phase: string;
  type: string;
  bathroom_count: string;
  bedroom_count: string;
  company_id: string;
  size: string;
  price: string;
  created_at: string;
  delivery_at: string;
  currency: string;
  property_image?: {
    image_url: string;
  }[];
};

async function fetcher(id: string) {
  const { data, error } = await supabase
    .from("property")
    .select("*, property_image(image_url)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function fetcherCompany(userId: string) {
  const { data, error } = await supabase
    .from("company")
    .select("id, name")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export default function EditPropertyInformation({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: companies } = useSWR(`${userId}-companies`, () =>
    fetcherCompany(userId)
  );
  const {
    data,
    error,
    isLoading,
    mutate: mutateProperty,
  } = useSWR(id, () => fetcher(id));
  const { reset, register, handleSubmit, control } = useForm<Inputs>({
    mode: "onBlur",
  });

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Item updated successfully!",
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { property_image, ...rest } = data;
    try {
      await supabase
        .from("property")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      await mutateProperty();
      await mutate(() => getAdminPropertiesUserKey(userId));
      success();
    } catch {
      console.error(error);
      console.error({ property_image });
    } finally {
      redirect("/admin/property");
    }
  };

  const mutatePropertyImages = () => {
    mutate(() => getAdminPropertiesUserKey(userId));
  };

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  if (error) return <div>Error cargando datos ...</div>;

  return isLoading ? (
    <FormSkeleton rows={2} />
  ) : (
    <>
      {contextHolder}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start gap-6">
          <nav className="hidden xl:block rounded-xl border border-gray-100 w-60">
            <button
              type="button"
              className="bg-white px-6 py-3 text-left block border-b rounded-t-xl border-gray-100 w-full hover:bg-gray-50"
            >
              Informacion Basica
            </button>
            <button
              type="button"
              className="bg-white px-6 py-3 text-left block border-b border-gray-100 w-full hover:bg-gray-50 "
            >
              Detalles
            </button>
            <button
              type="button"
              className="bg-white px-6 py-3 text-left block w-full hover:bg-gray-50 rounded-b-xl"
            >
              Photos
            </button>
          </nav>
          <div className="flex-1 flex flex-col gap-7">
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Subir Imágenes</h2>
              <Uploader
                propertyId={id}
                onUploadSuccess={mutatePropertyImages}
              />
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Imágenes</h2>
              <PropertyImagesEdition propertyImages={data.property_image} />
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Estado</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <div className="w-1/2">
                  <input
                    {...register("state")}
                    type="radio"
                    id="state_1"
                    value={PropertyState.DRAFT}
                    className="peer hidden"
                    defaultChecked
                  />
                  <label
                    htmlFor="state_1"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:document-add-broken"
                        fontSize={24}
                        className="block"
                      />
                      <span>Borrador</span>
                    </span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("state")}
                    value={PropertyState.PENDING}
                    type="radio"
                    id="state_2"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="state_2"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:checklist-minimalistic-broken"
                        fontSize={24}
                        className="block"
                      />
                      <span>Pendiente</span>
                    </span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("state")}
                    value={PropertyState.ACTIVE}
                    type="radio"
                    id="state_3"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="state_3"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:shield-network-broken"
                        fontSize={24}
                        className="block"
                      />
                      <span>Publicado</span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Tipo</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <div className="w-1/2">
                  <input
                    {...register("type")}
                    type="radio"
                    id="type_1"
                    value={PropertyType.APARTMENT}
                    className="peer hidden"
                    defaultChecked
                  />
                  <label
                    htmlFor="type_1"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:buildings-broken"
                        fontSize={32}
                        className="block"
                      />
                      <span>Departamento</span>
                    </span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("type")}
                    value={PropertyType.HOUSE}
                    type="radio"
                    id="type_2"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="type_2"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:home-2-broken"
                        fontSize={32}
                        className="block"
                      />
                      <span>Casa</span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Empresa</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <select
                  id="company_id"
                  {...register("company_id")}
                  required
                  className="w-full -m-[1px] px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                >
                  {companies?.map(({ id, name }) => {
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Fase</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <div className="w-1/2">
                  <input
                    {...register("phase")}
                    type="radio"
                    id="phase_1"
                    value={PropertyPhase.PLANOS}
                    className="peer hidden"
                    defaultChecked
                  />
                  <label
                    htmlFor="phase_1"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:wallpaper-broken"
                        fontSize={24}
                        className="block"
                      />
                      <span>En Planos</span>
                    </span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("phase")}
                    value={PropertyPhase.CONSTRUCCION}
                    type="radio"
                    id="phase_2"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="phase_2"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:chart-broken"
                        fontSize={24}
                        className="block"
                      />
                      <span>En Construccion</span>
                    </span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("phase")}
                    value={PropertyPhase.READY}
                    type="radio"
                    id="phase_3"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="phase_3"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    <span className="flex items-center flex-col gap-1">
                      <Icon
                        icon="solar:key-square-2-outline"
                        fontSize={24}
                        className="block"
                      />
                      <span>Entrega Inmediata</span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Dormitorios</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <div className="w-1/2">
                  <input
                    {...register("bedroom_count")}
                    type="radio"
                    id="bedroom_count_1"
                    value={1}
                    className="peer hidden"
                    defaultChecked
                  />
                  <label
                    htmlFor="bedroom_count_1"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    1
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bedroom_count")}
                    value={2}
                    type="radio"
                    id="bedroom_count_2"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bedroom_count_2"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    2
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bedroom_count")}
                    value={3}
                    type="radio"
                    id="bedroom_count_3"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bedroom_count_3"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    3
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bedroom_count")}
                    value={4}
                    type="radio"
                    id="bedroom_count_4"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bedroom_count_4"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    4
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bedroom_count")}
                    value={5}
                    type="radio"
                    id="bedroom_count_5"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bedroom_count_5"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    5
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Ba&ntilde;os</h2>
              <fieldset className="flex items-center gap-4 w-full">
                <div className="w-1/2">
                  <input
                    {...register("bathroom_count")}
                    type="radio"
                    id="bathroom_count_1"
                    value={1}
                    className="peer hidden"
                    defaultChecked
                  />
                  <label
                    htmlFor="bathroom_count_1"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    1
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bathroom_count")}
                    value={2}
                    type="radio"
                    id="bathroom_count_2"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bathroom_count_2"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    2
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bathroom_count")}
                    value={3}
                    type="radio"
                    id="bathroom_count_3"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bathroom_count_3"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    3
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bathroom_count")}
                    value={4}
                    type="radio"
                    id="bathroom_count_4"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bathroom_count_4"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    4
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    {...register("bathroom_count")}
                    value={5}
                    type="radio"
                    id="bathroom_count_5"
                    className="peer hidden"
                  />
                  <label
                    htmlFor="bathroom_count_5"
                    className="flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:bg-cyan-50"
                  >
                    5
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Detalles</h2>
              <div className="flex gap-5 items-center">
                <fieldset>
                  <div className="flex gap-5 items-center">
                    <div>
                      <label className="inline-block mb-2 text-sm">
                        Moneda
                      </label>
                      <div className="flex items-center">
                        <div className="w-1/2">
                          <input
                            {...register("currency")}
                            value={PropertyCurrency.SOLES}
                            type="radio"
                            id="currency_soles"
                            className="peer hidden"
                          />
                          <label
                            htmlFor="currency_soles"
                            className="relative flex items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-l-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:z-10 peer-checked:bg-cyan-50"
                          >
                            Soles
                          </label>
                        </div>
                        <div className="w-1/2 -ml-[1px]">
                          <input
                            {...register("currency")}
                            value={PropertyCurrency.DOLARES}
                            type="radio"
                            id="currency_dolares"
                            className="peer hidden"
                          />
                          <label
                            htmlFor="currency_dolares"
                            className="flex relative items-center justify-center aspect-[4/2] transition-all duration-300 cursor-pointer select-none rounded-r-xl p-2 text-center border peer-checked:border-cyan-500 peer-checked:z-10 peer-checked:bg-cyan-50"
                          >
                            Dolares
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="price"
                        className="inline-block mb-2 text-sm"
                      >
                        Precio
                      </label>
                      <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                          <NumericFormat
                            type="text"
                            id="price"
                            required
                            thousandSeparator=","
                            decimalSeparator="."
                            decimalScale={2}
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.floatValue);
                            }}
                            inputMode="numeric"
                            className="w-full -m-[1px] px-3 py-2.5 focus:z-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                          />
                        )}
                      />
                    </div>
                  </div>
                </fieldset>
                <fieldset>
                  <label htmlFor="size" className="inline-block mb-2 text-sm">
                    Tama&ntilde;o (m<sup>2</sup> )
                  </label>
                  <input
                    type="number"
                    id="size"
                    {...register("size")}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                  />
                </fieldset>
              </div>
            </div>
            <div className="flex p-7 flex-col gap-4 border border-gray-100 rounded-xl bg-white">
              <h2 className="font-semibold">Information Basica</h2>
              <fieldset>
                <label htmlFor="title" className="inline-block mb-2 text-sm">
                  Titulo
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title")}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                />
              </fieldset>
              <fieldset>
                <label htmlFor="location" className="inline-block mb-2 text-sm">
                  Ubicacion
                </label>
                <input
                  type="text"
                  id="location"
                  {...register("location")}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                />
              </fieldset>
              <fieldset>
                <label
                  htmlFor="description"
                  className="inline-block mb-2 text-sm"
                >
                  Descripcion
                </label>
                <textarea
                  id="decription"
                  {...register("description")}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
                />
              </fieldset>
            </div>
            <footer className="justify-end flex items-center gap-2">
              <Link
                href={`/admin/property`}
                className="font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 bg-white text-sm border border-gray-100 rounded-lg transition-colors hover:border-gray-200 duration-500 active:border-gray-300"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="text-white font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 text-sm bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
              >
                Guardar
              </button>
            </footer>
          </div>
        </div>
      </form>
    </>
  );
}
