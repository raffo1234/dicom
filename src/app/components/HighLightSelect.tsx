import { Icon } from "@iconify/react";

export default function HightLightSelect() {
  return (
    <a
      href="/inmuebles/favoritos"
      title="Favoritos"
      className="mb-8 py-2 group px-6 border inline-block border-gray-300 rounded-xl transition-colors hover:border-cyan-300 active:border-cyan-400"
    >
      <span className="flex items-center gap-2">
        <span>Favoritos</span>
        <Icon icon="solar:heart-bold" className="text-cyan-300" />
      </span>
    </a>
  );
}
