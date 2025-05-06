"use client";

import PropertyItem from "./PropertyItem";
import PropertiesGrid from "./PropertiesGrid";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { propertyQuery } from "@/queries/property";
import { PropertyState } from "@/types/propertyState";
import { supabase } from "@/lib/supabase";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";
import { PropertyType } from "@/types/propertyType";

const fetcherAllByCompany = async (companyId: string) => {
  const { count, error } = await supabase
    .from("property")
    .select("id", { count: "exact", head: true })
    .eq("state", PropertyState.ACTIVE)
    .eq("company_id", companyId);
  if (error) throw error;
  return count;
};

const fetcher = async (index: number, pageSize: number, companyId: string) => {
  const { data } = (await supabase
    .from("property")
    .select(propertyQuery)
    .eq("company_id", companyId)
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
  companyId,
}: {
  page: number;
  pageSize: number;
  setIsLoadingMore: (value: boolean) => void;
  userEmail: string | undefined | null;
  companyId: string;
}) {
  const { data: properties, isLoading } = useSWR(
    `properties-${page}-home`,
    async () => await fetcher(page, pageSize, companyId)
  );

  useEffect(() => {
    setIsLoadingMore(isLoading);
  }, [properties?.length]);

  return properties?.map((property) => (
    <PropertyItem key={property.id} userEmail={userEmail} property={property} />
  ));
}

export default function PropertiesListByCompany({
  userEmail,
  properties,
  companyId,
}: {
  userEmail: string | null | undefined;
  properties: PropertyType[] | null;
  companyId: string;
}) {
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: total } = useSWR("total-properties-home-page", () =>
    fetcherAllByCompany(companyId)
  );
  const totalPages = total ? Math.ceil((total - pageSize) / pageSize) : 0;
  const pages = [];

  for (let i = 1; i < page; i++) {
    pages.push(
      <Page
        key={i}
        page={i}
        pageSize={pageSize}
        setIsLoadingMore={setIsLoadingMore}
        userEmail={userEmail}
        companyId={companyId}
      />
    );
  }

  return (
    <>
      <PropertiesGrid>
        {properties?.map((property) => {
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
