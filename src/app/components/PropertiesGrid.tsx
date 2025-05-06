export default function PropertiesGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="grid gap-8"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(336px, 1fr))",
      }}
    >
      {children}
    </section>
  );
}
