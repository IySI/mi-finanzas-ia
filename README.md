# Mi Finanzas IA 💰

**Mi Finanzas IA** es una aplicación web local (*local-first*) moderna, ligera y privada para la gestión y control integral de finanzas personales. Diseñada para operar completamente en el navegador del usuario, garantiza máxima privacidad y soberanía de datos al no depender de servidores externos ni bases de datos en la nube.

---

## 🚀 Características Principales

- **Dashboard Financiero Reactivo:** Cálculo automático de balance general, total de ingresos del mes, total de gastos del mes y visualización de los últimos movimientos.
- **Configuración Personalizada:** Selección o definición de símbolo de moneda y establecimiento de saldo inicial patrimonial.
- **Gestión de Categorías:** Categorías predeterminadas y capacidad para crear categorías personalizadas, con protección y reasignación automática a "Otros" al eliminar.
- **Registro y Edición Rápida de Movimientos:** Formulario modal accesible desde cualquier pantalla con validaciones numéricas y de fechas en tiempo real.
- **Historial Cronológico Completo:** Visualización tabular con orden descendente, badges de tipo (Ingreso en verde / Gasto en rojo), edición y eliminación segura.
- **Filtros Avanzados:** Búsqueda por texto libre, filtrado por categorías y selección de períodos (todos, este mes, mes anterior o rango personalizado).
- **Presupuestos Mensuales y Semáforos:** Asignación de límites mensuales por categoría con alertas visuales de semáforo (Verde < 80%, Amarillo 80%-99.9%, Rojo ≥ 100%).
- **Reportes Interactivos:** Gráficos dinámicos desarrollados con **Chart.js** (distribución de gastos por categoría en dona y comparativa ingresos vs. gastos mensual y anual).
- **Exportación e Importación CSV:** Generación de CSV compatible con Excel (BOM UTF-8) y validación atómica con prevención preventiva de duplicados.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilos y Diseño:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Gráficos Interactivos:** [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Procesamiento CSV:** [PapaParse](https://www.papaparse.com/)
- **Persistencia:** Browser `LocalStorage` API

---

## 📦 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18.0 o superior recomendada)
- Gestor de paquetes `npm` (incluido con Node.js)

---

## 💻 Instalación y Uso Local

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/mi-finanzas-ia.git
   cd mi-finanzas-ia
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

---

## 🏗️ Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila y optimiza el proyecto para producción en la carpeta `dist/`. |
| `npm run preview` | Ejecuta localmente un servidor para probar la compilación de producción de `dist/`. |

---

## 🌐 Instrucciones de Publicación en Vercel

La aplicación está lista para desplegarse en **Vercel** en cuestión de minutos:

### Opción 1: Mediante la interfaz web de Vercel (Recomendada)
1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de Git.
3. Haz clic en **"Add New..."** > **"Project"** e importa tu repositorio.
4. Vercel detectará automáticamente que es un proyecto **Vite**:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Haz clic en **"Deploy"**. En segundos tendrás tu aplicación publicada con certificado SSL automático.

### Opción 2: Mediante Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## ⚠️ Limitaciones del Almacenamiento Local (LocalStorage)

Dado que la arquitectura es estrictamente *local-first*:
- **Ámbito por navegador y dispositivo:** Los datos se almacenan exclusivamente en el navegador y equipo en el que se utilicen. No hay sincronización automática entre dispositivos distintos (por ejemplo, entre tu teléfono y tu computadora).
- **Limpieza de historial:** Si borras las "cookies y datos de sitios web" o el caché profundo de tu navegador, la información guardada se eliminará.
- **Copias de seguridad:** Se recomienda utilizar periódicamente la función **"Exportar CSV"** en la sección de Movimientos para respaldar tus finanzas. Puedes restaurar tus datos en cualquier momento utilizando la función **"Importar CSV"**.
- **Capacidad:** `LocalStorage` ofrece aproximadamente entre 5 MB y 10 MB de almacenamiento según el navegador, lo cual es suficiente para registrar decenas de miles de movimientos financieros en formato de texto JSON.

---

## 📚 Documentación de Planificación

Toda la documentación técnica y funcional elaborada en las Fases 1 a 5 se encuentra disponible y conservada en la carpeta [`docs/`](./docs/):
- [`docs/documento-maestro.md`](./docs/documento-maestro.md) — Documento maestro consolidado.
- [`docs/01-nucleo-aplicacion.md`](./docs/01-nucleo-aplicacion.md) — Alcance, requerimientos funcionales y reglas de negocio.
- [`docs/02-experiencia-usuario.md`](./docs/02-experiencia-usuario.md) — Wireframes, navegación y flujos UX.
- [`docs/03-requisitos-calidad.md`](./docs/03-requisitos-calidad.md) — Criterios de calidad, rendimiento y privacidad.
- [`docs/04-datos-tecnologia.md`](./docs/04-datos-tecnologia.md) — Modelo de datos JSON y stack tecnológico.
- [`docs/05-historias-usuario.md`](./docs/05-historias-usuario.md) — Historias de usuario HU-001 a HU-012 con criterios de aceptación Gherkin.

---

## 📄 Licencia

Este proyecto es software privado de uso personal y formativo.
