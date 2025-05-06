export default function TypologiesGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="grid gap-8"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(236px, 1fr))",
      }}
    >
      {children}
    </section>
  );
}
