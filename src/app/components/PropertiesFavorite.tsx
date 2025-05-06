"use client";

import PropertyItem from "./PropertyItem";
import PropertiesGrid from "./PropertiesGrid";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { favoriteQuery } from "@/queries/property";
import { supabase } from "@/lib/supabase";
import { PropertyState } from "@/types/propertyState";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";
import Link from "next/link";
import type { PropertyType } from "@/types/propertyType";

const fetcherAllFavorites = async (userId: string) => {
  const { count, error } = await supabase
    .from("like")
    .select("user_id, property(state)", { count: "exact", head: true })
    .eq("property.state", PropertyState.ACTIVE)
    .eq("user_id", userId);
  if (error) throw error;
  return count;
};

const fetcher = async (index: number, pageSize: number, userId: string) => {
  const { data } = (await supabase
    .from("like")
    .select(favoriteQuery)
    .eq("property.state", PropertyState.ACTIVE)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(index * pageSize, index * pageSize + pageSize - 1)) as {
    data: { property: PropertyType }[] | null;
  };

  return data;
};

function Page({
  page,
  pageSize,
  userEmail,
  setIsLoadingMore,
  userId,
}: {
  page: number;
  pageSize: number;
  setIsLoadingMore: (value: boolean) => void;
  userEmail: string | undefined | null;
  userId: string;
}) {
  const { data: likes, isLoading } = useSWR(
    `properties-${page}-favorites`,
    async () => await fetcher(page, pageSize, userId)
  );

  useEffect(() => {
    setIsLoadingMore(isLoading);
  }, [likes?.length, isLoading, setIsLoadingMore]);

  return likes?.map(({ property }) => {
    return (
      <PropertyItem
        key={property.id}
        userEmail={userEmail}
        property={property}
      />
    );
  });
}

export default function PropertiesFavorite({
  userEmail,
  likes,
  userId,
}: {
  userEmail: string;
  userId: string;
  likes: { property: PropertyType }[] | null;
}) {
  const initPage = 1;
  const pageSize = 4;
  const [page, setPage] = useState(initPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: total } = useSWR("total-properties-favorites-page", () =>
    fetcherAllFavorites(userId)
  );
  const totalPages = total ? Math.ceil((total - pageSize) / pageSize) : 0;
  const pages = [];

  for (let i = initPage; i < page; i++) {
    pages.push(
      <Page
        key={i}
        page={i}
        pageSize={pageSize}
        setIsLoadingMore={setIsLoadingMore}
        userEmail={userEmail}
        userId={userId}
      />
    );
  }

  if (likes?.length === 0) {
    return (
      <div className="max-w-md mx-auto items-center flex flex-col gap-10">
        <div className="flex justify-center w-[300px] rounded-full items-center mx-auto bg-cyan-500 aspect-square bg-opacity-5">
          <Icon icon="solar:home-smile-bold" className="text-3xl text-white" />
        </div>
        <h1 className="text-center">
          Tu próxima propiedad ideal podría estar esperándote. Explora nuestra
          selección y guarda las que capturen tu interés.
        </h1>
        <Link
          href="/"
          title="Ir al Inicio"
          className="text-lg flex items-center gap-2 px-6 pb-4 pt-3 bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
        >
          <Icon icon="solar:home-smile-angle-broken" fontSize={24}></Icon>
          <span>Ir al Inicio</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PropertiesGrid>
        {likes?.map(({ property }) => {
          if (property)
            return (
              <PropertyItem
                key={property.id}
                userEmail={userEmail}
                property={property}
              />
            );
        })}
        {pages.map((page) => page)}
      </PropertiesGrid>
      {!isLoadingMore && page <= totalPages ? (
        <InfiniteScrollSentinel
          onElementVisible={() => setPage((prev) => prev + 1)}
          loading={isLoadingMore}
        />
      ) : null}
    </>
  );
}
