import Typologies from "./Typologies";
import { Icon } from "@iconify/react";
import { PropertyPhase } from "@/types/propertyState";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Like from "./Like";
import GetInTouch from "./GetInTouch";
import PropertyImages from "./PropertyImages";
import Image from "next/image";
import { PropertyType } from "@/types/propertyType";

export default function Property({
  property,
  userEmail,
}: {
  property: PropertyType | null | undefined;
  userEmail: string | undefined | null;
}) {
  if (!property) return null;

  const {
    id,
    title,
    bathroom_count,
    bedroom_count,
    phase,
    delivery_at,
    price,
    location,
    company,
  } = property;

  return (
    <>
      <div className="mx-auto max-w-[1250px] w-full mb-6">
        <div className="mb-4">
          <h2 className="md:text-2xl text-lg mb-2 font-semibold">{title}</h2>
          {location ? <p className="text-sm">{location}</p> : null}
        </div>
        <div className="flex items-center gap-3 w-full justify-between mb-4">
          {company ? (
            <a
              href={`/empresa/${company.id}`}
              title={company.name}
              className="flex items-center gap-2"
            >
              <Image
                src={company.logo_url}
                alt={company.name}
                className="w-24"
                height="96"
                width="96"
              />
              <span>{company.name}</span>
            </a>
          ) : null}
          <div className="flex gap-3">
            <Like propertyId={id} userEmail={userEmail} />
            {company ? (
              <GetInTouch
                propertyId={id}
                companyName={company.name}
                companyLogo={company.logo_url}
                propertyTitle={property.title}
              />
            ) : null}
          </div>
        </div>
        <div className="lg:flex items-start gap-3">
          <div className="flex-grow lg:w-3/5 mb-2">
            <PropertyImages
              propertyTitle={property.title}
              propertyId={property.id}
            />
          </div>
          <section
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
            }}
          >
            <div className="rounded-lg p-4 bg-[#FFF7E1]">
              <div className="p-2 inline-block rounded-lg bg-[#F3B408] mb-1">
                <Icon
                  icon="iconoir:bed-ready"
                  className="text-3xl text-white"
                />
              </div>
              <div className="text-sm font-semibold mb-1">{phase}</div>
              {phase === PropertyPhase.PLANOS ||
              phase === PropertyPhase.CONSTRUCCION ? (
                <div className="text-sm">
                  <span className="text-xs">Entrega:</span>{" "}
                  <span className="font-semibold">
                    {delivery_at &&
                      format(new Date(delivery_at), "dd MMMM, yyyy", {
                        locale: es,
                      })}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="rounded-lg p-4 bg-[#E6ECFF]">
              <div className="p-2 inline-block rounded-lg bg-[#476CF6] mb-1">
                <Icon
                  icon="lucide:bed-double"
                  className="text-3xl text-white"
                />
              </div>
              <div className="text-sm text-gray-400 mb-1">Dormitorios</div>
              <div className="text-xl font-semibold">{bedroom_count}</div>
            </div>
            <div className="rounded-lg p-4 bg-[#DAF8F7]">
              <div className="p-2 inline-block rounded-lg bg-[#2FCCCC] mb-1">
                <Icon
                  icon="lucide-lab:shower"
                  className="text-3xl text-white"
                />
              </div>
              <div className="text-sm text-gray-400 mb-1">Ba&ntilde;os</div>
              <div className="text-xl font-semibold">{bathroom_count}</div>
            </div>
            <div className="rounded-lg p-4 bg-[#E5E3FF]">
              <div className="p-2 inline-block rounded-lg bg-[#8C75FF] mb-1">
                <Icon
                  icon="solar:tag-price-linear"
                  className="text-3xl text-white"
                />
              </div>
              <div className="text-sm text-gray-400 mb-1">Precio desde</div>
              <div>
                <span className="text-xl font-semibold">S/. {price}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      {property.description ? (
        <>
          <h3 className="mb-6 text-xl font-semibold">Conoce mas:</h3>
          <p className="leading-relaxed">{property.description}</p>
        </>
      ) : null}
      <div className="py-20">
        {company ? (
          <>
            <div className="relative w-full py-12">
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100" />
              <a
                href={`/empresa/${company.id}`}
                title={company.name}
                className="left-1/2 -translate-x-1/2 absolute top-1/2 -translate-y-1/2 p-3 bg-white"
              >
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  width={80}
                  height={80}
                  className="h-20"
                />
              </a>
            </div>
            <div className="flex flex-col items-center gap-2">
              <a href={`/empresa/${company.id}`} title={company.name}>
                {company.name}
              </a>
              <div>
                <GetInTouch
                  propertyId={id}
                  companyName={company.name}
                  companyLogo={company.logo_url}
                  propertyTitle={property.title}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
      <Typologies propertyId={property.id} />
    </>
  );
}
