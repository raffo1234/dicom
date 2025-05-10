import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";

export default async function Index() {
  return (
    <div className="flex flex-col justify-center items-center gap-5 sm:gap-7">
      <h1
        className="leading-13 sm:leading-20 tracking-tighter"
        style={{
          fontSize: "clamp(14px, 10vw + .3rem, 70px)",
          fontFamily: "poppins",
        }}
      >
        Your Scans, Instantly Accessible
      </h1>
      <p className="sm:text-xl text-gray-500">
        Process DICOM & Create Reports with Ease
      </p>
      <Link
        href="/admin/dicom"
        title="Explore Now"
        style={{ fontFamily: "poppins" }}
        className="text-lg flex items-center gap-4 px-8 py-3 bg-black text-white rounded-full transition-colors duration-700 hover:bg-gray-800 active:bg-gray-900"
      >
        <span>Explore Now</span>
        <Icon icon="solar:arrow-right-linear" fontSize={24}></Icon>
      </Link>
      <Image
        src="/radiologist.png"
        width="1000"
        height={1000}
        alt="Radiologist"
        className="sm:aspect-[5/3] aspect-[4/3] object-cover rounded-2xl "
      />
    </div>
  );
}
