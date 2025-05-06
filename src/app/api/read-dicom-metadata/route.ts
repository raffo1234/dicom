// pages/api/read-dicom-metadata.ts
// import formidable, { File, Fields } from "formidable";
import JSZip from "jszip";
import dicomParser from "dicom-parser"; // Or dcmjs, etc.
// import { readFileSync } from "fs";
import { Buffer } from "buffer";

// --- Define Interfaces for API Response ---
interface DicomMetadataResponse {
  patientName?: string;
  patientID?: string;
  studyDescription?: string;
  seriesDescription?: string;
  modality?: string;
  studyDate?: string;
  [key: string]: string | undefined; // Allow adding more tags easily
}

// --- End Interfaces ---

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parsing for formidable
  },
};

// Use NextApiRequest and NextApiResponse types, defining possible response types
export async function POST(req: Request) {
  // Ensure it's a POST request
  // if (req.method !== "POST") {

  //   res.setHeader("Allow", ["POST"]);
  //   // Return 405 with an ErrorResponse body
  //   return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  // }

  // const body = await req;
  // console.log(body);

  // e.g. Insert new user into your DB
  // const newUser = { id: Date.now(), name: "hola" };

  // return new Response(JSON.stringify(newUser), {
  //   status: 201,
  //   headers: { "Content-Type": "application/json" },
  // });

  // Initialize formidable
  // const form = formidable({
  //   // You might add options here, e.g., limits for file size
  //   // maxFileSize: 100 * 1024 * 1024, // Example: 100MB
  // });

  try {
    // Parse the incoming form data. Formidable's parse handles the stream from req.
    // We expect a single file under the key 'dicomZipFile'
    // const [fields, files] = (await form.parse(req)) as [
    //   Fields,
    //   { dicomZipFile?: File[] },
    // ];

    const data = await req.formData();
    // console.log(data);
    // return new Response(JSON.stringify({ newUser }), {
    //   status: 201,
    //   headers: { "Content-Type": "application/json" },
    // });

    // Access the uploaded file with type assertion and optional chaining
    // const zippedFile: File | undefined = files.dicomZipFile?.[0];
    // const zippedFile: File | undefined = data.dicomZipFile;

    // console.log({ zippedFile });

    if (!data) {
      // Return 400 if no file was uploaded
      // return res.status(400).json({ error: "No file uploaded." });
      return new Response(JSON.stringify({ error: "No file uploaded." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // const zippedFile: File | undefined = data.get("dicomZipFile");

    const zippedFile = data.get("dicomZipFile") as Blob | null;

    // Read the uploaded zip file content from the temporary path. readFileSync returns Buffer.
    // const zipData: Buffer = readFileSync(zippedFile);

    const zipData = zippedFile
      ? Buffer.from(await zippedFile.arrayBuffer())
      : null;

    // console.log({ zipData });
    // return new Response(JSON.stringify({ newUser }), {
    //   status: 201,
    //   headers: { "Content-Type": "application/json" },
    // });

    // Load zip data using JSZip
    const zip = new JSZip();
    const contents = zipData ? await zip.loadAsync(zipData) : null;

    // return new Response(JSON.stringify({ newUser }), {
    //   status: 201,
    //   headers: { "Content-Type": "application/json" },
    // });

    // Find the DICOM file inside the zip. Simple approach: look for '.dcm' or take the first file.
    const fileNames = contents ? Object.keys(contents.files) : [];
    let dicomFileName = fileNames.find((name) =>
      name.toLowerCase().endsWith(".dcm")
    );

    // console.log({ fileNames });
    // return new Response(JSON.stringify({ newUser }), {
    //   status: 201,
    //   headers: { "Content-Type": "application/json" },
    // });

    // If no .dcm found, try the first file that isn't a directory
    if (!dicomFileName) {
      const firstFile = fileNames
        .map((name) => contents?.files[name])
        .find((file) => !file?.dir);

      if (!firstFile) {
        // Return 400 if zip is empty or only contains folders
        return new Response(
          JSON.stringify({
            error:
              "No DICOM file found inside the zip or the zip is empty/contains only folders.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      console.warn(
        `No .dcm file found, attempting to process the first file: ${firstFile.name}`
      );
      dicomFileName = firstFile.name; // Use the first actual file's name
    }

    if (contents) {
      const dicomFile: JSZip.JSZipObject =
        contents.files[dicomFileName as string]; // dicomFileName is guaranteed to be a string here

      if (dicomFile.dir) {
        // Should not happen with the logic above, but added for safety
        // return res.status(400).json({
        //   error: "Selected file inside zip is a directory, not a DICOM file.",
        // });
        return new Response(
          JSON.stringify({
            error: "Selected file inside zip is a directory, not a DICOM file.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Get the DICOM file content as an ArrayBuffer
      const arrayBuffer: ArrayBuffer = await dicomFile.async("arraybuffer");
      const byteArray: Uint8Array = new Uint8Array(arrayBuffer);

      interface DicomDataSet {
        string: (tag: string) => string | undefined;
        // Add other methods if you use them, e.g.:
        // int16: (tag: string) => number | undefined;
        // sequence: (tag: string) => { items: Array<DicomDataSet | any> } | undefined;
        // ...
      }

      // Parse the DICOM data using dicomParser.
      // Wrap in try-catch as parsing can fail on invalid DICOM.
      let dataSet: DicomDataSet; // Use any for the parser result if specific types are hard to get
      try {
        dataSet = dicomParser.parseDicom(byteArray);
      } catch (parseError) {
        console.error("DICOM parsing failed:", parseError);
        // Return 400 if DICOM parsing fails
        // return res.status(400).json({
        //   error: "Failed to parse DICOM file.",
        //   details: parseError.message,
        // });
        return new Response(
          JSON.stringify({
            error: "Failed to parse DICOM file.",
            details: "Failed to parse DICOM file.", //parseError.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Extract desired metadata tags using the dataSet object
      const extractedMetadata: DicomMetadataResponse = {
        patientName: dataSet.string("x00100010"),
        patientID: dataSet.string("x00100020"),
        studyDescription: dataSet.string("x00081030"),
        seriesDescription: dataSet.string("x0008103E"),
        modality: dataSet.string("x00080060"),
        studyDate: dataSet.string("x00080020"),
        // Add more tags here as needed, check dicomParser docs or DICOM standard
        // E.g., Manufacturer: dataSet.string('x00080070')
        // E.g., Study Instance UID: dataSet.string('x0020000D')
      };

      // Respond with the extracted metadata using the SuccessResponse interface
      // res.status(200).json({ metadata: extractedMetadata });
      return new Response(
        JSON.stringify({
          metadata: extractedMetadata,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // Catch any other unexpected errors during the process
    console.error("Error processing DICOM file:", error);
    // Return 500 for internal server errors
    // res.status(500).json({
    //   error: "Internal server error processing file.",
    //   details: error.message,
    // });

    return new Response(
      JSON.stringify({
        error: "Internal server error processing file.",
        details: "Internal server error processing file.", //error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
