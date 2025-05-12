import { DicomStateEnum } from "@/enums/dicomStateEnum";
import { UserType } from "./userType";
import { TemplateType } from "./templateType";

export type DicomType = {
  id: string;
  dicom_url: string;
  user_id: string;
  user: UserType;
  patient_name: string;
  patient_age: string;
  patient_id: string;
  study_description: string;
  modality: string;
  study_date: string;
  series_description: string;
  created_at: string;
  state: DicomStateEnum;
  template_id: string;
  report: string;
  template?: TemplateType | undefined;
};
