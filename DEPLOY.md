# Deploy — Erosión

Todo el código está listo para producción. Estos son los pasos que dependen de vos
(crear cuentas e ingresar credenciales; por seguridad esas acciones las hacés vos,
no el asistente).

## 0. Antes de empezar

Completá los placeholders de las páginas legales:

- `app/terminos/page.tsx` → email de contacto.
- `app/privacidad/page.tsx` → email de contacto y responsable del tratamiento.
- Borrá las "notas internas" al pie de ambas páginas.

Verificá que todo compila:

```bash
npm run typecheck && npm test && npm run build
```

## 1. Subir el repo a GitHub

```bash
git init
git add .
git commit -m "Erosión — Fase 1 MVP"
git branch -M main
git remote add origin <URL-de-tu-repo>
git push -u origin main
```

(El `.gitignore` ya excluye `node_modules`, `.next` y los `.env` con secretos.)

## 2. Base de datos Neon (opcional pero recomendado)

Sin Neon la app funciona igual (usa memoria + snapshot semilla), pero el dato
cacheado no persiste entre despliegues. Para persistir:

1. Crear un proyecto en <https://neon.tech> (free tier).
2. Copiar la **connection string** con pooling (empieza con `postgresql://...`).
3. No hace falta crear tablas a mano: la app ejecuta `CREATE TABLE IF NOT EXISTS`
   en la primera escritura del cron.

## 3. Deploy en Vercel

1. En <https://vercel.com>, **Add New → Project** e importá el repo de GitHub.
2. Framework: Next.js (se detecta solo). No cambies build settings.
3. En **Environment Variables** agregá:
   - `DATABASE_URL` → la connection string de Neon (si hiciste el paso 2).
   - `CRON_SECRET` → un valor secreto cualquiera (ej. generá uno con
     `openssl rand -hex 32`). Vercel lo envía en el header del cron y el endpoint
     lo valida.
4. **Deploy**.

## 4. Verificar el cron

- El cron ya está declarado en `vercel.json` (`/api/cron/actualizar`, diario 12:00 UTC).
- Vercel lo registra automáticamente en el plan Hobby.
- Podés forzar una corrida desde el dashboard (Project → Cron Jobs → Run) y luego
  abrir `/api/datos` para ver el snapshot actualizado.

## 5. Post-deploy

- Revisá la home, `/terminos` y `/privacidad` en la URL de producción.
- Confirmá que el disclaimer y la fecha de "última actualización" se ven bien.

---

**Recordatorio (CLAUDE.md §2):** antes de monetizar o escalar con usuarios reales,
hacé revisar los términos y la política de privacidad con un abogado especializado
en mercado de capitales y protección de datos.
