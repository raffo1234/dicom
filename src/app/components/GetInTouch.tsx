"use client";

import { supabase } from "@/lib/supabase";
import { PropertyState } from "@/types/propertyState";
import { Button, message, Modal } from "antd";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputError from "./InputError";
import { Icon } from "@iconify/react";

const fetcher = async (companyId: string) => {
  const { data, error } = await supabase
    .from("property")
    .select(
      `
      id,
      title
    `
    )
    .eq("company_id", companyId)
    .eq("state", PropertyState.ACTIVE)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const formSchema = z.object({
  property_id: z
    .string()
    .min(1, { message: "Selecciona una opción" })
    .optional(),
  first_name: z.string().min(2, { message: "Nombre es requerido" }),
  last_name: z.string().min(2, { message: "Apellido es requerido" }),
  email: z
    .string()
    .min(1, { message: "Email es requerido" })
    .email({ message: "Ingresa un Email valido" }),
  phone: z.string().regex(/^([2-7]\d{7}|9\d{8})$/, {
    message: "Ingrese un teléfono valido.",
  }),
  dni: z
    .string()
    .length(8, { message: "El DNI debe tener 8 dígitos." })
    .regex(/^\d+$/, { message: "El DNI debe contener solo números." }),
  message: z.string().min(2, { message: "Mensaje es requerido" }),
});

type Inputs = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni: string;
  message: string;
  property_id?: string;
};

export default function GetInTouch({
  companyId,
  propertyId,
  companyLogo,
  companyName,
  propertyTitle,
}: {
  companyId?: string;
  propertyId?: string;
  propertyTitle?: string;
  companyName: string;
  companyLogo: string;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const success = () => {
    messageApi.open({
      type: "success",
      content:
        "Hemos recibido tu mensaje correctamente. Gracias por contactarnos.",
    });
  };

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const { data: properties = [], isLoading } = useSWR(
    `${companyId || propertyId}-get-in-touch-company`,
    () => (companyId ? fetcher(companyId) : null)
  );

  const showModal = () => {
    setIsModalOpen(true);
  };

  const hideModal = () => {
    setIsModalOpen(false);
  };

  const sendInquiry = () => {
    showModal();
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const { data: createdInquiry } = await supabase
        .from("inquiry")
        .insert({ ...data, ...(propertyId && { property_id: propertyId }) })
        .select()
        .single();
      if (createdInquiry) {
        hideModal();
        reset();
        success();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {contextHolder}
      <button
        onClick={sendInquiry}
        type="button"
        className="block px-6 py-2 bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
      >
        <Icon
          icon="solar:document-add-broken"
          fontSize={24}
          className="lg:hidden block"
        />
        <span className="hidden lg:block">Contactar</span>
      </button>
      <Modal
        footer={null}
        style={{ top: 20 }}
        open={isModalOpen}
        onCancel={hideModal}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="py-4 px-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src={companyLogo} alt={companyName} className="w-20" />
              <div>
                <h3 className="font-bold text-xl mb-2">
                  Ponte en contacto con {companyName}.
                </h3>
                <p>Descubre: {propertyTitle}</p>
              </div>
            </div>
            {companyId ? (
              <div>
                <label
                  htmlFor="property_id"
                  className="inline-block mb-2 font-semibold"
                >
                  Inmueble de tu interes
                </label>
                <select
                  id="property_id"
                  {...register("property_id")}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    {isLoading ? "Cargando ..." : "Selecciona"}
                  </option>
                  {properties?.map(({ id, title }) => {
                    return (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    );
                  })}
                </select>
                <InputError>
                  {errors.property_id && errors.property_id.message}
                </InputError>
              </div>
            ) : null}
            <div>
              <label
                htmlFor="email"
                className="inline-block mb-2 font-semibold"
              >
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>{errors.email && errors.email.message}</InputError>
            </div>
            <div>
              <label
                htmlFor="first_name"
                className="inline-block mb-2 font-semibold"
              >
                Nombres
              </label>
              <input
                {...register("first_name")}
                id="first_name"
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>
                {errors.first_name && errors.first_name.message}
              </InputError>
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="inline-block mb-2 font-semibold"
              >
                Apellidos
              </label>
              <input
                {...register("last_name")}
                id="last_name"
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>
                {errors.last_name && errors.last_name.message}
              </InputError>
            </div>
            <div>
              <label htmlFor="dni" className="inline-block mb-2 font-semibold">
                DNI
              </label>
              <input
                {...register("dni")}
                id="dni"
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>{errors.dni && errors.dni.message}</InputError>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="inline-block mb-2 font-semibold"
              >
                Teléfono
              </label>
              <input
                {...register("phone")}
                id="phone"
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>{errors.phone && errors.phone.message}</InputError>
            </div>
            <div>
              <label
                htmlFor="message"
                className="inline-block mb-2 font-semibold"
              >
                Mensaje
              </label>
              <textarea
                {...register("message")}
                id="message"
                className="w-full block px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
              />
              <InputError>
                {errors.message && errors.message.message}
              </InputError>
            </div>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              shape="round"
              className="py-6 mt-4"
            >
              Enviar Mensaje
            </Button>
          </fieldset>
        </form>
      </Modal>
    </>
  );
}
