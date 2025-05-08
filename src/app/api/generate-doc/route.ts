// pages/api/generate-doc.js (Next.js API Route)
import { Document, Header, ImageRun, Footer, Packer, Paragraph } from "docx";
import { NextRequest } from "next/server";

async function getBufferImage(url: string) {
  const responseSign = await fetch(url);
  const arrayBuffer = await responseSign.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        metadata: { message: "Method Not Allowed" },
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { html } = await req.json();

  // return new Response(JSON.stringify({ message: html }), {
  //   status: 200,
  //   headers: { "Content-Type": "application/json" },
  // });

  // data: await getBufferImage(
  //   "https://ihykrbwvzhpvedkygqfk.supabase.co/storage/v1/object/public/dicoms/template_user_301a08cd-c1f2-41b0-8723-04d83db4473d/6c709f02-6800-4ffd-a582-307fed670cc3/header/header_6c709f02-6800-4ffd-a582-307fed670cc3_110d7cb8-159b-43e9-b2e2-89d83bf7333d.png"
  // ),

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: await getBufferImage(
                      "https://ihykrbwvzhpvedkygqfk.supabase.co/storage/v1/object/public/dicoms/template_user_301a08cd-c1f2-41b0-8723-04d83db4473d/6c709f02-6800-4ffd-a582-307fed670cc3/header/header_6c709f02-6800-4ffd-a582-307fed670cc3_110d7cb8-159b-43e9-b2e2-89d83bf7333d.png"
                    ),
                    type: "png",
                    transformation: {
                      width: 600,
                      height: 150,
                    },
                  }),
                ],
              }),
              new Paragraph(""),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: await getBufferImage(
                      "https://ihykrbwvzhpvedkygqfk.supabase.co/storage/v1/object/public/dicoms/template_user_301a08cd-c1f2-41b0-8723-04d83db4473d/6c709f02-6800-4ffd-a582-307fed670cc3/footer/footer_6c709f02-6800-4ffd-a582-307fed670cc3_2b8f5000-7afd-4517-a233-e504122804a2.png"
                    ),
                    type: "png",
                    transformation: {
                      width: 600,
                      height: 100,
                    },
                  }),
                ],
              }),
            ],
          }),
        },
        children: [new Paragraph(html)],
      },
    ],
  });

  try {
    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": "attachment; filename=document.docx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return new Response(
      JSON.stringify({ message: "Error generating document" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
