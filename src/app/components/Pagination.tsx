"use client";

import { DicomStateEnum } from "@/enums/dicomStateEnum";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { supabase } from "@/lib/supabase";
import { DicomType } from "@/types/dicomType";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

type SortDirection = "asc" | "desc" | null;

const fetcher = async (
  key: [string, number, number, string | null, SortDirection]
): Promise<DicomType[] | null> => {
  const [tableName, page, pageSize, sortColumn, sortDirection] = key;

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from(tableName)
    .select("*, user(id, image_url, first_name, last_name)")
    .range(start, end);

  if (sortColumn && sortDirection) {
    query = query.order(sortColumn, { ascending: sortDirection === "asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`SWR Error fetching data from "${tableName}":`, error);
    throw error;
  }

  console.info(
    `SWR Successfully fetched ${data?.length || 0} items for page ${page}.`
  );
  return data as DicomType[] | null;
};

const pageSize: number = 8;

export default function Pagination({ tableName }: { tableName: "dicom" }) {
  const [page, setPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const { data, error, isLoading } = useSWR<DicomType[] | null>(
    [tableName, page, pageSize, sortColumn, sortDirection],
    fetcher
  );

  const hasMore: boolean =
    data !== undefined && data !== null && data.length === pageSize;

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prevDirection) => {
        if (prevDirection === "asc") return "desc";
        if (prevDirection === "desc") return null;
        return "asc";
      });
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    // Reset to the first page when sorting changes
    setPage(1);
  };

  const startItemNumber = (page - 1) * pageSize + 1;

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Icon icon="svg-spinners:ring-resize" fontSize={20} />
          Loading data...
        </div>
      )}

      {error && (
        <p className="text-sm px-4 py-2 border border-rose-200 flex items-center gap-3 bg-rose-50 rounded-xl text-rose-700">
          <Icon
            icon="solar:close-circle-broken"
            className="flex-shrink-0"
            fontSize={20}
          ></Icon>
          Error fetching data: {error.message || "Unknown error"}
        </p>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div className="bg-white shadow rounded-xl">
          <table className="text-sm block whitespace-nowrap overflow-y-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  #
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Patient ID
                </th>
                <th
                  onClick={() => handleSort("institution")}
                  className="text-left uppercase text-xs font-semibold py-4 pl-4 cursor-pointer"
                >
                  Institution Name
                  {sortColumn === "institution" && sortDirection && (
                    <Icon
                      icon={
                        sortDirection === "asc"
                          ? "solar:arrow-up-outline"
                          : "solar:arrow-down-outline"
                      }
                      className="inline-block ml-1"
                      fontSize={12}
                    />
                  )}
                </th>
                <th
                  onClick={() => handleSort("patient_name")}
                  className="text-left uppercase text-xs font-semibold py-4 pl-4 cursor-pointer"
                >
                  Patient Name
                  {sortColumn === "patient_name" && sortDirection && (
                    <Icon
                      icon={
                        sortDirection === "asc"
                          ? "solar:arrow-up-outline"
                          : "solar:arrow-down-outline"
                      }
                      className="inline-block ml-1"
                      fontSize={12}
                    />
                  )}
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Patient Sex
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Age
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Birth Date
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Study Description
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Study Date
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Receipt Date
                </th>
                <th className="text-left uppercase text-xs font-semibold py-4 pl-4">
                  Modality
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {data?.map(
                (
                  {
                    id,
                    patient_name,
                    patient_id,
                    patient_age,
                    study_description,
                    modality,
                    study_date,
                    created_at,
                    state,
                    gender,
                    birthday,
                    institution,
                  },
                  index
                ) => {
                  const createdAt = new Date(created_at);

                  return (
                    <tr
                      key={id}
                      className={`
                      ${state === DicomStateEnum.VIEWED ? "bg-yellow-100" : ""}
                      ${state === DicomStateEnum.DRAFT ? "bg-orange-100" : ""}
                      ${state === DicomStateEnum.COMPLETED ? "bg-cyan-100" : ""}
                      ${index % 2 === 0 ? "bg-gray-50" : ""} ${index === 0 ? " " : "border-t border-gray-200"}`}
                    >
                      <td className="whitespace-nowrap p-5">
                        {startItemNumber + index}
                      </td>
                      <td>
                        <Link
                          href={`/admin/dicoms/${id}`}
                          className="p-5 text-sm"
                        >
                          {patient_id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap p-5">{institution}</td>
                      <td className="whitespace-nowrap p-5">{patient_name}</td>
                      <td className="p-5">{gender}</td>
                      <td className="whitespace-nowrap p-5">
                        {extractAgeWidthUnit(patient_age).value}{" "}
                        {extractAgeWidthUnit(patient_age).unit}
                      </td>
                      <td className="whitespace-nowrap p-5">
                        {formatDateYYYYMMDD(birthday)}
                      </td>
                      <td className="whitespace-nowrap p-5">
                        {study_description}
                      </td>
                      <td className="whitespace-nowrap p-5">
                        {formatDateYYYYMMDD(study_date)}
                      </td>
                      <td className="whitespace-nowrap p-5">
                        {formatInTimeZone(
                          createdAt,
                          "America/Lima",
                          "dd MMMM yyyy, hh:mm a",
                          {
                            locale: es,
                          }
                        )}
                      </td>
                      <td className="p-5">{modality}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/dicoms/${id}`}
                            title="Inform"
                            className="py-2 px-6 flex gap-3 items-center font-semibold border bg-cyan-500 text-white rounded-full cursor-pointer"
                          >
                            <Icon
                              icon="solar:document-add-linear"
                              fontSize={24}
                            />
                            <span>Inform</span>
                          </Link>
                          <Link
                            target="_blank"
                            href={`/admin/dicoms/preview/${id}`}
                            title="PDF Preview"
                            className="py-2 px-6 flex gap-3 items-center font-semibold  bg-gray-200  rounded-full cursor-pointer"
                          >
                            <Icon icon="solar:eye-linear" fontSize={24} />
                            <span>Preview</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && data && data.length === 0 && (
        <p className="text-gray-700 text-sm">No data found for this page.</p>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1 || isLoading} // Disable if on the first page or loading
          className="flex cursor-pointer items-center gap-1 px-4 py-2 border border-transparent text-sm rounded-full  text-white bg-cyan-500 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          <Icon icon="solar:arrow-left-outline" fontSize={16} />
          Previous
        </button>
        <span className="text-xs uppercase font-semibold text-gray-700">
          Page {page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore || isLoading}
          className="flex cursor-pointer items-center gap-1 px-4 py-2 border border-transparent text-sm rounded-full  text-white bg-cyan-500 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          Next
          <Icon icon="solar:arrow-right-outline" fontSize={16} />
        </button>
      </div>
    </>
  );
}
