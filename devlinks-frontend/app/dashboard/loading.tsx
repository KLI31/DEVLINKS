export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-20 rounded-xl bg-muted/50" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-muted/50" />
        <div className="h-64 rounded-xl bg-muted/50" />
      </div>
    </div>
  );
}
