# 🚀 Guía de despliegue (Render + MySQL gratis)

Esta guía te lleva paso a paso para publicar el portal en internet **gratis**, de modo
que los estudiantes solo necesiten **un link** para presentarlo (sin instalar nada).

Necesitarás crear 3 cuentas gratuitas: **GitHub**, **Aiven** (base de datos) y **Render** (la app).
Toma unos 20-30 minutos la primera vez.

> El proyecto ya está preparado: la base de datos **se crea y se llena sola** al arrancar,
> así que no tienes que ejecutar ningún script en la nube.

---

## PARTE 1 — Subir el código a GitHub

1. Crea una cuenta en **https://github.com** (si no tienes).
2. Crea un repositorio nuevo (botón **New**): nombre por ejemplo `portal-win`, déjalo **Público**, y **no** marques ninguna casilla (README, etc.). Clic en **Create repository**.
3. GitHub te mostrará unos comandos. En tu proyecto, abre una terminal y ejecuta (cambia la URL por la de tu repo):

   ```bash
   git remote add origin https://github.com/TU_USUARIO/portal-win.git
   git push -u origin main
   ```

   Te pedirá iniciar sesión en GitHub. Al terminar, tu código estará en línea.

---

## PARTE 2 — Crear la base de datos MySQL gratis (Aiven)

1. Crea una cuenta en **https://aiven.io** (plan gratis, "Free plan").
2. Crea un servicio nuevo → elige **MySQL** → plan **Free**.
3. Cuando el servicio esté "Running", entra a su página y busca **Connection information**. Anota estos datos:
   - **Host** (algo como `mysql-xxxx.aivencloud.com`)
   - **Port** (un número, p. ej. `12345`)
   - **User** (normalmente `avnadmin`)
   - **Password**
   - **Database name** (normalmente `defaultdb`)

Con eso ya tienes tu base de datos en la nube (todavía vacía; se llenará sola).

---

## PARTE 3 — Desplegar la app en Render

1. Crea una cuenta en **https://render.com** (puedes entrar con tu cuenta de GitHub).
2. Clic en **New +** → **Web Service**.
3. Conecta tu repositorio `portal-win` de GitHub.
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
5. Abre **Environment / Environment Variables** y agrega estas variables con los datos de Aiven (Parte 2):

   | Clave | Valor |
   |---|---|
   | `BD_HOST` | el Host de Aiven |
   | `BD_PUERTO` | el Port de Aiven |
   | `BD_USUARIO` | el User de Aiven (`avnadmin`) |
   | `BD_CONTRASENA` | el Password de Aiven |
   | `BD_NOMBRE` | el Database de Aiven (`defaultdb`) |
   | `BD_SSL` | `true` |

6. Clic en **Create Web Service**. Render instalará y arrancará la app (tarda unos minutos).
   Al terminar, arriba verás la URL pública, algo como:
   **`https://portal-win.onrender.com`**

---

## PARTE 4 — Probar y compartir

1. Abre tu URL de Render. La **primera vez** puede tardar ~1 minuto (está arrancando).
2. Entra con las credenciales de demostración:
   - Cliente: `73193206` / `MRjhey10`
   - Admin (`/admin`): `admin` / `admin2026`
3. Comparte esa URL con los estudiantes. ¡Listo! 🎉

---

## Notas importantes

- **Se duerme:** la app gratis de Render se "duerme" tras 15 min sin uso. La primera visita
  después tarda ~30-60 seg en despertar. **Truco:** abre el link 1-2 minutos antes de presentar.
- **Los datos NO se borran** cuando se duerme; viven en Aiven de forma permanente.
- **Para reiniciar la demo** (dejar todo limpio), usa el botón **Reiniciar** en `/admin`.
- Si cambias el código, haz `git push` y Render vuelve a desplegar solo.
