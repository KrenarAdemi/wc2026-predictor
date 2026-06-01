export default function StatCard({ value, label, accent = "yellow" }) {
  const accentClasses = {
    yellow: "text-[#f5b400]",
    green: "text-emerald-400",
    blue: "text-cyan-300",
    red: "text-rose-400",
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30] p-4 sm:p-5">
      <p
        className={`break-words text-2xl font-semibold sm:text-3xl ${accentClasses[accent]}`}
      >
        {value}
      </p>

      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
        {label}
      </p>
    </div>
  );
}