# Intermediario de JPL Horizons

La demo puede consultar JPL Horizons en vivo con el botón **Consultar JPL Horizons
ahora** (sección Metodología). La API de JPL no permite peticiones desde otras
páginas (CORS), así que la consulta pasa por este Cloudflare Worker. Solo acepta Sol
y Tierra, coordenadas lunares válidas y periodos de hasta 62 días.

## Desplegar (cuenta gratuita de Cloudflare)

1. Crea una cuenta en https://dash.cloudflare.com/sign-up si no tienes una.
2. Desde esta carpeta, inicia sesión y despliega:

   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   ```

3. Wrangler imprime la URL del Worker, por ejemplo
   `https://lunar-horizons-proxy.<tu-subdominio>.workers.dev`.
4. Pega esa URL en `web/js/config.js` (`HORIZONS_PROXY_URL`), corre
   `npm run empaquetar` y sube los cambios a `main`.

Mientras `HORIZONS_PROXY_URL` esté vacío, la demo oculta el botón y usa solo los
datos que publica la Action `Efemerides JPL Horizons`.

## Probar el Worker

```bash
curl "https://<url-del-worker>/?cuerpo=10&lat=-89.01701&lon=126.27302&inicio=2026-12-01&fin=2026-12-02"
```

La respuesta trae `result` con el texto de Horizons. Las pruebas sin red están en
`tests/horizons.test.mjs`.
