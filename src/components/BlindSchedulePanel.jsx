import SectionCard from './SectionCard.jsx';
import { formatDateTimeLabel } from '../lib/gameLogic.js';

export default function BlindSchedulePanel({ schedule, currentBlind }) {
  return (
    <SectionCard title="Blinds" subtitle="Blindstruktur">
      {schedule.length ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
          <div className="grid grid-cols-[72px_104px_1fr_78px] bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory-100/60">
            <div>Lvl</div>
            <div>Blind</div>
            <div>Tid</div>
            <div>Min</div>
          </div>
          <div className="divide-y divide-white/5">
            {schedule.map((level) => {
              const isCurrent = currentBlind?.level.level === level.level && currentBlind.status !== 'ended';

              return (
                <div
                  key={level.level}
                  className={`grid grid-cols-[72px_104px_1fr_78px] px-4 py-3 text-sm ${
                    isCurrent ? 'bg-brass-500/10 text-ivory-50' : 'bg-black/10 text-ivory-100/75'
                  }`}
                >
                  <div className="font-semibold">{level.level}</div>
                  <div>
                    {level.smallBlind}/{level.bigBlind}
                  </div>
                  <div>
                    {formatDateTimeLabel(new Date(level.startMs))} - {formatDateTimeLabel(new Date(level.endMs))}
                  </div>
                  <div>{level.durationMinutes}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-ivory-100/60">
          Sett starttid og sluttid for å generere blindstruktur.
        </div>
      )}
    </SectionCard>
  );
}
