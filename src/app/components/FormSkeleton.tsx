export default function TableSkeleton({ rows = 1 }) {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="w-full 
        pulse">
          <div className="bg-gray-200 mb-2 w-1/3 rounded-lg h-6 flex-grow"></div>
          <div className="bg-gray-100 rounded-lg h-12 flex-grow"></div>
        </div>
      ))}
      <div className="mt-4 animate-pulse w-1/3 flex gap-4">
        <div className="bg-gray-100 rounded-lg h-12 flex-grow"></div>
        <div className="bg-gray-100 rounded-lg h-12 flex-grow"></div>
      </div>
    </div>
  );
}
