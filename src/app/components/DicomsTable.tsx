import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { DicomType } from "@/types/dicomType";
import Link from "next/link";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";

export default function DicomsTable({ dicoms }: { dicoms: DicomType[] }) {
  return (
    <section
      className="grid gap-5"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}
    >
      {dicoms?.map(
        ({
          id,
          patient_name,
          patient_id,
          patient_age,
          study_description,
          modality,
          study_date,
          created_at,
        }) => {
          const createdAt = new Date(created_at);

          return (
            <Link
              href={`/admin/dicoms/${id}`}
              key={id}
              className="hover:border-cyan-200 border border-transparent hover:outline-8 transition-all outline-cyan-50 p-5 bg-white shadow rounded-xl"
            >
              <div className="flex items-center gap-4 justify-between">
                <div className="flex-1">
                  <div
                    style={{ overflowWrap: "break-word" }}
                    className="wrap-break-word text-sm mb-2 font-semibold max-w-30"
                  >
                    {patient_name}
                  </div>
                  <div className="text-sm text-gray-600">{patient_id}</div>
                  <div className="text-gray-600 text-sm">
                    {extractAgeWidthUnit(patient_age).value}{" "}
                    {extractAgeWidthUnit(patient_age).unit}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-gray-500 text-sm">{modality}</div>
                  <div className="text-gray-500 text-sm mb-2">
                    <span>{formatDateYYYYMMDD(study_date)}</span>
                  </div>
                  <div className="text-sm mb-2 font-semibold">
                    {study_description}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t text-gray-600 border-gray-200 border-dashed text-sm text-right mt-4">
                {formatInTimeZone(
                  createdAt,
                  "America/Lima",
                  "dd MMMM yyyy, HH:mm a",
                  {
                    locale: es,
                  }
                )}
              </div>
            </Link>
          );
        }
      )}
    </section>
  );
}
