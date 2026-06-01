import { useState } from "react";

const groups = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function NationsGrid({ nations }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  const filteredNations = nations.filter((nation) => {
    const searchValue = searchTerm.trim().toLowerCase();

    const matchesSearch =
      nation.name.toLowerCase().includes(searchValue) ||
      nation.code.toLowerCase().includes(searchValue) ||
      nation.player.toLowerCase().includes(searchValue) ||
      nation.info.toLowerCase().includes(searchValue) ||
      nation.fact.toLowerCase().includes(searchValue);

    const matchesGroup =
      activeGroup === "All" || nation.group === activeGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Nations</h3>
            <p className="mt-1 text-sm text-slate-400">
              Explore all 48 World Cup 2026 teams by group, country, or player.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`rounded-lg px-3 py-2 text-xs ${
                  activeGroup === group
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {group === "All" ? "All groups" : `Group ${group}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            placeholder="Search nation, code, player, or fact..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0d1324] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />

          <button
            onClick={() => {
              setSearchTerm("");
              setActiveGroup("All");
            }}
            className="rounded-xl border border-slate-700 bg-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600"
          >
            Reset
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Showing {filteredNations.length} of {nations.length} nations
        </p>
      </div>

      {filteredNations.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5 text-center text-sm text-slate-400">
          No nations found.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredNations.map((nation) => (
          <div
            key={nation.name}
            className="rounded-xl border border-slate-700 bg-[#151c30] p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{nation.name}</h3>

              <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                {nation.code}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-400">
              Group {nation.group}
            </p>

            <p className="mb-3 text-sm leading-6 text-slate-300">
              {nation.info}
            </p>

            <p className="text-sm">
              <span className="text-[#f5d36b]">Player to watch:</span>{" "}
              {nation.player}
            </p>

            <p className="mt-2 text-sm text-slate-400">{nation.fact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}