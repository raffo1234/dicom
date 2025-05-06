"use client"; // Si estás usando Next.js App Router

import React, { useState, useRef, useEffect } from "react";
// Importar las librerías necesarias de Cornerstone
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";

// Configurar cornerstoneWADOImageLoader para usar dicom-parser
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Opcional: Configurar un Web Worker para mejorar el rendimiento en la decodificación
// Esto requiere configurar webpack para los workers, lo cual es más avanzado.
// Para un ejemplo simple, podemos omitir la configuración completa del worker,
// pero es importante saber que existe para archivos grandes o comprimidos.
// cornerstoneWADOImageLoader.configure({
//   webWorkersPath: '/path/to/cornerstoneWADOImageLoader.webworkers.js',
//   taskConfiguration: {
//     'decodeTask': {
//       codecsPath: '/path/to/cornerstoneWADOImageLoaderCodecs.js'
//     }
//   }
// });

// Definir tipos para los datos que queremos extraer
interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  sopInstanceUID?: string;
  manufacturer?: string;
  // Puedes añadir muchos más campos aquí basándote en las etiquetas DICOM que necesites
  // Referencia de etiquetas DICOM: https://dicom.nema.org/medical/dicom/current/output/chtml/part06/chapter_6.html
}

interface DicomImageDataInfo {
  width?: number;
  height?: number;
  bitsAllocated?: number;
  bitsStored?: number;
  highBit?: number;
  pixelRepresentation?: number; // 0 for unsigned, 1 for signed
  photometricInterpretation?: string;
  numberOfFrames?: number; // For multi-frame images
  // Información de windowing/nivel (Window Center/Window Width)
  windowCenter?: number;
  windowWidth?: number;
}

interface LoadedDicomInfo {
  metadata: DicomMetadata | null;
  imageDataInfo: DicomImageDataInfo | null;
  // La imagen cargada por cornerstone contiene los datos de píxeles decodificados
  cornerstoneImage?: cornerstone.Image;
}

const DicomDataReader: React.FC = () => {
  const [dicomInfo, setDicomInfo] = useState<LoadedDicomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Referencia a un div donde podríamos mostrar la imagen si quisiéramos
  // Aunque en este ejemplo solo extraemos datos, es útil tener la referencia
  // si luego decides integrar la visualización.
  const elementRef = useRef<HTMLDivElement>(null);

  // Limpieza de cornerstone si se llega a habilitar un elemento
  useEffect(() => {
    const element = elementRef.current;
    return () => {
      if (element) {
        try {
          cornerstone.disable(element);
        } catch (e) {
          console.error(e);
          // Ignorar errores si el elemento no fue habilitado
        }
      }
    };
  }, []); // Se ejecuta solo al montar y desmontar el componente

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setDicomInfo(null); // Clear previous data

    // Cornerstone WADO Image Loader puede cargar archivos directamente
    // usando un "imageId" con el esquema "dicomfile:"
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

    try {
      // Cargar la imagen usando cornerstone.loadImage
      // Esto parseará el archivo, decodificará los píxeles (si es necesario)
      // y preparará el objeto de imagen para su visualización o acceso a datos.
      const image = await cornerstone.loadImage(imageId);

      // Ahora podemos acceder a los metadatos y datos de la imagen desde el objeto 'image'
      // Cornerstone parsea muchas etiquetas DICOM comunes y las pone en el objeto image.
      // Para metadatos más específicos, a veces necesitas acceder al dataSet original
      // o usar los Metadata Providers de Cornerstone (más avanzado).

      // Extraer Metadatos comunes del objeto image (Cornerstone los parsea automáticamente)
      const metadata: DicomMetadata = {
        patientName: image.data.string("x00100010"),
        patientId: image.data.string("x00100020"),
        studyDate: image.data.string("x00080020"),
        modality: image.data.string("x00080060"),
        sopInstanceUID: image.data.string("x00080018"),
        manufacturer: image.data.string("x00080070"),
        // Ejemplo de cómo obtener una etiqueta que no siempre está mapeada directamente
        // Debes verificar si el elemento existe antes de intentar obtener su valor
        // let acquisitionTime = image.data.string('x00080032'); // Acquisition Time
      };

      // Extraer Información de Datos de Imagen
      const imageDataInfo: DicomImageDataInfo = {
        width: image.width,
        height: image.height,
        bitsAllocated: image.bitsAllocated,
        bitsStored: image.bitsStored,
        highBit: image.highBit,
        pixelRepresentation: image.pixelRepresentation,
        photometricInterpretation: image.photometricInterpretation,
        numberOfFrames: image.numberOfFrames,
        windowCenter: image.windowCenter,
        windowWidth: image.windowWidth,
      };

      // Los datos de píxeles decodificados están en image.getPixelData()
      // Esto te da un TypedArray (Int16Array, Uint16Array, Uint8Array, etc.)
      // dependiendo de bitsAllocated y pixelRepresentation.
      // console.log("Tipo de datos de píxeles:", image.getPixelData().constructor.name);
      // console.log("Primeros 10 valores de píxeles:", image.getPixelData().slice(0, 10));

      setDicomInfo({
        metadata,
        imageDataInfo,
        cornerstoneImage: image, // Opcional: guardar el objeto imagen si lo necesitas después
      });
    } catch (err: any) {
      console.error("Error loading or parsing DICOM:", err);
      setError(`Error al cargar o procesar el archivo DICOM: ${err.message}`);
    } finally {
      setIsLoading(false);
      // Limpiar el archivo del fileManager de cornerstone-wado-image-loader
      cornerstoneWADOImageLoader.wadouri.fileManager.remove(imageId);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">
        Obtener Datos de Archivo DICOM
      </h2>
      <input
        type="file"
        accept=".dcm, .dicom" // Especificar tipos de archivo comunes
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-cyan-50 file:text-cyan-700
                   hover:file:bg-cyan-100"
      />

      {isLoading && <p className="text-blue-600">Cargando y procesando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {dicomInfo && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {dicomInfo.metadata && (
            <div className="border p-3 rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Metadatos Extraídos:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Nombre Paciente:</strong>{" "}
                  {dicomInfo.metadata.patientName || "N/A"}
                </li>
                <li>
                  <strong>ID Paciente:</strong>{" "}
                  {dicomInfo.metadata.patientId || "N/A"}
                </li>
                <li>
                  <strong>Fecha Estudio:</strong>{" "}
                  {dicomInfo.metadata.studyDate || "N/A"}
                </li>
                <li>
                  <strong>Modalidad:</strong>{" "}
                  {dicomInfo.metadata.modality || "N/A"}
                </li>
                <li>
                  <strong>SOP Instance UID:</strong>{" "}
                  {dicomInfo.metadata.sopInstanceUID || "N/A"}
                </li>
                <li>
                  <strong>Fabricante:</strong>{" "}
                  {dicomInfo.metadata.manufacturer || "N/A"}
                </li>
                {/* Mostrar otros metadatos */}
              </ul>
            </div>
          )}

          {dicomInfo.imageDataInfo && (
            <div className="border p-3 rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Información de Imagen:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Dimensiones:</strong>{" "}
                  {dicomInfo.imageDataInfo.width || "N/A"} x{" "}
                  {dicomInfo.imageDataInfo.height || "N/A"}
                </li>
                <li>
                  <strong>Bits Asignados:</strong>{" "}
                  {dicomInfo.imageDataInfo.bitsAllocated || "N/A"}
                </li>
                <li>
                  <strong>Bits Almacenados:</strong>{" "}
                  {dicomInfo.imageDataInfo.bitsStored || "N/A"}
                </li>
                <li>
                  <strong>High Bit:</strong>{" "}
                  {dicomInfo.imageDataInfo.highBit || "N/A"}
                </li>
                <li>
                  <strong>Representación Píxel:</strong>{" "}
                  {dicomInfo.imageDataInfo.pixelRepresentation === 0
                    ? "Unsigned"
                    : dicomInfo.imageDataInfo.pixelRepresentation === 1
                      ? "Signed"
                      : "N/A"}
                </li>
                <li>
                  <strong>Interpretación Fotométrica:</strong>{" "}
                  {dicomInfo.imageDataInfo.photometricInterpretation || "N/A"}
                </li>
                <li>
                  <strong>Número de Frames:</strong>{" "}
                  {dicomInfo.imageDataInfo.numberOfFrames || 1}
                </li>
                <li>
                  <strong>Window Center:</strong>{" "}
                  {dicomInfo.imageDataInfo.windowCenter || "N/A"}
                </li>
                <li>
                  <strong>Window Width:</strong>{" "}
                  {dicomInfo.imageDataInfo.windowWidth || "N/A"}
                </li>
              </ul>
              {/* Puedes añadir un botón aquí para visualizar la imagen si integras esa funcionalidad */}
              {/* <button onClick={() => displayImage(dicomInfo.cornerstoneImage)}>Mostrar Imagen</button> */}
            </div>
          )}

          {/* Aquí iría el div para mostrar la imagen si lo implementas */}
          {/* <div ref={elementRef} style={{ width: '500px', height: '500px', border: '1px solid black' }}></div> */}
        </div>
      )}
    </div>
  );
};

export default DicomDataReader;
