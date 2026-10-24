export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-pulse md:gap-5">
      <div className="h-20 rounded-xl bg-muted/50" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-[22rem] rounded-xl bg-muted/50" />
        <div className="h-[22rem] rounded-xl bg-muted/50" />
      </div>
      <div className="h-72 rounded-xl bg-muted/50" />
    </div>
  );
}
