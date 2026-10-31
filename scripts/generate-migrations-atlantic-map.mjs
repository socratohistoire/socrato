import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/generate-migrations-atlantic-map.mjs <natural-earth.geojson> <output.svg>");
}

const geojson = JSON.parse(await readFile(inputPath, "utf8"));
const width = 1600;
const height = 1220;
const mainHeight = 680;
const selectedCodes = new Set([
  "CAN", "USA", "GRL", "ISL", "IRL", "GBR", "PRT", "ESP", "FRA", "BEL", "NLD", "DEU", "DNK", "NOR", "SWE", "FIN", "ITA",
]);

function ringsFor(feature) {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return polygons.flatMap((polygon) => polygon.map((ring) => ({
    code: feature.properties.ADM0_A3,
    name: feature.properties.NAME_FR || feature.properties.NAME,
    ring,
  })));
}

const rings = geojson.features
  .filter((feature) => selectedCodes.has(feature.properties.ADM0_A3))
  .flatMap(ringsFor)
  .filter(({ code, ring }) => {
    if (code !== "USA") return true;
    const longitude = ring.reduce((sum, [lon]) => sum + lon, 0) / ring.length;
    const latitude = ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length;
    return longitude > -130 && latitude < 55;
  });

const marginX = 55;
const marginY = 45;
const mainBounds = { west: -145, east: 32, south: 23, north: 84 };

function project(coordinate) {
  const [longitude, latitude] = coordinate;
  return [
    marginX + ((longitude - mainBounds.west) / (mainBounds.east - mainBounds.west)) * (width - marginX * 2),
    marginY + ((mainBounds.north - latitude) / (mainBounds.north - mainBounds.south)) * (mainHeight - marginY * 2),
  ];
}

function pathFor(ring, projection = project) {
  return ring.map((point, index) => {
    const [x, y] = projection(point);
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function countryClass(code) {
  if (code === "CAN") return "land land--canada";
  if (code === "USA") return "land land--usa";
  if (["IRL", "GBR", "PRT", "ESP", "FRA", "BEL", "NLD", "DEU", "DNK", "NOR", "SWE", "FIN", "ITA"].includes(code)) return "land land--europe";
  return "land";
}

const countryPaths = rings.map(({ code, ring }) => `<path class="${countryClass(code)}" d="${pathFor(ring)}"/>`).join("\n");

function point(longitude, latitude) {
  const [x, y] = project([longitude, latitude]);
  return { x, y };
}

function curvedRoute(start, control, end) {
  const a = point(...start);
  const b = point(...control);
  const c = point(...end);
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${b.x.toFixed(1)} ${b.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
}

const atlanticRoute = curvedRoute([-8, 53], [-37, 62], [-70.5, 47]);
const westRouteOrigin = [-75.7, 45.42]; // Est de l’Ontario, près de la frontière québécoise
const westRoute = curvedRoute(westRouteOrigin, [-92, 56], [-112, 52]);

const newEnglandInset = { x: 42, y: 594, width: 770, height: 246 };
const newEnglandBounds = { west: -79, east: -66, south: 42, north: 48.7 };
function newEnglandProject([longitude, latitude]) {
  return [
    newEnglandInset.x + ((longitude - newEnglandBounds.west) / (newEnglandBounds.east - newEnglandBounds.west)) * newEnglandInset.width,
    newEnglandInset.y + ((newEnglandBounds.north - latitude) / (newEnglandBounds.north - newEnglandBounds.south)) * newEnglandInset.height,
  ];
}

const inset = { x: 870, y: 594, width: 675, height: 246 };
const ruralInset = { x: 415, y: 935, width: 770, height: 246 };
const ruralScale = { x: 1.5, y: 2.3 };
const ruralTranslate = { x: 194.8, y: -541.4 };
const insetBounds = { west: -80.5, east: -63, south: 44, north: 51.8 };
function insetProject([longitude, latitude]) {
  return [
    inset.x + ((longitude - insetBounds.west) / (insetBounds.east - insetBounds.west)) * inset.width,
    inset.y + ((insetBounds.north - latitude) / (insetBounds.north - insetBounds.south)) * inset.height,
  ];
}

const canadaRings = rings.filter(({ code }) => code === "CAN");
const usaRings = rings.filter(({ code }) => code === "USA");
const newEnglandPaths = [
  ...usaRings.map(({ ring }) => `<path class="inset-land inset-land--usa" d="${pathFor(ring, newEnglandProject)}"/>`),
  ...canadaRings.map(({ ring }) => `<path class="inset-land" d="${pathFor(ring, newEnglandProject)}"/>`),
].join("\n");
const insetPaths = [
  ...usaRings.map(({ ring }) => `<path class="inset-land inset-land--usa" d="${pathFor(ring, insetProject)}"/>`),
  ...canadaRings.map(({ ring }) => `<path class="inset-land" d="${pathFor(ring, insetProject)}"/>`),
].join("\n");

function newEnglandPoint(longitude, latitude) {
  const [x, y] = newEnglandProject([longitude, latitude]);
  return { x, y };
}

const montreal = newEnglandPoint(-73.57, 45.5);
const quebecCity = newEnglandPoint(-71.21, 46.81);
const newEnglandRoutes = [
  {
    origin: newEnglandPoint(-70.8, 46.9),
    control: newEnglandPoint(-69.75, 46.95),
    destination: newEnglandPoint(-68.8, 46.35),
  },
  {
    origin: newEnglandPoint(-72.2, 46.0),
    control: newEnglandPoint(-71.15, 45.8),
    destination: newEnglandPoint(-70.4, 45.05),
  },
  {
    origin: newEnglandPoint(-73.0, 45.4),
    control: newEnglandPoint(-72.15, 45.0),
    destination: newEnglandPoint(-71.55, 44.15),
  },
];

function ruralPoint(longitude, latitude) {
  const point = newEnglandPoint(longitude, latitude);
  return {
    x: point.x * ruralScale.x + ruralTranslate.x,
    y: point.y * ruralScale.y + ruralTranslate.y,
  };
}

const ruralMontreal = ruralPoint(-73.57, 45.5);
const ruralQuebecCity = ruralPoint(-71.21, 46.81);
const ruralRoutes = [
  { origin: ruralPoint(-75.2, 45.9), control: ruralPoint(-74.3, 45.75), destination: { x: ruralMontreal.x - 22, y: ruralMontreal.y - 6 } },
  { origin: ruralPoint(-72.7, 46.4), control: ruralPoint(-73.18, 46.17), destination: { x: ruralMontreal.x, y: ruralMontreal.y - 22 } },
  { origin: ruralPoint(-71.6, 45.35), control: ruralPoint(-72.7, 45.5), destination: { x: ruralMontreal.x + 22, y: ruralMontreal.y + 10 } },
];

function ruralRoute({ origin, control, destination }) {
  return `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${destination.x.toFixed(1)} ${destination.y.toFixed(1)}`;
}
function newEnglandRoute({ origin, control, destination }) {
  return `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${destination.x.toFixed(1)} ${destination.y.toFixed(1)}`;
}

function insetPoint(longitude, latitude) {
  const [x, y] = insetProject([longitude, latitude]);
  return { x, y };
}

const valley = insetPoint(-73.4, 46.1);
const laurentides = insetPoint(-74.7, 47.1);
const saguenay = insetPoint(-71.2, 48.5);
const basSaintLaurent = insetPoint(-68.6, 48.1);
const laurentidesOrigin = insetPoint(-73.9, 45.75);
const saguenayOrigin = insetPoint(-72.45, 46.45);
const basSaintLaurentOrigin = insetPoint(-70.35, 46.9);
function insetRoute(origin, destination) {
  const controlX = (origin.x + destination.x) / 2;
  const controlY = Math.min(origin.y, destination.y) - 16;
  return `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${destination.x.toFixed(1)} ${destination.y.toFixed(1)}`;
}

const labels = [
  { text: "CANADA", coordinate: [-102, 56], className: "country-label" },
  { text: "ÉTATS-UNIS", coordinate: [-101, 38], className: "country-label country-label--small" },
  { text: "EUROPE", coordinate: [8, 50], className: "country-label" },
  { text: "OCÉAN ATLANTIQUE", coordinate: [-37, 39], className: "ocean-label" },
  { text: "Québec", coordinate: [-72, 52], className: "region-label" },
].map(({ text, coordinate, className }) => {
  const { x, y } = point(...coordinate);
  return `<text class="${className}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${text}</text>`;
}).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">Carte de l’Atlantique Nord, du Canada, des États-Unis et de l’Europe</title>
  <desc id="description">Carte pédagogique montrant cinq trajets migratoires à compléter entre 1840 et 1896, avec trois agrandissements consacrés à la Nouvelle-Angleterre, aux régions de colonisation du Québec et à l’exode rural vers Montréal.</desc>
  <defs>
    <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#dcecf3"/><stop offset="1" stop-color="#bcd9e6"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#17344b" flood-opacity=".18"/></filter>
    <marker id="arrow" markerWidth="5" markerHeight="5" refX="4.4" refY="2.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L5,2.5 L0,5 Z" fill="#315f78"/></marker>
    <marker id="arrow-local" markerWidth="5" markerHeight="5" refX="4.4" refY="2.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L5,2.5 L0,5 Z" fill="#315f78"/></marker>
    <clipPath id="new-england-inset-clip"><rect x="${newEnglandInset.x}" y="${newEnglandInset.y}" width="${newEnglandInset.width}" height="${newEnglandInset.height}" rx="16"/></clipPath>
    <clipPath id="inset-clip"><rect x="${inset.x}" y="${inset.y}" width="${inset.width}" height="${inset.height}" rx="16"/></clipPath>
    <clipPath id="rural-inset-clip"><rect x="${ruralInset.x}" y="${ruralInset.y}" width="${ruralInset.width}" height="${ruralInset.height}" rx="16"/></clipPath>
    <style>
      .land{fill:#f6f0df;stroke:#7893a2;stroke-width:1.35;vector-effect:non-scaling-stroke}.land--canada{fill:#f3e5bf}.land--usa{fill:#e8eee6}.land--europe{fill:#eee9da}.map-title{fill:#17344b;font:850 23px system-ui,sans-serif;letter-spacing:1.4px;text-anchor:middle;paint-order:stroke;stroke:#f8fbfc;stroke-width:7;stroke-linejoin:round}.country-label{fill:#27495d;font:800 28px system-ui,sans-serif;letter-spacing:5px;text-anchor:middle}.country-label--small{font-size:22px}.region-label{fill:#5d4630;font:800 17px system-ui,sans-serif;text-anchor:middle}.ocean-label{fill:#46768d;font:italic 700 22px Georgia,serif;letter-spacing:3px;text-anchor:middle;opacity:.8}.route{fill:none;stroke:#315f78;stroke-width:4;stroke-dasharray:10 9;stroke-linecap:round;marker-end:url(#arrow)}.route--local{stroke:#315f78;stroke-width:3;marker-end:url(#arrow-local)}.route--new-england{stroke-width:3.25}.route-origin{fill:#fff9e8;stroke:#315f78;stroke-width:3}.inset-land{fill:#f3e5bf;stroke:#7893a2;stroke-width:1.4}.inset-land--usa{fill:#e8eee6}.inset-title{fill:#17344b;font:800 20px system-ui,sans-serif;letter-spacing:1.2px;paint-order:stroke;stroke:#f8fbfc;stroke-width:5;stroke-linejoin:round}.inset-title--wide{font-size:17px}.inset-subtitle{fill:#526c7a;font:600 14px system-ui,sans-serif}.inset-label{fill:#17344b;font:700 15px system-ui,sans-serif;paint-order:stroke;stroke:#fff;stroke-width:5;stroke-linejoin:round}.inset-region{fill:#5d4630;font:800 14px system-ui,sans-serif;letter-spacing:1.2px;paint-order:stroke;stroke:#fff;stroke-width:5;stroke-linejoin:round}.place-dot{fill:#fff9e8;stroke:#315f78;stroke-width:3}.source{fill:#516976;font:500 13px system-ui,sans-serif}.north{fill:#17344b;font:900 18px system-ui,sans-serif}.hint-line{fill:none;stroke:#8aa6b5;stroke-width:2;stroke-dasharray:5 7}
    </style>
  </defs>
  <rect width="${width}" height="${height}" rx="20" fill="url(#ocean)"/>
  <path class="hint-line" d="M60 228 H1540 M60 420 H1540" opacity=".38"/>
  ${countryPaths}
  ${labels}
  <text class="map-title" x="800" y="35">MOUVEMENTS MIGRATOIRES AU CANADA ET AU QUÉBEC · 1840–1896</text>
  <path class="route" d="${atlanticRoute}"/>
  <path class="route" d="${westRoute}"/>
  <circle class="route-origin" cx="${point(-8, 53).x.toFixed(1)}" cy="${point(-8, 53).y.toFixed(1)}" r="8"/>
  <circle class="route-origin" cx="${point(...westRouteOrigin).x.toFixed(1)}" cy="${point(...westRouteOrigin).y.toFixed(1)}" r="8"/>
  <rect x="${newEnglandInset.x}" y="${newEnglandInset.y}" width="${newEnglandInset.width}" height="${newEnglandInset.height}" rx="18" fill="#f8fbfc" stroke="#6d8d9e" stroke-width="2" filter="url(#shadow)"/>
  <g clip-path="url(#new-england-inset-clip)">
    <rect x="${newEnglandInset.x}" y="${newEnglandInset.y}" width="${newEnglandInset.width}" height="${newEnglandInset.height}" fill="#dcecf3"/>
    <g id="new-england-geography">${newEnglandPaths}</g>
    ${newEnglandRoutes.map((route) => `<path class="route route--new-england" d="${newEnglandRoute(route)}"/>`).join("\n")}
  </g>
  <text class="inset-title inset-title--wide" x="${newEnglandInset.x + 22}" y="${newEnglandInset.y + 31}">AGRANDISSEMENT · SUD DU QUÉBEC</text>
  <text class="inset-region" x="${newEnglandInset.x + 168}" y="${newEnglandInset.y + 74}">SUD DU QUÉBEC</text>
  <text class="inset-region" x="${newEnglandInset.x + 552}" y="${newEnglandInset.y + 181}">NOUVELLE-ANGLETERRE</text>
  <circle class="place-dot" cx="${montreal.x.toFixed(1)}" cy="${montreal.y.toFixed(1)}" r="5"/>
  <text class="inset-label" x="${montreal.x - 12}" y="${montreal.y - 10}" text-anchor="end">Montréal</text>
  <circle class="place-dot" cx="${quebecCity.x.toFixed(1)}" cy="${quebecCity.y.toFixed(1)}" r="5"/>
  <text class="inset-label" x="${quebecCity.x + 12}" y="${quebecCity.y - 9}">Québec</text>
  <rect x="${inset.x}" y="${inset.y}" width="${inset.width}" height="${inset.height}" rx="18" fill="#f8fbfc" stroke="#6d8d9e" stroke-width="2" filter="url(#shadow)"/>
  <g clip-path="url(#inset-clip)">
    <rect x="${inset.x}" y="${inset.y}" width="${inset.width}" height="${inset.height}" fill="#dcecf3"/>
    ${insetPaths}
    <path class="route route--local" d="${insetRoute(laurentidesOrigin, laurentides)}"/>
    <path class="route route--local" d="${insetRoute(saguenayOrigin, saguenay)}"/>
    <path class="route route--local" d="${insetRoute(basSaintLaurentOrigin, basSaintLaurent)}"/>
  </g>
  <text class="inset-title" x="${inset.x + 22}" y="${inset.y + 32}">AGRANDISSEMENT DU QUÉBEC</text>
  <text class="inset-label" x="${laurentides.x - 48}" y="${laurentides.y - 32}">Laurentides</text>
  <text class="inset-label" x="${saguenay.x - 18}" y="${saguenay.y - 32}">Saguenay–Lac-Saint-Jean</text>
  <text class="inset-label" x="${basSaintLaurent.x + 18}" y="${basSaintLaurent.y - 8}">Bas-Saint-Laurent</text>
  <text class="inset-label" x="${valley.x - 22}" y="${valley.y + 32}">Vallée du Saint-Laurent</text>
  <text class="north" x="1510" y="${inset.y + 42}">N</text><path d="M1515 ${inset.y + 52} l-9 18 h18 Z" fill="#17344b"/>
  <rect x="${ruralInset.x}" y="${ruralInset.y}" width="${ruralInset.width}" height="${ruralInset.height}" rx="18" fill="#f8fbfc" stroke="#6d8d9e" stroke-width="2" filter="url(#shadow)"/>
  <g clip-path="url(#rural-inset-clip)">
    <rect x="${ruralInset.x}" y="${ruralInset.y}" width="${ruralInset.width}" height="${ruralInset.height}" fill="#dcecf3"/>
    <use href="#new-england-geography" transform="matrix(${ruralScale.x} 0 0 ${ruralScale.y} ${ruralTranslate.x} ${ruralTranslate.y})"/>
    ${ruralRoutes.map((route) => `<path class="route route--local route--rural" d="${ruralRoute(route)}"/>`).join("\n")}
  </g>
  <text class="inset-title inset-title--wide" x="${ruralInset.x + 22}" y="${ruralInset.y + 31}">AGRANDISSEMENT · MONTRÉAL ET ENVIRONS</text>
  <circle class="place-dot" cx="${ruralMontreal.x.toFixed(1)}" cy="${ruralMontreal.y.toFixed(1)}" r="6"/>
  <text class="inset-label" x="${ruralMontreal.x - 28}" y="${ruralMontreal.y - 37}" text-anchor="end">Montréal</text>
  <circle class="place-dot" cx="${ruralQuebecCity.x.toFixed(1)}" cy="${ruralQuebecCity.y.toFixed(1)}" r="5"/>
  <text class="inset-label" x="${ruralQuebecCity.x + 12}" y="${ruralQuebecCity.y - 10}">Québec</text>
  <text class="source" x="45" y="${height - 14}">Fond de carte : Natural Earth, domaine public · Adaptation pédagogique Socrato</text>
</svg>`;

await writeFile(outputPath, svg, "utf8");
