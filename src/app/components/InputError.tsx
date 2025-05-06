export default function InputError({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-1 text-sm text-red-400">{children}</div>;
}
