import Image from "next/image";

export default async function Index() {
  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h1
        className="leading-16 sm:leading-20"
        style={{
          fontSize: "clamp(18px, 12vw + .3rem, 70px)",
        }}
      >
        Your Scans, Instantly Accessible
      </h1>
      <p className="text-md sm:text-xl text-gray-500">
        Bringing Clarity to Every Medical Image
      </p>
      <Image
        src="/radiologist.png"
        width="1000"
        height={1000}
        alt="Radiologist"
        className="sm:aspect-[5/3] aspect-[3/4] object-cover rounded-2xl "
      />
    </div>
  );
}
