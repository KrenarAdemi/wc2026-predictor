export default function Leaderboard({ standings, currentMemberId }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-700 bg-[#151c30]">
      <div className="border-b border-slate-700 px-5 py-4">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Player</th>
              <th className="px-5 py-3">Pts</th>
              <th className="px-5 py-3">Correct</th>
              <th className="px-5 py-3">Exact</th>
              <th className="px-5 py-3">Guesses</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((member, index) => (
              <tr
                key={member.id}
                className={`border-t border-slate-700 ${
                  member.id === currentMemberId ? "bg-cyan-400/10" : ""
                }`}
              >
                <td className="px-5 py-4 text-[#f5b400]">{index + 1}</td>

                <td className="px-5 py-4 font-medium">
                  {member.firstName} {member.lastName}
                  {member.id === currentMemberId && (
                    <span className="ml-2 rounded bg-cyan-400/20 px-2 py-1 text-xs text-cyan-300">
                      You
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-[#f5b400]">{member.points}</td>
                <td className="px-5 py-4">{member.correct}</td>
                <td className="px-5 py-4 text-emerald-400">{member.exact}</td>
                <td className="px-5 py-4">{member.guesses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}