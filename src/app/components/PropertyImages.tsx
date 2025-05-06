"use client";

import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { Carousel } from "antd";
import useSWR from "swr";
import Image from "next/image";

const fetcher = async (propertyId: string) => {
  const { data, error } = await supabase
    .from("property_image")
    .select("id, image_url")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export default function PropertyImages({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const { data: images, isLoading } = useSWR(`${propertyId}-images`, () =>
    fetcher(propertyId)
  );

  return (
    <div className="relative w-full aspect-[5/4]">
      {images?.length === 1 ? (
        <Image
          src={images[0].image_url}
          alt={propertyTitle}
          title={propertyTitle}
          loading="lazy"
          className="w-full aspect-[5/4] object-cover rounded-lg"
          priority={false}
          quality={70}
          fill
        />
      ) : (
        <Carousel
          arrows
          draggable
          infinite={false}
          autoplay={{ dotDuration: true }}
          autoplaySpeed={3000}
        >
          {images?.map((image, index) => {
            return (
              <img
                key={index}
                src={image.image_url}
                alt={propertyTitle}
                title={propertyTitle}
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-lg"
              />
            );
          })}
        </Carousel>
      )}
      <div
        className={`${images?.length === 0 || isLoading ? "opacity-100" : "opacity-0"} absolute left-0 top-0 h-full transition-opacity duration-500 bg-gray-100 rounded-xl w-full aspect-[5/4] flex justify-center items-center`}
      >
        <Icon
          icon="solar:gallery-broken"
          fontSize={64}
          className="text-gray-400"
        />
      </div>
    </div>
  );
}
