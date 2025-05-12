export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-[1816px] mt-5 sm:mt-12 mx-auto pb-20 px-4">
      {children}
    </main>
  );
}
