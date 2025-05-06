"use client";

import PropertyItem from "./PropertyItem";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PropertyState } from "@/types/propertyState";
import useSWR from "swr";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";
import { propertyQuery } from "@/queries/property";
import { PropertyType } from "@/types/propertyType";

const fetcherAll = async () => {
  const { count, error } = await supabase
    .from("property")
    .select("id", { count: "exact", head: true })
    .eq("state", PropertyState.ACTIVE);
  if (error) throw error;
  return count;
};

const fetcher = async (index: number, pageSize: number) => {
  const { data } = (await supabase
    .from("property")
    .select(propertyQuery)
    .eq("state", PropertyState.ACTIVE)
    .order("created_at", { ascending: false })
    .range(index * pageSize, index * pageSize + pageSize - 1)) as {
    data: PropertyType[] | null;
  };

  return data;
};

function Page({
  page,
  pageSize,
  userEmail,
  setIsLoadingMore,
}: {
  page: number;
  pageSize: number;
  setIsLoadingMore: (value: boolean) => void;
  userEmail: string | undefined | null;
}) {
  const { data: properties, isLoading } = useSWR(
    `properties-${page}-home`,
    async () => await fetcher(page, pageSize)
  );

  useEffect(() => {
    setIsLoadingMore(isLoading);
  }, [properties?.length, isLoading, setIsLoadingMore]);

  return properties?.map((property) => (
    <PropertyItem key={property.id} userEmail={userEmail} property={property} />
  ));
}

export default function PropertiesList({
  userEmail,
}: {
  userEmail: string | undefined | null;
}) {
  const initPage = 1;
  const pageSize = 4;
  const [page, setPage] = useState(initPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: total } = useSWR("total-properties-home-page", fetcherAll);
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
      />
    );
  }

  return (
    <>
      {pages.map((page) => page)}
      {!isLoadingMore && page <= totalPages ? (
        <InfiniteScrollSentinel
          onElementVisible={() => setPage((prev) => prev + 1)}
          loading={isLoadingMore}
        />
      ) : null}
    </>
  );
}
