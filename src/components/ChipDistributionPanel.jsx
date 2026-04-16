import SectionCard from './SectionCard.jsx';
import { describeChipCounts, formatCurrency, formatNumber } from '../lib/gameLogic.js';

export default function ChipDistributionPanel({ players }) {
  const buyInRows = players.flatMap((player) =>
    player.buyIns.map((buyIn) => ({
      key: buyIn.id,
      playerName: player.name,
      amount: buyIn.amount,
      stack: buyIn.stack,
    })),
  );

  return (
    <SectionCard title="Chips" subtitle="Chipfordeling">
      <div className="space-y-4">
        {buyInRows.length ? (
          buyInRows.map((row) => (
            <div
              key={row.key}
              className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/15 p-5 lg:grid-cols-[180px_1fr]"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">{row.playerName}</div>
                <div className="mt-2 text-2xl text-ivory-50">{formatCurrency(row.amount)}</div>
                <div className="mt-1 text-sm text-ivory-100/60">
                  {formatNumber(row.stack.totalUnits)} units • {formatNumber(row.stack.openingBigBlinds)} BB
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="stat-card">
                  <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Fordeling</div>
                  <div className="mt-2 text-sm leading-6 text-ivory-100/75">{describeChipCounts(row.stack.counts)}</div>
                </div>
                <div className="stat-card">
                  <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Totalt</div>
                  <div className="mt-2 text-sm leading-6 text-ivory-100/70">
                    {formatNumber(row.stack.totalChips)} chips totalt fordelt over de tilgjengelige valørene.
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-ivory-100/55">
            Legg til spillere og buy-ins for å se chipfordeling.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
