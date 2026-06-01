export default function StatCard({ value, label, accent = "yellow" }) {
  const accentClasses = {
    yellow: "text-[#f5b400]",
    green: "text-emerald-400",
    blue: "text-cyan-300",
    red: "text-rose-400",
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
      <p className={`text-3xl font-semibold ${accentClasses[accent]}`}>
        {value}
      </p>

      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
    </div>
  );
}