import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { DicomType } from "@/types/dicomType";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { DicomStateEnum } from "@/enums/dicomStateEnum";

export default function DicomsTable({ dicoms }: { dicoms: DicomType[] }) {
  return (
    <section className="w-full p-3 overflow-x-scroll">
      <div className="bg-white border-gray-200 rounded-xl py-4 shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="uppercase text-sm font-semibold pb-4">Name</th>
              <th className="uppercase text-sm font-semibold pb-4">ID</th>
              <th className="uppercase text-sm font-semibold pb-4">Gender</th>
              <th className="uppercase text-sm font-semibold pb-4">Birthday</th>
              <th className="uppercase text-sm font-semibold pb-4">Age</th>
              <th className="uppercase text-sm font-semibold pb-4">Modality</th>
              <th className="uppercase text-sm font-semibold pb-4">
                Study Date
              </th>
              <th className="uppercase text-sm font-semibold pb-4">
                Description
              </th>
              <th className="uppercase text-sm font-semibold pb-4">
                Receipt Date
              </th>
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
                      ${state === DicomStateEnum.COMPLETED ? "bg-cyan-50" : ""}
                      ${index % 2 === 0 ? "bg-gray-50" : ""} ${index === 0 ? " " : "border-t border-gray-200"}`}
                  >
                    <td className="p-4">
                      <div
                        style={{ overflowWrap: "break-word" }}
                        className="wrap-break-word text-sm mb-2 font-semibold"
                      >
                        {patient_name}
                      </div>
                    </td>
                    <td className="p-3">{patient_id}</td>
                    <td className="p-3">{gender}</td>
                    <td className="p-3 text-gray-500 text-sm whitespace-nowrap">
                      {formatDateYYYYMMDD(birthday)}
                    </td>
                    <td className="p-3">
                      <div className="text-gray-600 text-sm whitespace-nowrap">
                        {extractAgeWidthUnit(patient_age).value}{" "}
                        {extractAgeWidthUnit(patient_age).unit}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-500 text-sm">{modality}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-500 text-sm whitespace-nowrap">
                        <span>{formatDateYYYYMMDD(study_date)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm mb-2 font-semibold">
                        {study_description}
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 text-sm whitespace-nowrap">
                      {formatInTimeZone(
                        createdAt,
                        "America/Lima",
                        "dd MMMM yyyy, HH:mm a",
                        {
                          locale: es,
                        }
                      )}
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
