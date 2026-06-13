export default function AdSlot({ label = "Ad" }: { label?: string }) {
  return (
    <div className="my-4 rounded-xl border border-dashed border-app bg-app-soft p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-app-muted mb-2">
        {label}
      </p>
      <div className="h-24 grid place-items-center text-app-muted text-sm">
        <p>AdSense placement</p>
      </div>
    </div>
  );
}
