# Difficulty-Chart-Database

## Attention

神鬼争乱, Beat Again, Next Life, Planet Quester XT, ステッピン　オン　ジ, アクセルマルトーアンフェール should not be in the chart json

## Run chart-builder with API proxy (CORS fix)

Do not open chart-builder.html via file://.

1. Start local proxy server:
	- `node proxy-server.js`
2. Open:
	- `http://localhost:8080/chart-builder.html`

The page will request `/api/song` from the same origin, and the proxy forwards it to `https://taiko.wiki/api/song`.
