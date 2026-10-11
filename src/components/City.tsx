import { useState, type CSSProperties } from 'react';
import { Coffee, LocateFixed, MapPin, Minus, Moon, Plus, Sun, Pause, Play } from 'lucide-react';
import { OUTFITS } from './Pepe';

// Street spots for the player's employees, nearest the company plot first.
const COMMUTE_SPOTS: [number, number, number][] = [
  [330, 433, -7],
  [302, 406, -13],
  [320, 285, -2],
  [199, 309, -11],
  [420, 223, -5],
];

type Point = [number, number];
const iso = (x: number, y: number, z = 0): Point => [
  520 + (x - y) * 0.82,
  100 + (x + y) * 0.43 - z,
];
const points = (p: Point[]) => p.map((v) => v.join(',')).join(' ');

function Tile({
  x,
  y,
  w,
  d,
  z = 0,
  color,
  stroke,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  z?: number;
  color: string;
  stroke?: string;
}) {
  return (
    <polygon
      points={points([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)])}
      fill={color}
      stroke={stroke}
      strokeWidth="1"
    />
  );
}
function Box({
  x,
  y,
  w,
  d,
  h,
  z = 0,
  top = '#ece5ca',
  left = '#ded3b2',
  right = '#c9be9e',
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  top?: string;
  left?: string;
  right?: string;
}) {
  return (
    <g strokeLinejoin="round">
      <polygon
        points={points([
          iso(x, y + d, z),
          iso(x + w, y + d, z),
          iso(x + w, y + d, z + h),
          iso(x, y + d, z + h),
        ])}
        fill={left}
      />
      <polygon
        points={points([
          iso(x + w, y, z),
          iso(x + w, y + d, z),
          iso(x + w, y + d, z + h),
          iso(x + w, y, z + h),
        ])}
        fill={right}
      />
      <Tile x={x} y={y} w={w} d={d} z={z + h} color={top} />
    </g>
  );
}
function Tree({
  x,
  y,
  size = 1,
  autumn = false,
}: {
  x: number;
  y: number;
  size?: number;
  autumn?: boolean;
}) {
  const [px, py] = iso(x, y);
  return (
    <g transform={`translate(${px} ${py}) scale(${size})`}>
      <ellipse cx="7" cy="3" rx="24" ry="10" fill="#688368" opacity=".18" />
      <path
        d="M0 0v-39m0 17-12-12m12 8 12-16"
        stroke="#8b7958"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M-23-40c-10-14 2-32 12-31 0-20 31-25 39-7 19 1 28 28 12 41-2 16-25 22-34 12-13 6-26-2-29-15Z"
        fill={autumn ? '#d5b975' : '#78a775'}
      />
      <ellipse cx="-8" cy="-65" rx="19" ry="22" fill={autumn ? '#eed49a' : '#b3cd8b'} />
      <ellipse cx="14" cy="-68" rx="20" ry="26" fill={autumn ? '#e1c483' : '#9fc382'} />
      <ellipse cx="-12" cy="-44" rx="19" ry="17" fill={autumn ? '#e3c781' : '#97bf7e'} />
      <path d="m-14-73 5-5" stroke="#dfecb5" strokeWidth="3" strokeLinecap="round" opacity=".6" />
    </g>
  );
}
function TinyPepe({
  x,
  y,
  shirt = '#7894b9',
  walking = false,
  delay = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  shirt?: string;
  walking?: boolean;
  delay?: number;
  scale?: number;
}) {
  const [px, py] = iso(x, y);
  return (
    <g transform={`translate(${px} ${py}) scale(${scale})`}>
      <g className={walking ? 'walking-pepe' : undefined} style={{ animationDelay: `${delay}s` }}>
        <ellipse cy="2" rx="9" ry="4" fill="#475e41" opacity=".19" />
        <path d="M-4-3v4M4-3v4" stroke="#455253" strokeWidth="4" strokeLinecap="round" />
        <rect x="-7" y="-16" width="14" height="15" rx="4" fill={shirt} />
        <path d="m-8-11-3 7m19-7 3 7" stroke="#80a95e" strokeWidth="4" strokeLinecap="round" />
        <ellipse cy="-22" rx="11" ry="9" fill="#a8c875" />
        <ellipse cx="-5" cy="-27" rx="4.5" ry="5" fill="#bfd989" />
        <ellipse cx="5" cy="-27" rx="4.5" ry="5" fill="#bfd989" />
        <ellipse cx="-4" cy="-27" rx="3" ry="3.5" fill="#f5f0d2" />
        <ellipse cx="6" cy="-27" rx="3" ry="3.5" fill="#f5f0d2" />
        <circle cx="-3" cy="-27" r="1.4" fill="#395340" />
        <circle cx="7" cy="-27" r="1.4" fill="#395340" />
        <path
          d="M-6-20q6 4 13-1"
          stroke="#748254"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
function Lamp({ x, y, night }: { x: number; y: number; night: boolean }) {
  const [px, py] = iso(x, y);
  return (
    <g transform={`translate(${px} ${py})`}>
      <ellipse rx="7" ry="3" fill="#658478" opacity=".2" />
      <path d="M0 0v-48h12" fill="none" stroke="#5b7770" strokeWidth="3" strokeLinecap="round" />
      <path d="M5-46h14l-3 6H8Z" fill="#d4d3a1" />
      {night && (
        <>
          <circle cx="12" cy="-43" r="12" fill="#ffed9e" opacity=".25" />
          <ellipse cx="12" cy="2" rx="30" ry="13" fill="#ffefad" opacity=".12" />
        </>
      )}
    </g>
  );
}
function Planter({ x, y, flowers = false }: { x: number; y: number; flowers?: boolean }) {
  const [px, py] = iso(x, y, 8);
  return (
    <g>
      <Box x={x - 9} y={y - 8} w={18} d={16} h={8} top="#8d9470" left="#d2c6a3" right="#bbad8d" />
      <g transform={`translate(${px} ${py})`}>
        <ellipse cy="-4" rx="11" ry="7" fill="#78a269" />
        {flowers && (
          <>
            <circle cx="-5" cy="-8" r="3" fill="#e7b59f" />
            <circle cx="2" cy="-10" r="3" fill="#f6dd9c" />
            <circle cx="7" cy="-5" r="3" fill="#e7b59f" />
          </>
        )}
      </g>
    </g>
  );
}

export function Building({
  x = 0,
  y = 0,
  level = 0,
  night = false,
  variant = 'own',
  staff = 0,
}: {
  x?: number;
  y?: number;
  level?: number;
  night?: boolean;
  variant?: 'own' | 'blue' | 'peach' | 'cafe';
  staff?: number;
}) {
  const w = variant === 'own' ? 128 : variant === 'cafe' ? 103 : 110;
  const d = variant === 'own' ? 100 : 92;
  const floors =
    variant === 'blue' ? 3 : variant === 'peach' ? 2 : variant === 'cafe' ? 1 : level + 1;
  const h = variant === 'own' && level === 0 ? 69 : floors * 41 + 13;
  const palette =
    variant === 'blue'
      ? ['#bcd7cd', '#e3e7d4', '#b6cbc0']
      : variant === 'peach'
        ? ['#e6b69c', '#f3d6b4', '#d4aa91']
        : variant === 'cafe'
          ? ['#cfa37e', '#f2dfbc', '#d8c19d']
          : level >= 3
            ? ['#acd4cf', '#c1e2d7', '#90bab0']
            : ['#97bda0', '#f4e6bf', '#d9cea8'];
  const windowFill = night ? '#f6d483' : '#668b86';
  const frontWindow = (offset: number, z: number, key: string, occupied = false) => (
    <g key={key}>
      <polygon
        points={points([
          iso(x + offset, y + d + 0.5, z),
          iso(x + offset + 23, y + d + 0.5, z),
          iso(x + offset + 23, y + d + 0.5, z + 26),
          iso(x + offset, y + d + 0.5, z + 26),
        ])}
        fill={windowFill}
      />
      <polygon
        points={points([
          iso(x + offset + 2, y + d + 0.7, z + 3),
          iso(x + offset + 8, y + d + 0.7, z + 6),
          iso(x + offset + 21, y + d + 0.7, z + 25),
          iso(x + offset + 14, y + d + 0.7, z + 25),
        ])}
        fill={night ? '#fff0bd' : '#b6d8ca'}
        opacity=".6"
      />
      {occupied && (
        <g>
          <path
            d={`M${iso(x + offset + 3, y + d + 1, z + 5).join(' ')}l15 8`}
            stroke="#bcab7d"
            strokeWidth="4"
          />
          <ellipse
            cx={iso(x + offset + 12, y + d + 1, z + 12)[0]}
            cy={iso(x + offset + 12, y + d + 1, z + 12)[1]}
            rx="5"
            ry="4"
            fill="#b4cc79"
          />
          <circle
            cx={iso(x + offset + 12, y + d + 1, z + 12)[0] - 2}
            cy={iso(x + offset + 12, y + d + 1, z + 12)[1] - 3}
            r="2"
            fill="#dae9a4"
          />
        </g>
      )}
      <path
        d={`M${iso(x + offset + 11.5, y + d + 1, z).join(' ')}L${iso(x + offset + 11.5, y + d + 1, z + 26).join(' ')}`}
        stroke={palette[1]}
        strokeWidth="2.5"
      />
      <path
        d={`M${iso(x + offset - 2, y + d + 1, z).join(' ')}L${iso(x + offset + 25, y + d + 1, z).join(' ')}`}
        stroke="#f5eed5"
        strokeWidth="3"
      />
    </g>
  );
  return (
    <g className="city-building">
      <polygon
        points={points([
          iso(x + 14, y + 10),
          iso(x + w + 34, y + 18),
          iso(x + w + 34, y + d + 27),
          iso(x + 10, y + d + 27),
        ])}
        fill="#5e7a64"
        opacity=".14"
      />
      <Box
        x={x - 8}
        y={y - 8}
        w={w + 16}
        d={d + 16}
        h={5}
        top="#dedcca"
        left="#c4c5b2"
        right="#b5bca9"
      />
      <Box x={x} y={y} w={w} d={d} h={h} top={palette[0]} left={palette[1]} right={palette[2]} />
      {Array.from({ length: floors }, (_, floor) => (
        <g key={floor}>
          {Array.from({ length: variant === 'own' ? 4 : 3 }, (_, i) =>
            frontWindow(8 + i * 29, 10 + floor * 41, `${floor}-${i}`, staff > floor * 4 + i),
          )}
          {[16, 49].map((off, i) => (
            <g key={i}>
              <polygon
                points={points([
                  iso(x + w + 0.5, y + off, 11 + floor * 41),
                  iso(x + w + 0.5, y + off + 23, 11 + floor * 41),
                  iso(x + w + 0.5, y + off + 23, 37 + floor * 41),
                  iso(x + w + 0.5, y + off, 37 + floor * 41),
                ])}
                fill={windowFill}
              />
              <path
                d={`M${iso(x + w + 1, y + off + 12, 11 + floor * 41).join(' ')}L${iso(x + w + 1, y + off + 12, 37 + floor * 41).join(' ')}`}
                stroke={palette[2]}
                strokeWidth="3"
              />
            </g>
          ))}
          {floor > 0 && (
            <>
              <path
                d={`M${iso(x, y + d, 4 + floor * 41).join(' ')}L${iso(x + w, y + d, 4 + floor * 41).join(' ')}L${iso(x + w, y, 4 + floor * 41).join(' ')}`}
                stroke="#f9edcf"
                strokeWidth="5"
                fill="none"
              />
              <path
                d={`M${iso(x, y + d, 1 + floor * 41).join(' ')}L${iso(x + w, y + d, 1 + floor * 41).join(' ')}`}
                stroke="#c6c7ae"
                strokeWidth="1"
              />
            </>
          )}
        </g>
      ))}
      {variant === 'own' && level === 0 && (
        <>
          <polygon
            points={points([
              iso(x + 11, y + d + 1, 4),
              iso(x + 80, y + d + 1, 4),
              iso(x + 80, y + d + 1, 48),
              iso(x + 11, y + d + 1, 48),
            ])}
            fill="#9cae8c"
          />
          {[10, 19, 28, 37].map((z) => (
            <path
              key={z}
              d={`M${iso(x + 13, y + d + 2, z).join(' ')}L${iso(x + 78, y + d + 2, z).join(' ')}`}
              stroke="#bec6a7"
              strokeWidth="2"
            />
          ))}
          <path
            d={`M${iso(x + 38, y + d + 2, 10).join(' ')}L${iso(x + 52, y + d + 2, 10).join(' ')}`}
            stroke="#597b63"
            strokeWidth="2"
          />
          <polygon
            points={points([
              iso(x + 90, y + d + 1, 3),
              iso(x + 119, y + d + 1, 3),
              iso(x + 119, y + d + 1, 44),
              iso(x + 90, y + d + 1, 44),
            ])}
            fill="#426d61"
          />
          <polygon
            points={points([
              iso(x + 95, y + d + 2, 21),
              iso(x + 114, y + d + 2, 21),
              iso(x + 114, y + d + 2, 40),
              iso(x + 95, y + d + 2, 40),
            ])}
            fill={night ? '#ffdc87' : '#b9d5b5'}
          />
          {staff > 0 && (
            <g transform={`translate(${iso(x + 103, y + d + 3, 27).join(' ')})`}>
              <ellipse rx="6" ry="4" fill="#a4c36e" />
              <circle cx="-3" cy="-4" r="2.5" fill="#cfe1a2" />
              <circle cx="3" cy="-4" r="2.5" fill="#cfe1a2" />
            </g>
          )}
        </>
      )}
      <Box
        x={x - 5}
        y={y - 5}
        w={w + 10}
        d={d + 10}
        z={h}
        h={7}
        top={palette[0]}
        left={variant === 'cafe' ? '#a87857' : '#739b87'}
        right={variant === 'cafe' ? '#946749' : '#638776'}
      />
      <Tile
        x={x + 8}
        y={y + 8}
        w={w - 16}
        d={d - 16}
        z={h + 7.5}
        color={variant === 'cafe' ? '#d6b183' : '#adccb1'}
      />
      {variant !== 'cafe' && (
        <>
          <Box
            x={x + 15}
            y={y + 15}
            w={27}
            d={24}
            z={h + 8}
            h={13}
            top="#e8ead9"
            left="#ced4c6"
            right="#acbfb1"
          />
          <Tile x={x + 18} y={y + 18} w={21} d={18} z={h + 21.3} color="#b7c4b9" />
          <Box
            x={x + w - 34}
            y={y + 13}
            w={19}
            d={19}
            z={h + 8}
            h={8}
            top="#d1ddc4"
            left="#c1cdb5"
            right="#a7bca5"
          />
          <g transform={`translate(${iso(x + w - 24, y + 22, h + 17).join(' ')})`}>
            <ellipse rx="8" ry="4" fill="none" stroke="#788e7c" strokeWidth="1.5" />
            <path d="m-5-2 10 4m-10 0 10-4" stroke="#788e7c" />
          </g>
        </>
      )}
      {variant === 'cafe' && (
        <>
          <Box
            x={x - 5}
            y={y + d - 3}
            w={w + 10}
            d={25}
            z={40}
            h={4}
            top="#b87b63"
            left="#a86653"
            right="#946349"
          />
          {[0, 2, 4, 6].map((i) => (
            <Tile key={i} x={x - 5 + i * 16} y={y + d - 3} w={14} d={25} z={44.2} color="#f1e1bc" />
          ))}
          <g transform={`translate(${iso(x + 53, y + d + 1, 56).join(' ')}) rotate(27.65)`}>
            <rect x="-40" y="-13" width="80" height="19" rx="3" fill="#f8ebcc" />
            <text textAnchor="middle" y="0" fill="#715a45" fontSize="12" fontWeight="800">
              LILY’S CAFÉ
            </text>
          </g>
          <Box
            x={x + 20}
            y={y + d + 32}
            w={30}
            d={22}
            h={17}
            top="#deba8f"
            left="#bc9c74"
            right="#af8b65"
          />
          <TinyPepe x={x + 60} y={y + d + 48} shirt="#c78972" />
        </>
      )}
      {variant === 'own' && (
        <g transform={`translate(${iso(x + 68, y + d + 1, h - 5).join(' ')}) rotate(27.65)`}>
          <rect x="-32" y="-15" width="64" height="18" rx="3" fill="#fbf5dd" />
          <text textAnchor="middle" y="-2" fill="#4f6b4c" fontSize="10" fontWeight="800">
            PEPE & CO.
          </text>
        </g>
      )}
      {variant === 'blue' && (
        <g transform={`translate(${iso(x + w, y + 45, h - 10).join(' ')}) rotate(-27.65)`}>
          <rect x="-30" y="-15" width="62" height="19" rx="3" fill="#486e66" />
          <text textAnchor="middle" y="-2" fill="#f3efd4" fontSize="10" fontWeight="800">
            LILYPAD LABS
          </text>
        </g>
      )}
      <Planter x={x - 7} y={y + d + 14} flowers />
      <Planter x={x + w + 5} y={y + d + 13} />
    </g>
  );
}

function Fountain() {
  const [x, y] = iso(377, 490);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="54" ry="25" cy="6" fill="#c1bfac" />
      <ellipse rx="54" ry="25" fill="#e7e0c9" />
      <ellipse rx="44" ry="19" cy="-2" fill="#97c9c4" />
      <ellipse rx="32" ry="13" cy="-2" fill="none" stroke="#c9e2d4" strokeWidth="2" />
      <path d="M-9-6v-31H9V-6Z" fill="#c5c6af" />
      <ellipse rx="22" ry="10" cy="-37" fill="#e5dec4" />
      <ellipse rx="18" ry="6" cy="-39" fill="#a7d3d0" />
      <path
        d="M0-41v-21m0 0q-12-8-15 1m15-1q13-8 15 2"
        stroke="#d5ede1"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-20-34q-10 13-10 23M20-34q8 13 9 23" stroke="#c6e5d7" strokeWidth="2" fill="none" />
    </g>
  );
}

export function CityArt({
  level = 0,
  night = false,
  staff = 0,
  looks = [],
  selected = true,
}: {
  level?: number;
  night?: boolean;
  staff?: number;
  looks?: number[];
  selected?: boolean;
}) {
  const commuters = looks.slice(0, COMMUTE_SPOTS.length);
  return (
    <svg
      className="city-art"
      viewBox="0 0 1040 640"
      role="img"
      aria-label={`An isometric Pepe city with a café, leafy park, fountain, neighbouring offices and your ${['garage', 'small office', 'office floor', 'office tower', 'headquarters'][level]}. ${
        commuters.length
          ? `${commuters.length} of your employees ${commuters.length === 1 ? 'walks' : 'walk'} to work along the streets. `
          : ''
      }${night ? 'The office windows glow at night.' : 'Neighbours stroll along sunny streets.'}`}
    >
      <defs>
        <radialGradient id="groundGlow">
          <stop stopColor="#f5fae9" />
          <stop offset="1" stopColor="#e3eee0" stopOpacity="0" />
        </radialGradient>
        <pattern id="groundDots" width="25" height="21" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="5" r=".85" fill="#708d65" opacity=".14" />
          <circle cx="17" cy="15" r=".6" fill="#708d65" opacity=".12" />
        </pattern>
      </defs>
      <ellipse
        cx="520"
        cy="345"
        rx="500"
        ry="290"
        fill="url(#groundGlow)"
        opacity={night ? 0.1 : 1}
      />
      <ellipse cx="530" cy="493" rx="383" ry="119" fill="#597c69" opacity=".1" />
      <Box
        x={-6}
        y={-6}
        w={572}
        d={572}
        h={15}
        z={-18}
        top={night ? '#728a76' : '#c5d5ab'}
        left={night ? '#546e61' : '#a3b793'}
        right={night ? '#466356' : '#94ac89'}
      />
      <Tile x={0} y={0} w={560} d={560} color={night ? '#829781' : '#d2ddb7'} />
      <Tile x={0} y={0} w={560} d={560} color="url(#groundDots)" />
      <Tile x={224} y={0} w={75} d={560} color="#e5dfc8" />
      <Tile x={0} y={227} w={560} d={76} color="#e5dfc8" />
      <Tile x={235} y={0} w={53} d={560} color={night ? '#6f807a' : '#b3bcb2'} />
      <Tile x={0} y={238} w={560} d={53} color={night ? '#6f807a' : '#b3bcb2'} />
      {[20, 77, 134, 191, 328, 385, 442, 499].map((i) => (
        <g key={i}>
          <Tile x={260} y={i} w={3} d={25} color="#e4e3d0" />
          <Tile x={i} y={263} w={25} d={3} color="#e4e3d0" />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Tile x={240 + i * 9} y={214} w={5} d={15} color="#f2efdb" />
          <Tile x={307} y={241 + i * 9} w={15} d={5} color="#f2efdb" />
        </g>
      ))}
      <Tile x={26} y={28} w={170} d={161} color="#e5dec3" />
      <Tile x={331} y={29} w={189} d={162} color="#e5dec3" />
      <Tile x={23} y={330} w={162} d={172} color="#e3dcc1" />
      <Tile x={322} y={333} w={208} d={131} color="#e4ddc4" />
      <Tile x={326} y={463} w={204} d={79} color="#dedcc0" />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${iso(326, 476 + i * 18).join(' ')}L${iso(530, 476 + i * 18).join(' ')}`}
          stroke="#c7cbb3"
          strokeWidth="1"
          opacity=".6"
        />
      ))}
      <Building x={56} y={55} variant="blue" night={night} staff={4} />
      <Tree x={23} y={44} size={0.85} />
      <Tree x={179} y={57} size={0.85} />
      <Tree x={32} y={190} size={0.8} />
      <Planter x={186} y={184} flowers />
      <Building x={362} y={51} variant="peach" night={night} staff={3} />
      <Tree x={514} y={46} size={0.9} autumn />
      <Tree x={524} y={174} size={0.85} />
      <Lamp x={214} y={186} night={night} />
      <Lamp x={315} y={200} night={night} />
      <TinyPepe x={216} y={139} walking delay={-3} />
      <TinyPepe x={306} y={116} walking shirt="#c6957e" delay={-8} />
      <Tree x={45} y={218} size={0.8} />
      <Tree x={149} y={217} size={0.65} autumn />
      <Tree x={462} y={211} size={0.75} />
      <g transform={`translate(${iso(152, 262).join(' ')})`}>
        <path d="m-22 1 23 12 34-17-25-12Z" fill="#769b87" />
        <path d="m-22 1 1-10 22 12v10M1 3l34-17v10L1 13" fill="#577f70" />
        <path d="m-17-10 14-7 22 11L1 3Z" fill="#c4d9bd" />
        <path d="M-16-9-5-14 14-5 2 0Z" fill="#72948a" />
        <ellipse cx="-12" cy="5" rx="4" ry="5" fill="#53655d" />
        <ellipse cx="27" cy="3" rx="4" ry="5" fill="#53655d" />
      </g>
      {commuters.map((look, i) => (
        <TinyPepe
          key={i}
          x={COMMUTE_SPOTS[i][0]}
          y={COMMUTE_SPOTS[i][1]}
          shirt={OUTFITS[look % OUTFITS.length]}
          walking
          delay={COMMUTE_SPOTS[i][2]}
        />
      ))}
      <Building x={49} y={350} variant="cafe" night={night} />
      <Tree x={31} y={332} size={0.95} />
      <Tree x={179} y={347} size={0.8} />
      <Lamp x={205} y={341} night={night} />
      <Tile x={191} y={401} w={32} d={106} color="#b7cb95" />
      <Tree x={206} y={431} size={0.85} />
      <Tree x={208} y={501} size={0.72} />
      {selected && (
        <polygon
          points={points([iso(319, 315, 2), iso(520, 315, 2), iso(520, 468, 2), iso(319, 468, 2)])}
          fill="#d4edaa"
          fillOpacity=".42"
          stroke="#789b55"
          strokeWidth="2.5"
          strokeDasharray="7 6"
          strokeLinejoin="round"
        />
      )}
      <Building x={350} y={339} variant="own" level={level} night={night} staff={staff} />
      <Tree x={527} y={337} size={0.9} />
      <Tree x={537} y={452} size={0.75} autumn />
      <Fountain />
      <Box x={467} y={496} w={44} d={13} h={13} top="#c7a985" left="#a98966" right="#987b59" />
      <Box x={468} y={506} w={44} d={5} h={29} top="#c7a985" left="#b69471" right="#a98966" />
      <TinyPepe x={478} y={492} shirt="#bc9674" scale={0.85} />
      <TinyPepe x={325} y={509} shirt="#978ab4" />
      <Tree x={529} y={522} size={0.85} />
      <Tree x={38} y={519} size={1} />
      <Planter x={327} y={530} flowers />
      <Planter x={414} y={536} flowers />
      <Lamp x={299} y={525} night={night} />
      <g transform={`translate(${iso(250, 545).join(' ')}) rotate(27.65)`}>
        <text fontSize="12" fill="#536e56" fontWeight="800" letterSpacing="2">
          LILYPAD VALLEY
        </text>
      </g>
    </svg>
  );
}

export function BuildingPreview({ level = 0, staff = 0 }: { level?: number; staff?: number }) {
  return (
    <svg
      className="building-preview"
      viewBox={`360 ${level >= 3 ? -134 : level >= 1 ? -54 : 11} 330 ${level >= 3 ? 360 : level >= 1 ? 280 : 210}`}
      aria-hidden="true"
    >
      <ellipse cx="520" cy="167" rx="116" ry="38" fill="#536f40" opacity=".09" />
      <Building x={0} y={0} level={level} staff={staff} />
    </svg>
  );
}

export type Place = 'office' | 'cafe' | 'labs' | 'plaza';
export function City({
  level,
  staff,
  looks,
  companyName,
  cityTime,
  onPlace,
}: {
  level: number;
  staff: number;
  looks: number[];
  companyName?: string;
  cityTime: number;
  onPlace: (place: Place) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [paused, setPaused] = useState(false);
  const night = mode === 'night' || (mode === 'auto' && Math.floor(cityTime / 240) % 2 === 1);
  return (
    <section
      className={`city-panel ${night ? 'night' : ''} ${paused ? 'city-paused' : ''}`}
      aria-label="Explore Lilypad Valley"
    >
      <div className="map-topline">
        <span className="map-name">
          <MapPin size={15} /> Lilypad Valley <span className="map-divider" />{' '}
          <span className="muted">Your neighbourhood</span>
        </span>
        <div className="map-weather">
          <span className="weather-icon">{night ? <Moon size={16} /> : <Sun size={17} />}</span>
          <span>{night ? 'After hours' : 'A sunny workday'}</span>
        </div>
      </div>
      <div className="map-viewport">
        <div
          className="map-world"
          style={{ width: `${zoom * 100}%`, '--map-zoom': zoom } as CSSProperties}
        >
          <CityArt level={level} night={night} staff={staff} looks={looks} />
          <button className="map-label label-office" onClick={() => onPlace('office')}>
            <span className="tiny-dot" />
            <span className="map-company-name">{companyName || 'Your future office'}</span>
          </button>
          <button className="map-label label-cafe" onClick={() => onPlace('cafe')}>
            <Coffee size={13} /> Lily’s café
          </button>
          <button className="map-label label-labs" onClick={() => onPlace('labs')}>
            Lilypad Labs
          </button>
          <button className="map-label label-plaza" onClick={() => onPlace('plaza')}>
            The little plaza
          </button>
        </div>
      </div>
      <div className="map-bottomline">
        <div className="map-controls">
          <button
            className="icon-button"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? 'Resume city movement' : 'Pause city movement'}
            title={paused ? 'Resume city movement' : 'Pause city movement'}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            className="icon-button"
            onClick={() => {
              setZoom(1);
              onPlace('office');
            }}
            aria-label="Find my office"
            title="Find my office"
          >
            <LocateFixed size={18} />
          </button>
          <div className="zoom-controls">
            <button
              className="icon-button"
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.2) * 10) / 10))}
              aria-label="Zoom out"
            >
              <Minus size={17} />
            </button>
            <button
              className="icon-button"
              disabled={zoom >= 1.6}
              onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.2) * 10) / 10))}
              aria-label="Zoom in"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
      </div>
      <div className="city-caption">
        <span>
          <span className="legend-square" />
          Your company <span className="legend-square neighbour" />
          Neighbour companies
        </span>
        <label className="day-select">
          City lights{' '}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            aria-label="City time of day"
          >
            <option value="auto">Auto</option>
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </label>
      </div>
    </section>
  );
}
