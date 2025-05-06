import { Icon } from "@iconify/react";

import Link from "next/link";

export default function EditProperty({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/property/edit/${id}`}
      className="rounded-full w-11 h-11 border-gray-100 hover:border-gray-200 transition-colors duration-500 border flex items-center justify-center"
    >
      <Icon icon="solar:clapperboard-edit-broken" fontSize={24} />
    </Link>
  );
}
