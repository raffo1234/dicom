"use client";

import dynamic from "next/dynamic";
import { DicomStateEnum } from "@/enums/dicomStateEnum";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { supabase } from "@/lib/supabase";
import { DicomType } from "@/types/dicomType";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import TableSkeleton from "@/components/FormSkeleton";
import GeneratePDFButton from "@/components/GeneratePDFButton";
import ContentPDFDocument from "./ContentPDFDocument";
import DOCXPreview from "./DOCXPreview";
import { useDebouncedCallback } from "use-debounce";

type SortDirection = "asc" | "desc" | null;

const fetcherTotal = async (userId: string) => {
  const { count, error } = await supabase
    .from("dicom")
    .select("id", { count: "exact", head: false })
    .eq("user_id", userId);

  if (error) throw error;
  return count;
};

const fetcher = async (
  key: [
    string,
    number,
    number,
    string | null,
    SortDirection,
    string,
    string | null,
  ]
): Promise<DicomType[] | null> => {
  const [
    tableName,
    page,
    pageSize,
    sortColumn,
    sortDirection,
    userId,
    searchWord,
  ] = key;

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from(tableName)
    .select(
      "*, user(id, image_url, first_name, last_name), template(header_image_url, footer_image_url, sign_image_url)"
    )
    .eq("user_id", userId)
    .range(start, end);

  if (sortColumn && sortDirection) {
    query = query.order(sortColumn, { ascending: sortDirection === "asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (searchWord && searchWord.length > 0) {
    query = query.or(
      `patient_id.ilike.%${searchWord}%,patient_name.ilike.%${searchWord}%,institution.ilike.%${searchWord}%,study_description.ilike.%${searchWord}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(`SWR Error fetching data from "${tableName}":`, error);
    throw error;
  }

  return data as DicomType[] | null;
};

export default function Pagination({
  tableName,
  userId,
}: {
  tableName: "dicom";
  userId: string;
}) {
  const debouncedSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 400);

  const PDFDownloadLink = useMemo(
    () =>
      dynamic(
        () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
        {
          ssr: false,
          loading: () => <GeneratePDFButton isDisabled={true} label="PDF" />,
        }
      ),
    []
  );
  const nowMs = Date.now();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [search, setSearch] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR<DicomType[] | null>(
    [tableName, page, pageSize, sortColumn, sortDirection, userId, search],
    fetcher
  );

  const { data: count } = useSWR("admin-dicoms-total", () =>
    fetcherTotal(userId)
  );

  const hasMore: boolean =
    data !== undefined && data !== null && data.length === pageSize;

  const handlePageSize = (formData: FormData) => {
    const pageSizeValue: FormDataEntryValue | null = formData.get("pageSize");

    if (typeof pageSizeValue === "string") {
      const newPageSize = parseInt(pageSizeValue, 10);

      if (!isNaN(newPageSize) && newPageSize > 0) {
        setPageSize(newPageSize);
        setPage(1);
      } else {
        console.warn("Invalid page size value received:", pageSizeValue);
      }
    } else {
      console.warn(
        "Page size value not found in form data or is not a string."
      );
    }
  };

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

    setPage(1);
  };

  const startItemNumber = (page - 1) * pageSize + 1;

  return (
    <>
      <div className="w-full mb-4">
        <div className="flex max-w-lg w-full mx-auto sm:mx-0 flex-col sm:flex-row items-center gap-3">
          <Link
            href="/admin/dicom"
            title="Upload Dicoms"
            className="px-6 text-white w-full justify-center py-2 rounded-full bg-black flex gap-2 items-center"
          >
            <span>Upload</span>
            <Icon icon="solar:add-circle-linear" fontSize={24}></Icon>
          </Link>
          <input
            type="text"
            className="bg-white rounded-full border w-full border-gray-200 outline-0 py-2 px-5"
            placeholder="Search ..."
            defaultValue={search ?? ""}
            onChange={(event) => debouncedSearch(event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="text-xs flex items-center gap-1">
          <span>
            Total: <span className="text-base font-semibold">{count}</span>
          </span>
          <form action={handlePageSize} className="inline-block">
            <input
              type="text"
              name="pageSize"
              className="py-1 px-3 rounded-full text-center text-base transition-colors duration-300 hover:border-gray-300 focus:border-cyan-400 outline-0 border border-gray-200 w-16"
              defaultValue={pageSize}
            />
          </form>
          <span>per page</span>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={pageSize} cols={7} />}

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
        <div className="bg-white shadow rounded-xl overflow-auto">
          <table className="text-sm w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-6 text-left uppercase text-xs font-semibold py-4 px-3">
                  #
                </th>
                <th className="w-25 px-1">
                  <button
                    type="button"
                    onClick={() => handleSort("patient_id")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Patient ID
                    {sortColumn === "patient_id" && sortDirection && (
                      <Icon
                        icon={
                          sortDirection === "asc"
                            ? "solar:arrow-up-outline"
                            : "solar:arrow-down-outline"
                        }
                        className="inline-block"
                        fontSize={14}
                      />
                    )}
                  </button>
                </th>
                <th onClick={() => handleSort("institution")} className="w-46">
                  <button
                    type="button"
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Institution Name
                    {sortColumn === "institution" && sortDirection && (
                      <Icon
                        icon={
                          sortDirection === "asc"
                            ? "solar:arrow-up-outline"
                            : "solar:arrow-down-outline"
                        }
                        className="inline-block"
                        fontSize={12}
                      />
                    )}
                  </button>
                </th>
                <th className="w-60 px-1">
                  <button
                    onClick={() => handleSort("patient_name")}
                    type="button"
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
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
                  </button>
                </th>
                <th className="w-14 py-2">
                  <button
                    type="button"
                    onClick={() => handleSort("gender")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Sex
                    {sortColumn === "gender" && sortDirection && (
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
                  </button>
                </th>
                <th className="w-16 px-1">
                  <button
                    type="button"
                    onClick={() => handleSort("patient_age")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Age
                    {sortColumn === "patient_age" && sortDirection && (
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
                  </button>
                </th>
                <th className="w-40 py-1">
                  <button
                    type="button"
                    onClick={() => handleSort("study_description")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Study Description
                    {sortColumn === "study_description" && sortDirection && (
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
                  </button>
                </th>
                <th className="w-30 px-1">
                  <button
                    type="button"
                    onClick={() => handleSort("study_date")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Study Date
                    {sortColumn === "study_date" && sortDirection && (
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
                  </button>
                </th>
                <th className="w-42 py-1">
                  <button
                    type="button"
                    onClick={() => handleSort("created_at")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    Receipt Date
                    {sortColumn === "created_at" && sortDirection && (
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
                  </button>
                </th>
                <th title="Modalidad" className="w-13 px-1">
                  <button
                    type="button"
                    onClick={() => handleSort("modality")}
                    className="py-3 w-full text-left px-2 rounded-lg cursor-pointer uppercase text-xs font-semibold hover:bg-cyan-50 bg-slate-50 transition-colors duration-300"
                  >
                    M
                    {sortColumn === "modality" && sortDirection && (
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
                  </button>
                </th>
                <th className="w-90"></th>
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
                      ${index % 2 === 0 && !state ? "bg-gray-50" : ""} ${
                        index === 0 ? " " : "border-t border-gray-200"
                      }`}
                    >
                      <td className="whitespace-nowrap py-5 px-3">
                        {startItemNumber + index}
                      </td>
                      <td className="py-5 px-2">
                        <Link href={`/admin/dicoms/${id}`} className="text-sm">
                          {patient_id}
                        </Link>
                      </td>
                      <td
                        title={institution}
                        className="truncate whitespace-nowrap py-5 px-2"
                      >
                        {institution}
                      </td>
                      <td
                        title={patient_name}
                        className="truncate whitespace-nowrap py-5 px-2"
                      >
                        {patient_name}
                      </td>
                      <td className="py-5 px-2 text-center">{gender}</td>
                      <td className="whitespace-nowrap py-5 px-2">
                        {extractAgeWidthUnit(patient_age).value}{" "}
                        {extractAgeWidthUnit(patient_age).unit}
                      </td>
                      <td
                        title={study_description}
                        className="truncate whitespace-nowrap py-5 px-2"
                      >
                        {study_description}
                      </td>
                      <td className="whitespace-nowrap py-5 px-2">
                        {formatDateYYYYMMDD(study_date)}
                      </td>
                      <td className="whitespace-nowrap py-5 px-2">
                        {formatInTimeZone(
                          createdAt,
                          "America/Lima",
                          "dd MMMM yyyy, hh:mm a",
                          {
                            locale: es,
                          }
                        )}
                      </td>
                      <td className="py-5 px-2 text-center">{modality}</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1 justify-end">
                          {state === DicomStateEnum.COMPLETED ? (
                            <>
                              {PDFDownloadLink ? (
                                <PDFDownloadLink
                                  document={
                                    <ContentPDFDocument
                                      dicom={data[index]}
                                      activeTemplate={data[index].template}
                                      content={data[index].report}
                                    />
                                  }
                                  fileName={`${data[index]?.patient_name}_${nowMs}_${userId}.pdf`}
                                >
                                  {({ loading }) =>
                                    loading ? (
                                      <GeneratePDFButton
                                        label="PDF"
                                        isDisabled={true}
                                      />
                                    ) : (
                                      <GeneratePDFButton label="PDF" />
                                    )
                                  }
                                </PDFDownloadLink>
                              ) : null}
                              <DOCXPreview dicom={data[index]} />
                            </>
                          ) : null}
                          <Link
                            href={`/admin/dicoms/${id}`}
                            title="Inform"
                            className="py-2 px-6 flex gap-3 items-center font-semibold border bg-cyan-500 text-white rounded-full cursor-pointer"
                          >
                            <Icon
                              icon={`${
                                state === DicomStateEnum.COMPLETED
                                  ? "solar:file-check-linear"
                                  : "solar:document-add-linear"
                              }`}
                              fontSize={24}
                            />
                            <span>
                              {state !== DicomStateEnum.COMPLETED
                                ? "Inform"
                                : "Amend"}
                            </span>
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
          disabled={page === 1 || isLoading}
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
