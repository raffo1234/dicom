import { UserType } from "./userType";

export type DicomType = {
  id: string;
  dicom_url: string;
  user_id: string;
  user: UserType;
  patient_name: string;
  patient_id: string;
  study_description: string;
  modality: string;
  study_date: string;
  series_description: string;
};
