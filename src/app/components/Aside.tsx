"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const pages = [
  {
    href: "/admin/dicom",
    title: "Upload Dicom",
    iconName: "solar:cloud-upload-broken",
  },
  {
    href: "/admin/dicoms",
    title: "Dicoms",
    iconName: "solar:bones-broken",
  },
  {
    href: "/admin/users",
    title: "Users",
    iconName: "solar:user-linear",
  },
  {
    href: "/admin/roles",
    title: "Roles",
    iconName: "solar:user-check-broken",
  },
  {
    href: "/admin/permisos",
    title: "Permissions",
    iconName: "solar:lock-keyhole-broken",
  },
  {
    href: "/admin/templates",
    title: "Templates",
    iconName: "solar:file-favourite-line-duotone",
  },
];

export default function Aside({
  userName,
  userImage,
}: {
  userName: string;
  userImage: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  return (
    <div className="flex-shrink-0">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${
          isOpen ? "text-cyan-500" : ""
        } lg:invisible z-20 visible absolute right-2 top-4 bg-white w-12 h-12 border border-gray-200 rounded-xl flex justify-center items-center`}
      >
        <Icon icon="solar:hamburger-menu-broken" fontSize={24} />
      </button>
      <section
        className={`${
          isOpen
            ? "opacity-100 visible translate-x-0"
            : "invisible opacity-0 lg:visible lg:opacity-100 lg:translate-x-0 -translate-x-2"
        } transition-all lg:w-[286px] min-h-lvh w-full absolute left-0 top-0 lg:static py-8 px-5 bg-white z-10`}
      >
        <header className="mb-20">
          <div className="flex gap-4 items-center">
            <Image
              src={userImage}
              alt={userName}
              className="rounded-full bg-neutral-200"
              height={48}
              width={48}
            />
            <div className="">
              <p className="text-sm leading-3 mb-1 text-gray-500">Welcome</p>
              <h3 className="font-semibold text-gray-700 text-lg">
                {userName}
              </h3>
            </div>
          </div>
        </header>
        <nav>
          <ul className="flex flex-col text-sm">
            {pages.map(({ href, title, iconName }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={title}
                  className={`${
                    href === currentPath ? "bg-gray-100" : ""
                  } hover:bg-gray-50 rounded-xl py-3 px-4 gap-3.5 flex items-center transition-colors duration-300 `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon icon={iconName} fontSize={19} />
                  <span>{title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
}
