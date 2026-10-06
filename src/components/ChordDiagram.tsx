import type { Position } from "../chords/diagrams";

const STRINGS = 6;
const FRETS = 4;
const SX = 16; // string spacing
const FY = 20; // fret spacing
const LEFT = 22; // room for the "5fr" label
const TOP = 18; // room for open/muted marks
const W = LEFT + SX * (STRINGS - 1) + 12;
const H = TOP + FY * FRETS + 8;

const x = (string: number) => LEFT + string * SX;
const y = (fret: number) => TOP + (fret - 0.5) * FY;

// Classic box diagram: strings vertical (low E on the left), nut on top.
export default function ChordDiagram({ position }: { position: Position }) {
  const { frets, fingers, baseFret, barres } = position;

  // A barre spans the strings fretted at that fret.
  const barreSpans = barres.map((fret) => {
    const strings = frets.flatMap((f, i) => (f === fret ? [i] : []));
    return { fret, from: Math.min(...strings), to: Math.max(...strings) };
  });
  const inBarre = (string: number, fret: number) =>
    barreSpans.some((b) => b.fret === fret && string >= b.from && string <= b.to);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * 1.25} height={H * 1.25} role="img">
      {/* frets */}
      {Array.from({ length: FRETS + 1 }, (_, i) => (
        <line key={i} x1={x(0)} x2={x(STRINGS - 1)} y1={TOP + i * FY} y2={TOP + i * FY}
          stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} />
      ))}
      {/* nut, or the starting fret number */}
      {baseFret === 1 ? (
        <line x1={x(0) - 0.5} x2={x(STRINGS - 1) + 0.5} y1={TOP} y2={TOP} stroke="currentColor" strokeWidth={3.5} />
      ) : (
        <text x={LEFT - 6} y={y(1) + 3.5} textAnchor="end" fontSize={9} fill="currentColor" fontStyle="italic">
          {baseFret}fr
        </text>
      )}
      {/* strings */}
      {Array.from({ length: STRINGS }, (_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={TOP} y2={TOP + FRETS * FY}
          stroke="currentColor" strokeOpacity={0.6} strokeWidth={1} />
      ))}
      {/* open and muted strings */}
      {frets.map((f, i) =>
        f === 0 ? (
          <circle key={i} cx={x(i)} cy={TOP - 8} r={3.5} fill="none" stroke="currentColor" strokeWidth={1.2} />
        ) : f < 0 ? (
          <text key={i} x={x(i)} y={TOP - 4.5} textAnchor="middle" fontSize={10} fill="currentColor">
            ×
          </text>
        ) : null,
      )}
      {/* barres */}
      {barreSpans.map((b) => (
        <rect key={b.fret} x={x(b.from) - 6.5} y={y(b.fret) - 6.5} width={x(b.to) - x(b.from) + 13}
          height={13} rx={6.5} fill="var(--carmin)" />
      ))}
      {/* fingers */}
      {frets.map((f, i) =>
        f > 0 && !inBarre(i, f) ? (
          <g key={i}>
            <circle cx={x(i)} cy={y(f)} r={6.5} fill="var(--carmin)" />
            {fingers[i] ? (
              <text x={x(i)} y={y(f) + 3.2} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#fff">
                {fingers[i]}
              </text>
            ) : null}
          </g>
        ) : null,
      )}
    </svg>
  );
}
