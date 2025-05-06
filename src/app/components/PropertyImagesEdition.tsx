import { Icon } from "@iconify/react";

export default function PropertyImagesEdition({
  propertyImages,
}: {
  propertyImages: { image_url: string }[];
}) {
  const onDelete = () => {
    console.log("delete");
  };

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      }}
    >
      {propertyImages?.map(({ image_url }) => {
        return (
          <div key={image_url}>
            <img
              key={image_url}
              src={image_url}
              alt="Inmueble"
              className="w-full aspect-[5/4] object-cover rounded-xl bg-gray-100"
            />
            <div className="flex justify-center border-x border-b border-gray-100 -mt-3 pt-6 pb-3 px-4 rounded-b-xl">
              <button
                onClick={onDelete}
                type="button"
                className="hover:border-gray-200 w-11 h-11 rounded-full border-gray-100 border text-red-500 flex items-center justify-center"
              >
                <Icon
                  icon="solar:trash-bin-minimalistic-broken"
                  fontSize={24}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
