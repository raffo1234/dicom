"use client";

import { useDebouncedCallback } from "use-debounce";
import extractAgeWidthUnit from "@/lib/extractAgeWithUnit";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import dynamic from "next/dynamic";
import {
  Document,
  Page,
  Text,
  View,
  Image as ImagePdf,
  StyleSheet,
} from "@react-pdf/renderer";

import Image from "next/image";
import { TemplateType } from "@/types/templateType";
import { Icon } from "@iconify/react/dist/iconify.js";
import { DicomType } from "@/types/dicomType";
import Link from "next/link";
import formatDateYYYYMMDD from "@/lib/formatDateYYYYMMDD";
import { DicomStateEnum } from "@/enums/dicomStateEnum";
import { supabase } from "@/lib/supabase";

function GeneratePDFButton({
  label,
  isDisabled = false,
}: {
  label: string;
  isDisabled?: boolean;
}) {
  return (
    <button
      disabled={isDisabled}
      type="button"
      className="flex print:hidden gap-4 items-center text-white cursor-pointer font-semibold disabled:border-gray-100 disabled:opacity-90 py-3 px-10 bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-xl"
    >
      <span>{label}</span>
    </button>
  );
}

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

const ContentDocument = ({
  content,
  activeTemplate,
  dicom,
}: {
  content: string;
  activeTemplate: TemplateType | null;
  dicom: DicomType | null;
}) => {
  const lines = content?.split("\n");

  return (
    <Document>
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
                {line}
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
};

export default function Report({
  templates,
  userId,
  dicom,
}: {
  templates: TemplateType[] | null;
  userId?: string;
  dicom: DicomType;
}) {
  const [dicomState, setDicomState] = useState("");
  const [value, setValue] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(
    null
  );
  const PDFDownloadLink = useMemo(
    () =>
      dynamic(
        () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
        {
          ssr: false,
          loading: () => (
            <GeneratePDFButton isDisabled={true} label="Generate PDF" />
          ),
        }
      ),
    [value, activeTemplate]
    // value and activeTemplate are needed because @react-pdf/renderer needs to re render to load correctly
  );

  const handleTemplateActive = (template: TemplateType) => {
    setActiveTemplate(template);
  };

  const debouncedTextarea = useDebouncedCallback((value) => {
    updateDicomReport(value, dicom.id);
    setValue(value);
  }, 500);

  const updateDicomReport = async (value: string, id: string) => {
    try {
      await supabase.from("dicom").update({ report: value }).eq("id", id);
    } catch (error) {
      console.error(error);
    }
  };

  const updateDicomState = async (id: string, state: DicomStateEnum) => {
    try {
      const { data } = await supabase
        .from("dicom")
        .update({ state, report: value })
        .eq("id", id)
        .select()
        .single();

      if (data) setDicomState(data.state);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (templates && templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates]);

  useEffect(() => {
    if (!dicom.state) {
      updateDicomState(dicom.id, DicomStateEnum.VIEWED);
    }
  }, [dicom.id, dicom.state]);

  useEffect(() => {
    setDicomState(dicom.state);
  }, [dicom.state]);

  useEffect(() => {
    setValue(dicom.report);
  }, [dicom.report]);

  return (
    <>
      {dicomState}
      <div className="flex mb-6 items-center">
        <div
          className="grid gap-2 flex-grow-1"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          }}
        >
          {templates?.map((template) => {
            const { id, name } = template;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTemplateActive(template)}
                className={`${
                  activeTemplate?.id === id
                    ? "bg-rose-50 border-rose-200"
                    : "bg-gray-50 border-gray-200"
                } cursor-pointer truncate text-center p-3 rounded-xl border`}
              >
                {name}
              </button>
            );
          })}
          <div
            className="flex items-center cursor-pointer text-center p-1 transition-colors duration-300 text-gray-500 hover:text-cyan-400 group"
            title="Add template"
          >
            <Icon icon="solar:add-circle-linear" fontSize={32} />
          </div>
        </div>
        {dicomState ? (
          <div
            className={`
              ${dicomState ? "text-gray-700 border-gray-300 bg-gray-100 font-semibold uppercase" : ""}
              ${dicomState === DicomStateEnum.VIEWED ? "text-yellow-500 border-yellow-300 bg-yellow-50" : ""}  
              ${dicomState === DicomStateEnum.DRAFT ? "text-orange-500 border-orange-100 bg-orange-50" : ""}  
              ${dicomState === DicomStateEnum.COMPLETED ? "text-blue-600 border-blue-100 bg-blue-50" : ""}  
              py-1 px-5 text-sm uppercase rounded-full border`}
            title={dicomState}
          >
            {dicomState}
          </div>
        ) : null}
      </div>
      <div className="bg-gray-200">
        <div
          style={{ width: "595pt", fontFamily: "Arial" }}
          className="p-[60pt] pb-[120pt] relative mx-auto bg-white overflow-hidden"
        >
          <div className="left-0 top-[842pt] px-[60pt] pb-[60pt] absolute w-full border-b border-rose-400"></div>
          <div className="left-0 top-[1684pt] px-[60pt] pb-[60pt] absolute w-full border-b border-rose-400"></div>
          {activeTemplate?.header_image_url ? (
            <Image
              src={activeTemplate?.header_image_url}
              width={300}
              height={300}
              alt={activeTemplate.name}
              className="bg-gray-100 mb-6 w-full h-auto"
            />
          ) : null}
          <div className="page">
            <div className="mb-6" style={{ fontSize: "11pt", lineHeight: 1.6 }}>
              <div>
                <span className="text-gray-400">Paciente:</span>{" "}
                {dicom?.patient_name}{" "}
              </div>
              <div>
                <span className="text-gray-400">Edad:</span>{" "}
                {extractAgeWidthUnit(dicom?.patient_age).value}{" "}
                {extractAgeWidthUnit(dicom?.patient_age).unit}
              </div>
              <div>
                <span className="text-gray-400">ID:</span> {dicom?.patient_id}
              </div>
              <div>
                <span className="text-gray-400">Fecha:</span>{" "}
                {formatDateYYYYMMDD(dicom?.study_date)}
              </div>
              <div>
                <span className="text-gray-400">Descripción:</span>{" "}
                {dicom?.study_description}
              </div>
            </div>
            <TextareaAutosize
              defaultValue={value}
              onChange={(event) => debouncedTextarea(event.target.value)}
              minRows={2}
              placeholder="Radiologist's report"
              aria-label="Radiologist's report"
              className="rounded-sm w-full text-[11pt] leading-[1.6] focus:ring-0 focus:outline-none border border-gray-300 focus:border-cyan-300 min-h-6 border-dotted"
            />
            {activeTemplate?.sign_image_url ? (
              <Image
                src={activeTemplate?.sign_image_url}
                width={300}
                height={300}
                alt={activeTemplate.name}
                className="bg-gray-100 h-auto w-[160pt]"
              />
            ) : null}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-[60pt]">
            {activeTemplate?.footer_image_url ? (
              <Image
                src={activeTemplate?.footer_image_url}
                width={300}
                height={300}
                alt={activeTemplate.name}
                className="bg-gray-100 w-full h-auto"
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-3">
        <Link
          href="/admin/dicoms"
          className="flex items-center border px-6 cursor-pointer py-2 border-gray-200 text-gray-700 rounded-xl font-semibold"
          type="button"
          title="Back"
        >
          <span>Back</span>
        </Link>
        {dicomState === DicomStateEnum.VIEWED ? (
          <button
            onClick={() => updateDicomState(dicom.id, DicomStateEnum.DRAFT)}
            title={`Save as ${DicomStateEnum.DRAFT}`}
            type="button"
            className="px-6 py-2 font-semibold text-orange-600 border-orange-200 cursor-pointer border bg-orange-50 rounded-xl"
          >
            Save as {DicomStateEnum.DRAFT}
          </button>
        ) : null}
        {dicomState === DicomStateEnum.DRAFT ? (
          <button
            onClick={() => updateDicomState(dicom.id, DicomStateEnum.COMPLETED)}
            title={`Save as ${DicomStateEnum.COMPLETED}`}
            type="button"
            className="px-6 py-2 font-semibold text-cyan-600 border-cyan-200 cursor-pointer border bg-cyan-50 rounded-xl"
          >
            Save as {DicomStateEnum.COMPLETED}
          </button>
        ) : null}
        {PDFDownloadLink && dicomState === DicomStateEnum.COMPLETED ? (
          <PDFDownloadLink
            document={
              <ContentDocument
                dicom={dicom}
                activeTemplate={activeTemplate}
                content={value}
              />
            }
            fileName={`${dicom?.patient_name}_${userId}.pdf`}
          >
            {({ loading }) =>
              loading ? (
                <GeneratePDFButton label="Generate PDF" isDisabled={true} />
              ) : (
                <GeneratePDFButton label="Generate PDF" />
              )
            }
          </PDFDownloadLink>
        ) : null}
      </div>
    </>
  );
}
