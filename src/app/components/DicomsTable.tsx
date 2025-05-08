import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DicomType } from "@/types/dicomType";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

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
          return (
            <div
              key={id}
              className="border bg-white items-center flex justify-between border-gray-200 hover:bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center gap-4 flex-col sm:flex-row">
                <Image
                  src={user.image_url}
                  className="rounded-full mb-3 mx-auto bg-gray-100 flex-shrink-0"
                  alt={user.first_name || user.id}
                  width={44}
                  height={44}
                  title={user.first_name}
                />
                <div title={patient_name}>
                  <div className="truncate text-xs text-gray-500 mb-1">
                    ID: {patient_id}
                  </div>
                  <div className="truncate text-sm mb-1">{patient_name}</div>
                  <div className="text-gray-600 text-xs mb-2">
                    Age: {patient_age}
                  </div>
                </div>
                <div className="flex-grow-1 pl-4">
                  <div className="text-gray-400 text-xs">
                    {study_description}
                  </div>
                  <div className="text-gray-600 text-xs mb-2">
                    {modality} / {study_date}
                  </div>
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold">Created at:</span>{" "}
                    {format(new Date(created_at), "dd MMMM, yyyy hh:mm a", {
                      locale: es,
                    })}
                  </div>
                </div>
              </div>
              {true ? (
                <Link
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
              )}

              {/* <div className="text-sm text-gray-500 w-full text-center mb-4">
                {role?.name}
              </div> */}
            </div>
          );
        }
      )}
    </section>
  );
}
