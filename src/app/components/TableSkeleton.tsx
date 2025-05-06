function SkeletonRow({ cols = 3 }) {
  return (
    <div className="w-full flex gap-2 animate-pulse">
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-12 flex-grow"></div>
      ))}
    </div>
  );
}

export default function TableSkeleton({ rows = 3, cols = 1 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex gap-2 animate-pulse">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-7 flex-grow"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  );
}
