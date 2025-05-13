import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { DicomType } from "@/types/dicomType";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { DicomStateEnum } from "@/enums/dicomStateEnum";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function DicomsTable({ dicoms }: { dicoms: DicomType[] }) {
  return (
    <section className="w-full p-3">
      <div className="bg-white border-gray-200 rounded-xl py-4 shadow w-[1200px] overflow-auto">
        <table className="w-[1200px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                ID
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Institution
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Name
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Gender
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Age
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Birthday
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Description
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Study Date
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Receipt Date
              </th>
              <th className="text-left uppercase text-xs font-semibold pb-4 pl-4">
                Modality
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dicoms?.map(
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
                    <td>
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {patient_id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {institution}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {patient_name}
                      </Link>
                    </td>
                    <td className="p-5">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {gender}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {extractAgeWidthUnit(patient_age).value}{" "}
                        {extractAgeWidthUnit(patient_age).unit}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {formatDateYYYYMMDD(birthday)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {study_description}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {formatDateYYYYMMDD(study_date)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {formatInTimeZone(
                          createdAt,
                          "America/Lima",
                          "dd MMMM yyyy, HH:mm a",
                          {
                            locale: es,
                          }
                        )}
                      </Link>
                    </td>
                    <td className="p-5">
                      <Link
                        href={`/admin/dicoms/${id}`}
                        className="p-5 text-sm"
                      >
                        {modality}
                      </Link>
                    </td>
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
    </section>
  );
}
