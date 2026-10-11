import { useId } from 'react';

// Outfit colours by look; the city walkers reuse them so a hired Pepe is recognisable on the street.
export const OUTFITS = ['#668eb0', '#ddb168', '#9e8abe', '#5d7375', '#d88c70'];

export function Pepe({
  look = 0,
  className = '',
  title,
}: {
  look?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, '');
  const outfits = OUTFITS;
  const skins = ['#89b965', '#a7c579', '#80ad65', '#a1b571', '#7da881'];
  return (
    <svg
      className={className}
      viewBox="0 0 180 176"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`skin${id}`} x2="0.2" y2="1">
          <stop stopColor="#bedb8b" />
          <stop offset="1" stopColor={skins[look % 5]} />
        </linearGradient>
      </defs>
      <ellipse cx="91" cy="166" rx="55" ry="8" fill="#304d30" opacity=".12" />
      <path
        d="M37 173v-29c0-26 17-38 53-38s53 12 53 38v29"
        fill={outfits[look % 5]}
        stroke="#344934"
        strokeWidth="2"
      />
      <path d="m68 116 21 17 21-17-4 43H74Z" fill="#f9f4dc" />
      <path d="m85 134 8 0 5 21-9 10-8-10Z" fill={look === 3 ? '#bf7c65' : '#3e5a59'} />
      <path
        d="m60 116 13 38 13-19-17-19M119 116l-12 38-13-19 16-19"
        fill={outfits[look % 5]}
        stroke="#344934"
        strokeWidth="1.5"
      />
      <path
        d="M40 78c-7-30 7-47 29-42 12-13 32-15 44-2 23-6 32 10 29 34 14 12 14 36 0 49-10 11-25 14-50 14-27 0-51-10-57-24-5-13-3-20 5-29Z"
        fill={`url(#skin${id})`}
        stroke="#344934"
        strokeWidth="2.5"
      />
      <path
        d="M44 62c1-22 23-30 39-19M95 40c13-15 35-3 37 16"
        fill="none"
        stroke="#567643"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M47 66c0-17 33-24 39 2-7 11-27 15-39-2ZM94 66c2-22 34-24 38-5-5 16-27 19-38 5Z"
        fill="#f6f4dd"
        stroke="#567643"
        strokeWidth="2"
      />
      <ellipse cx="72" cy="65" rx="5" ry="7" fill="#283c2d" />
      <ellipse cx="118" cy="63" rx="5" ry="7" fill="#283c2d" />
      <path
        d="M46 63q18-13 37 0M96 60q18-11 34-4"
        fill="none"
        stroke="#6d9650"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M49 98c18 10 48 15 81-3-10 22-50 28-76 13"
        fill="#d09878"
        stroke="#70513f"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M46 97c22 13 57 14 86-3"
        fill="none"
        stroke="#46593d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M87 85h4" stroke="#62814e" strokeWidth="3" strokeLinecap="round" />
      {look === 1 && (
        <g fill="none" stroke="#384c43" strokeWidth="3">
          <rect x="42" y="54" width="45" height="24" rx="8" />
          <rect x="92" y="50" width="44" height="24" rx="8" />
          <path d="M87 60h5" />
        </g>
      )}
      {look === 2 && (
        <g>
          <path d="M36 54Q55 6 114 24l20 25Z" fill="#c8b6dc" stroke="#5c5365" strokeWidth="2" />
          <path
            d="m31 53 95-9 24 10q-48 12-119-1"
            fill="#9d88b2"
            stroke="#5c5365"
            strokeWidth="2"
          />
          <path d="m82 23 4 19" stroke="#9d88b2" strokeWidth="2" />
        </g>
      )}
      {look === 3 && (
        <g>
          <path d="M51 36V9h70v26" fill="#49545c" stroke="#344934" strokeWidth="2" />
          <path d="M52 23h67v12H52Z" fill="#c8a77a" />
          <ellipse cx="87" cy="37" rx="50" ry="8" fill="#49545c" stroke="#344934" strokeWidth="2" />
        </g>
      )}
      {look === 4 && (
        <g>
          <path d="M39 56Q37 25 62 28" fill="none" stroke="#eee0be" strokeWidth="8" />
          <rect
            x="30"
            y="54"
            width="14"
            height="29"
            rx="7"
            fill="#d78864"
            stroke="#654d40"
            strokeWidth="2"
          />
          <path d="M36 83q1 13 19 11" fill="none" stroke="#654d40" strokeWidth="3" />
        </g>
      )}
      <path d="M50 161v12M130 161v12" stroke="#344934" strokeWidth="2" />
    </svg>
  );
}

export function FrogMark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="14" fill="currentColor" />
      <path d="M9 24c0-9 6-12 13-12s13 3 13 12-6 12-13 12S9 33 9 24" fill="#c2e88b" />
      <ellipse cx="16" cy="17" rx="6" ry="7" fill="#f5f6d9" />
      <ellipse cx="28" cy="17" rx="6" ry="7" fill="#f5f6d9" />
      <ellipse cx="18" cy="18" rx="2" ry="3" fill="#294331" />
      <ellipse cx="27" cy="18" rx="2" ry="3" fill="#294331" />
      <path
        d="M13 27q10 7 20-1"
        fill="none"
        stroke="#537447"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
