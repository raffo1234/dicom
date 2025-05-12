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
    <section className="w-full p-3 overflow-x-scroll">
      <div className="bg-white border-gray-200 rounded-xl py-4 shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="uppercase text-sm font-semibold pb-4">ID</th>
              <th className="uppercase text-sm font-semibold pb-4">
                Institution
              </th>
              <th className="uppercase text-sm font-semibold pb-4">Name</th>
              <th className="uppercase text-sm font-semibold pb-4">Gender</th>
              <th className="uppercase text-sm font-semibold pb-4">Age</th>
              <th className="uppercase text-sm font-semibold pb-4">Birthday</th>
              <th className="uppercase text-sm font-semibold pb-4">
                Description
              </th>
              <th className="uppercase text-sm font-semibold pb-4">
                Study Date
              </th>
              <th className="uppercase text-sm font-semibold pb-4">
                Receipt Date
              </th>
              <th className="uppercase text-sm font-semibold pb-4">Modality</th>
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
                        className="p-4 text-sm font-semibold"
                      >
                        {patient_id}
                      </Link>
                    </td>
                    <td className="p-4">{institution}</td>
                    <td className="p-4">
                      <div
                        style={{ overflowWrap: "break-word" }}
                        className="wrap-break-word text-sm mb-2 font-semibold"
                      >
                        {patient_name}
                      </div>
                    </td>
                    <td className="p-4">{gender}</td>
                    <td className="p-4">
                      <div className="text-gray-600 text-sm whitespace-nowrap">
                        {extractAgeWidthUnit(patient_age).value}{" "}
                        {extractAgeWidthUnit(patient_age).unit}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                      {formatDateYYYYMMDD(birthday)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm mb-2 font-semibold">
                        {study_description}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-500 text-sm whitespace-nowrap">
                        <span>{formatDateYYYYMMDD(study_date)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                      {formatInTimeZone(
                        createdAt,
                        "America/Lima",
                        "dd MMMM yyyy, HH:mm a",
                        {
                          locale: es,
                        }
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-500 text-sm">{modality}</div>
                    </td>
                    <td className="p-4">
                      <Link
                        target="_blank"
                        href={`/admin/dicoms/preview/${id}`}
                        title="PDF Preview"
                        className="py-2 px-6 flex gap-3 items-center font-semibold  border bg-cyan-500 text-white rounded-full cursor-pointer"
                      >
                        <Icon icon="solar:eye-linear" fontSize={24} />
                        <span>Preview</span>
                      </Link>
                      <Link
                        href={`/admin/dicoms/${id}`}
                        title="Inform"
                        className="py-2 px-6 flex gap-3 items-center font-semibold border bg-rose-500 text-white rounded-full cursor-pointer"
                      >
                        <Icon icon="solar:document-add-linear" fontSize={24} />
                        <span>Report</span>
                      </Link>
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
