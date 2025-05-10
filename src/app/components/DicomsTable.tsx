import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { DicomType } from "@/types/dicomType";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";

export default function DicomsTable({ dicoms }: { dicoms: DicomType[] }) {
  return (
    <section className="flex flex-col gap-2">
      {dicoms?.map(
        ({
          id,
          user,
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
              className="hover:border-cyan-400 hover:outline-8 transition-colors outline-cyan-50 border bg-white border-gray-200 rounded-xl"
            >
              <div className=" items-center flex justify-between p-4 ">
                <div className="flex items-center gap-4 flex-col sm:flex-row">
                  <div title={patient_name}>
                    <div className="truncate text-sm text-gray-500 mb-2">
                      ID: {patient_id}
                    </div>
                    <div
                      style={{ overflowWrap: "break-word" }}
                      className="truncate wrap-break-word text-sm mb-2"
                    >
                      {patient_name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Age: {extractAgeWidthUnit(patient_age).value}{" "}
                      {extractAgeWidthUnit(patient_age).unit}
                    </div>
                  </div>
                  <div className="flex-grow-1 pl-4">
                    <div className="text-gray-500 text-sm mb-2 flex gap-2 items-center">
                      <Icon icon="solar:calendar-line-duotone" fontSize={24} />
                      <span>Study date: {formatDateYYYYMMDD(study_date)}</span>
                    </div>
                    <div className="text-sm mb-2">{study_description}</div>
                    <div className="text-gray-500 text-sm">
                      Modality: {modality}
                    </div>
                  </div>
                </div>
                {/* {true ? (
                  <Link
                    title="Generate a PDF report"
                    href={`/admin/dicoms/${id}`}
                    className="text-amber-600 cursor-pointer p-2 rounded-full border border-gray-200 hover:border-gray-300"
                  >
                    <Icon
                      icon="solar:clapperboard-edit-broken"
                      fontSize={24}
                    ></Icon>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="text-green-400 p-2 cursor-pointer rounded-full border border-gray-200 hover:border-gray-300"
                  >
                    <Icon icon="solar:file-check-outline" fontSize={24}></Icon>
                  </button>
                )} */}
                {/* <div className="text-sm text-gray-500 w-full text-center mb-4">
                {role?.name}
              </div> */}
              </div>
              <div className="wrap flex-col sm:flex-row text-sm items-center flex gap-2 p-4 bg-gray-100 rounded-b-xl">
                <span className="font-semibold">Uploaded at:</span>
                {formatInTimeZone(
                  createdAt,
                  "America/Lima",
                  "dd MMMM yyyy HH:mm:ss a",
                  {
                    locale: es,
                  }
                )}
                <span>by </span>
                <Image
                  src={user.image_url}
                  className="rounded-full bg-gray-100 flex-shrink-0"
                  alt={user.first_name || user.id}
                  width={36}
                  height={36}
                  title={user.first_name}
                />
                <span>
                  {user.first_name} {user.last_name}
                </span>
              </div>
            </Link>
          );
        }
      )}
    </section>
  );
}
