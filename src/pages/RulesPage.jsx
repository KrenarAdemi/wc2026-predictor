export default function RulesPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h3 className="mb-2 text-lg font-semibold">Points System</h3>

        <p className="text-sm leading-6 text-slate-400">
          Predict the final score before kickoff. Once the match starts, the game
          locks and predictions can no longer be changed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
          <p className="text-3xl font-semibold text-emerald-400">10</p>
          <h4 className="mt-3 font-semibold">Exact score</h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            You guessed the correct winner or draw and the exact final score.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
          <p className="text-3xl font-semibold text-cyan-300">7</p>
          <h4 className="mt-3 font-semibold">Correct draw</h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            You guessed the match would be a tie, but not the exact tie score.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
          <p className="text-3xl font-semibold text-[#f5b400]">5</p>
          <h4 className="mt-3 font-semibold">Correct winner</h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            You guessed the correct winning team, but not the exact score.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
          <p className="text-3xl font-semibold text-rose-400">0</p>
          <h4 className="mt-3 font-semibold">Wrong or missed</h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            You guessed the wrong result, or you did not make a prediction.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h3 className="mb-4 text-lg font-semibold">Examples</h3>

        <div className="grid gap-4 text-sm text-slate-300">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Final score: Germany 2 - 1 Turkey
            </p>

            <p className="mt-2">
              Your prediction: Germany 1 - 2 Turkey
            </p>

            <p className="mt-1 text-rose-400">
              You guessed Turkey to win. You get 0 points.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Final score: Germany 2 - 1 Turkey
            </p>

            <p className="mt-2">
              Your prediction: Germany 2 - 0 Turkey
            </p>

            <p className="mt-1 text-[#f5b400]">
              You guessed Germany to win, but not the exact score. You get 5
              points.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Final score: Germany 2 - 1 Turkey
            </p>

            <p className="mt-2">
              Your prediction: Germany 2 - 1 Turkey
            </p>

            <p className="mt-1 text-emerald-400">
              You guessed the exact score. You get 10 points.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Final score: Germany 2 - 2 Turkey
            </p>

            <p className="mt-2">
              Your prediction: Germany 1 - 1 Turkey
            </p>

            <p className="mt-1 text-cyan-300">
              You guessed the game would be a tie, but not the exact tie score.
              You get 7 points.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Final score: Germany 2 - 2 Turkey
            </p>

            <p className="mt-2">
              Your prediction: Germany 2 - 2 Turkey
            </p>

            <p className="mt-1 text-emerald-400">
              You guessed the exact tie score. You get 10 points.
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="font-semibold text-white">
              Missed prediction
            </p>

            <p className="mt-2">
              You did not submit a prediction before kickoff.
            </p>

            <p className="mt-1 text-rose-400">
              You automatically get 0 points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}