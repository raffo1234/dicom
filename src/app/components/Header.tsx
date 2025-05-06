import { Icon } from "@iconify/react";
import Link from "next/link";
import ProfilePopover from "@/components/ProfilePopover";

export default function Header() {
  return (
    <header className="w-full mb-12">
      <nav className="max-w-[1816px] w-full mx-auto p-4 justify-between flex items-center">
        <Link
          href="/"
          title="Inicio | Inmobiliaria"
          className="flex items-center gap-2 text-sm font-semibold uppercase"
        >
          <span className="p-2 rounded-xl bg-cyan-500 block w-[46px] h-[46px]">
            <Icon
              icon="solar:home-smile-bold"
              className="text-3xl text-white"
            />
          </span>
        </Link>
        <ProfilePopover />
      </nav>
    </header>
  );
}
