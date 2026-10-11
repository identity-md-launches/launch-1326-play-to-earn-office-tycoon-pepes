import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { CityArt } from '../src/components/City';
import { FrogMark } from '../src/components/Pepe';

// Source for the social image. Render this SVG at 1200×630 to refresh og-image.png.
const city = renderToStaticMarkup(<CityArt level={1} staff={3} />).replace(
  '<svg ',
  '<svg x="395" y="30" width="815" height="560" ',
);
const logo = renderToStaticMarkup(<FrogMark />).replace(
  '<svg ',
  '<svg x="62" y="60" width="55" height="55" ',
);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f4f6ed"/>
<circle cx="938" cy="200" r="340" fill="#e6eedc"/>
${city}<g color="#273e31">${logo}</g>
<g font-family="Arial,sans-serif" fill="#273e31">
<text x="131" y="96" font-size="35" font-weight="700" letter-spacing="-1.5">pepe &amp; co.</text>
<text x="62" y="240" font-size="58" font-weight="700" letter-spacing="-2">Small office.</text>
<text x="62" y="305" font-size="58" font-weight="700" letter-spacing="-2">Big dreams.</text>
<text x="64" y="355" font-size="22" fill="#63735a">A cosy city. A company of your own.</text>
<rect x="62" y="396" width="210" height="52" rx="12" fill="#273e31"/>
<text x="93" y="429" font-size="18" fill="#f8faef" font-weight="600">Make a little green ↗</text>
<text x="64" y="566" font-size="17" fill="#78866b">The little office tycoon for the Pepe family.</text>
</g></svg>`;
writeFileSync('public/og-image.svg', svg);
console.log('Wrote public/og-image.svg (1200×630).');
