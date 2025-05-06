import { DicomType } from "@/types/dicomType";
import Image from "next/image";

export default function DicomsTable({ dicoms }: { dicoms: DicomType[] }) {
  return (
    <section className="flex flex-col gap-2">
      {dicoms?.map(
        ({
          id,
          user,
          patient_name,
          patient_id,
          study_description,
          modality,
          study_date,
        }) => {
          return (
            <div
              key={id}
              className="border bg-white border-gray-200 hover:bg-gray-50 rounded-lg p-4"
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
                </div>
                <div className="flex-grow-1 pl-4">
                  <div className="text-gray-400 text-xs">
                    {study_description}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {modality} / {study_date}
                  </div>
                </div>
              </div>
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
