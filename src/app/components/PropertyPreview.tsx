"use client";

import { useEffect } from "react";
import Property from "./Property";
import { useGlobalState } from "@/lib/globalState";
import useSWR from "swr";
import { PropertyState } from "@/types/propertyState";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { PropertyType } from "@/types/propertyType";

const fetcher = async (propertyId: string) => {
  const { data } = (await supabase
    .from("property")
    .select(
      `
      id,
      title,
      description,
      state,
      user_id,
      size,
      delivery_at,
      bathroom_count,
      phase,
      price,
      location,
      bedroom_count,
      company_id,
      user!property_user_id_fkey (
        id,
        email,
        name,
        image_url
      ),
      company!property_company_id_fkey (
        id,
        name,
        logo_url
      ),
      typology (
        id,
        name,
        description,
        price,
        size,
        stock,
        bathroom_count,
        bedroom_count
      )
    `
    )
    .eq("state", PropertyState.ACTIVE)
    .eq("id", propertyId)
    .order("created_at", { ascending: false })
    .single()) as { data: PropertyType | null };

  return data;
};

export default function PropertyPreview({
  currentHref,
  userEmail,
}: {
  currentHref: string;
  userEmail: string | undefined | null;
}) {
  const { propertyId, hide, isDisplayed } = useGlobalState();

  const { data: property } = useSWR(propertyId, () =>
    propertyId ? fetcher(propertyId) : null
  );
  const onClose = (event?: React.MouseEvent<HTMLElement>) => {
    if (!isDisplayed) return;

    if (event) {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    hide();
    const app = document.getElementById("app") as HTMLElement;
    window.history.pushState({}, "", currentHref);
    setTimeout(() => {
      app.classList.remove("overflow-hidden");
    }, 50);
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keyup", function (event) {
      if (isDisplayed) {
        handleEscape(event);
      }
    });

    window.addEventListener("popstate", function () {
      if (isDisplayed) {
        handleClose();
      }
    });

    return () => {
      document.removeEventListener("keyup", function (event) {
        if (isDisplayed) {
          handleEscape(event);
        }
      });

      window.removeEventListener("popstate", function () {
        if (isDisplayed) {
          handleClose();
        }
      });
    };
  }, [isDisplayed]);

  return (
    <div
      onClick={(event) => onClose(event)}
      className={`${isDisplayed ? "bg-opacity-40 visible" : "opacity-0 invisible"} bg-black fixed z-30 top-0 cursor-pointer left-0 w-full h-full overflow-auto lg:p-6 bg-opacity-40 transition-all duration-200`}
    >
      <div
        className={`${isDisplayed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-80"} transition-all duration-200 max-w-[1816px] py-20 px-4 animate-slideUp cursor-default mx-auto relative delay-50 transform-all lg:rounded-lg bg-white min-h-lvh`}
      >
        <div className="mx-auto max-w-[1024px] w-full">
          <Property property={property} userEmail={userEmail} />
        </div>
        <button
          type="button"
          className="absolute right-3 transition-colors duration-300 top-3 rounded-full p-3 hover:text-cyan-400"
          onClick={() => onClose()}
        >
          <Icon icon="solar:close-circle-broken" fontSize="42" />
        </button>
      </div>
    </div>
  );
}
