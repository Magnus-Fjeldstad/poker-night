import SectionCard from './SectionCard.jsx';
import { formatClock, formatDateTimeLabel } from '../lib/gameLogic.js';

function formatCompactClock(ms) {
  const fullClock = formatClock(ms);
  return fullClock.startsWith('00:') ? fullClock.slice(3) : fullClock;
}

function formatRemainingClock(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours >= 1) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return formatCompactClock(safeMs);
}

export default function TimerPanel({ now, settings, currentBlind }) {
  const start = settings.gameStart ? new Date(settings.gameStart).getTime() : null;
  const end = settings.gameEnd ? new Date(settings.gameEnd).getTime() : null;
  const hasWindow = Number.isFinite(start) && Number.isFinite(end) && end > start;
  const beforeStart = hasWindow && now < start;
  const afterEnd = hasWindow && now >= end;
  const remaining = hasWindow ? Math.max(0, end - now) : 0;
  const nextBlindChangeMs = currentBlind
    ? currentBlind.status === 'pending'
      ? Math.max(0, currentBlind.level.startMs - now)
      : currentBlind.status === 'ended'
        ? 0
        : Math.max(0, currentBlind.level.endMs - now)
    : 0;
  const nextBlindLabel = currentBlind
    ? currentBlind.status === 'pending'
      ? 'Første nivå om'
      : currentBlind.status === 'ended'
        ? 'Blindstruktur ferdig'
        : 'Neste blindøkning om'
    : 'Neste blindøkning om';

  return (
    <SectionCard title="Timer" subtitle="Spilletid">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-felt-800/65 to-felt-950/90 p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-brass-300/75">Status</div>
          <div className="mt-3 text-3xl text-ivory-50 sm:text-4xl">
            {beforeStart ? 'Venter på start' : afterEnd ? 'Spillet er ferdig' : 'Spillet pågår'}
          </div>
          <div className="mt-3 text-sm text-ivory-100/70">
            {formatDateTimeLabel(settings.gameStart)} til {formatDateTimeLabel(settings.gameEnd)}
          </div>

          <div className="mt-6">
            <div className="stat-card min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Gjenstår</div>
              <div className="mt-2 break-keep font-mono text-[clamp(1.75rem,3.2vw,2.8rem)] leading-none tracking-[-0.06em] tabular-nums text-ivory-50">
                {formatRemainingClock(remaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Nåværende blind</div>
            <div className="mt-2 text-3xl text-ivory-50">
              {currentBlind ? `${currentBlind.level.smallBlind}/${currentBlind.level.bigBlind}` : 'Ikke satt'}
            </div>
            <div className="mt-2 text-sm text-ivory-100/60">
              {currentBlind?.status === 'pending'
                ? 'Første nivå starter ved game start.'
                : currentBlind?.status === 'ended'
                  ? 'Blindstrukturen er ferdig.'
                  : `Level ${currentBlind?.level.level} er aktivt.`}
            </div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">Neste endring</div>
            <div className="mt-2 text-xl text-ivory-50">
              {currentBlind ? formatDateTimeLabel(new Date(currentBlind.level.endMs)) : 'Ikke tilgjengelig'}
            </div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase tracking-[0.18em] text-ivory-100/55">{nextBlindLabel}</div>
            <div className="mt-2 break-keep font-mono text-[clamp(1.75rem,3vw,2.4rem)] leading-none tracking-[-0.05em] tabular-nums text-ivory-50">
              {currentBlind?.status === 'ended' ? '00:00' : formatCompactClock(nextBlindChangeMs)}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
