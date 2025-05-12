import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { DicomType } from "@/types/dicomType";
import { TemplateType } from "@/types/templateType";
import {
  Document,
  Page,
  Text,
  View,
  Image as ImagePdf,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 60,
    paddingBottom: 120,
  },
  section: {
    flexGrow: 1,
    position: "relative",
  },
  text: {
    fontSize: 11,
    minHeight: 17,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
  },
  textSmall: {
    fontSize: 11,
    color: "#99a1af",
  },
  textPatient: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "auto",
    padding: 60,
  },
  htmlContent: {
    fontFamily: "Helvetica",
  },
});

export default function ContentPDFDocument({
  content,
  activeTemplate,
  dicom,
}: {
  content: string;
  activeTemplate: TemplateType | undefined;
  dicom: DicomType | undefined;
}) {
  const lines = content?.split("\n") || [];

  return (
    <Document
      style={{
        width: "595pt",
        height: "841pt",
      }}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <ImagePdf
            fixed
            style={{ marginBottom: 24 }}
            src={activeTemplate?.header_image_url}
          />
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.textPatient}>
              <Text style={styles.textSmall}>Paciente: </Text>
              {dicom?.patient_name}
            </Text>
            <Text style={styles.textPatient}>
              <Text style={styles.textSmall}>Edad: </Text>{" "}
              {dicom?.patient_age
                ? `${extractAgeWidthUnit(dicom?.patient_age).value} ${extractAgeWidthUnit(dicom?.patient_age).unit}`
                : null}
            </Text>
            <Text style={styles.textPatient}>
              <Text style={styles.textSmall}>ID: </Text> {dicom?.patient_id}
            </Text>
            <Text style={styles.textPatient}>
              <Text style={styles.textSmall}>Fecha: </Text>{" "}
              {dicom?.study_date ? formatDateYYYYMMDD(dicom?.study_date) : null}
            </Text>
            <Text style={styles.textPatient}>
              <Text style={styles.textSmall}>Descripción: </Text>
              {dicom?.study_description}
            </Text>
          </View>
          {lines.map((line, index) => {
            return (
              <Text key={index} style={styles.text}>
                {line ?? ""}
              </Text>
            );
          })}
          <ImagePdf
            style={{ width: 160, height: "auto" }}
            src={activeTemplate?.sign_image_url}
          />
        </View>
        <View style={styles.footer} fixed>
          <ImagePdf src={activeTemplate?.footer_image_url} />
        </View>
      </Page>
    </Document>
  );
}
