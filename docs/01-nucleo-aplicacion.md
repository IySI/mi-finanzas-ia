# Fase 1: Núcleo de la Aplicación — Mi Finanzas IA

---

## 1. Objetivos del Proyecto y Alcance del MVP

### 1.1. Objetivo General
Desarrollar una aplicación web moderna, accesible e intuitiva para la gestión de finanzas personales, permitiendo a cualquier usuario controlar sus ingresos, gastos, ahorros y presupuestos sin requerir conocimientos técnicos ni contables.

### 1.2. Objetivos Específicos
- Facilitar el registro ágil de ingresos y gastos cotidianos.
- Proporcionar visibilidad inmediata del estado financiero actual mediante un balance claro y alertas visuales.
- Fomentar el control del gasto mediante la definición de presupuestos mensuales por categoría.
- Permitir la portabilidad y respaldo de datos personales mediante archivos CSV.
- Dejar las bases funcionales preparadas para futuras extensiones de análisis asistido por Inteligencia Artificial.

### 1.3. Alcance del MVP (Producto Mínimo Viable)
El MVP se centra estrictamente en la utilidad personal inmediata del usuario en un entorno monousuario local.

#### Incluido en el MVP:
- Configuración de moneda personalizada y saldo inicial.
- Panel principal con métricas clave (ingresos, gastos, balance).
- Registro, edición y eliminación de ingresos y gastos.
- Gestión de categorías (predeterminadas y personalizadas).
- Presupuestos mensuales por categoría con alertas semafóricas (verde, amarillo, rojo).
- Filtros por fechas y categorías en el historial de transacciones.
- Gráficos interactivos de distribución de gastos y tendencias.
- Importación y exportación de datos mediante plantilla estándar CSV.

#### Fuera del alcance del MVP (Fases futuras):
- Sistema de registro/autenticación de usuarios (login/password).
- Gestión de múltiples usuarios o roles con permisos diferenciados.
- Sincronización en la nube multi-dispositivo en tiempo real.
- Conexión o sincronización automática con APIs de entidades bancarias.
- Pasarelas de pago o transacciones de dinero reales.
- Aplicaciones móviles nativas (iOS / Android).

---

## 2. Usuarios y Roles

Para la versión MVP, la aplicación no requiere esquemas complejos de autorización:

- **Usuario Personal (Único):** Persona que utiliza la aplicación en su navegador para gestionar sus propias finanzas personales. Posee acceso total a todas las funciones locales (configuración, registro, edición, presupuestos, reportes y gestión de archivos).

---

## 3. Requerimientos Funcionales (RF)

| ID | Nombre | Descripción | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-001** | **Panel de Control Principal (Dashboard)** | Mostrar en una vista central el balance general consolidado, el total de ingresos del mes y el total de gastos del mes, actualizados en tiempo real. | Alta |
| **RF-002** | **Configuración de Moneda y Saldo Inicial** | Permitir al usuario definir el símbolo de su moneda preferida (ej. $, €, S/., MXN) y establecer un saldo inicial disponible que sirva de punto de partida. | Alta |
| **RF-003** | **Registro de Movimientos** | Permitir registrar ingresos y gastos especificando: tipo (ingreso o gasto), importe, fecha, categoría y un campo opcional de descripción o nota. | Alta |
| **RF-004** | **Gestión de Categorías** | Proporcionar una lista de categorías iniciales comunes (Alimentación, Transporte, Vivienda, Salud, Ocio, Salario, etc.) y permitir crear nuevas categorías personalizadas. | Alta |
| **RF-005** | **Historial de Movimientos** | Listar de forma cronológica los movimientos registrados, permitiendo visualizarlos con claridad (fecha, concepto, categoría e importe con color distintivo para ingresos y gastos). | Alta |
| **RF-006** | **Edición y Eliminación de Movimientos** | Permitir modificar cualquiera de los datos de un movimiento registrado previamente o eliminarlo definitivamente, recalculando los totales al instante. | Alta |
| **RF-007** | **Presupuestos Mensuales por Categoría** | Permitir establecer un límite máximo de gasto mensual para cada categoría seleccionada. | Alta |
| **RF-008** | **Alertas Visuales de Presupuesto (Semáforo)** | Mostrar el estado de consumo de cada presupuesto mediante un código de colores: Verde (< 80%), Amarillo (80% a 99.9%) y Rojo (≥ 100%). | Alta |
| **RF-009** | **Filtros de Búsqueda y Consulta** | Permitir filtrar el historial de movimientos por rango de fechas (mes actual, mes anterior, rango personalizado) y por una o varias categorías. | Media |
| **RF-010** | **Gráficos Financieros Interactivos** | Visualizar gráficos explicativos que muestren la distribución de gastos por categoría (gráfico circular/barras) y la relación mensual ingresos vs. gastos. | Media |
| **RF-011** | **Exportación a CSV** | Permitir exportar la totalidad o un filtro de los movimientos registrados a un archivo descargable con formato CSV estándar. | Media |
| **RF-012** | **Importación desde CSV** | Permitir subir un archivo CSV estructurado según la plantilla oficial para registrar movimientos masivamente tras una validación de formato previa. | Media |

---

## 4. Reglas de Negocio (RN)

Las siguientes reglas definen el comportamiento lógico que la aplicación debe respetar de forma obligatoria:

- **RN-001 (Importes estrictamente positivos):** Todo importe ingresado (sea ingreso, gasto o presupuesto) debe ser un valor numérico mayor que cero ($> 0$).
- **RN-002 (Integridad de movimientos):** Para que un movimiento sea guardado, son obligatorios los campos: Tipo (Ingreso/Gasto), Importe, Categoría y Fecha válida. La descripción es opcional.
- **RN-003 (Cálculo del Balance General):**  
  $$\text{Balance} = \text{Saldo Inicial} + \sum \text{Ingresos} - \sum \text{Gastos}$$
- **RN-004 (Visualización de Balance Negativo):** Si el Balance resultante es inferior a cero ($< 0$), la aplicación debe mostrar el valor en color rojo distintivo y con signo negativo, alertando visualmente de la situación sin bloquear operaciones.
- **RN-005 (Tratamiento del Saldo Inicial):** El saldo inicial se contabiliza una única vez como base de cálculo del balance general. No debe sumarse como un ingreso ordinario del período mensual en los reportes de ingresos vs. gastos.
- **RN-006 (Reasignación de Categorías Eliminadas):** Si el usuario elimina una categoría que ya posee movimientos vinculados, dichos movimientos no se eliminarán; se reasignarán automáticamente a la categoría comodín predeterminada `"Otros"`.
- **RN-007 (Umbrales de Presupuesto - Semáforo):**
  - **Verde (Normal):** Consumo del presupuesto estrictamente menor al 80%.
  - **Amarillo (Alerta preventiva):** Consumo entre el 80% y el 99.99%.
  - **Rojo (Presupuesto agotado o superado):** Consumo igual o superior al 100%.
- **RN-008 (Reactividad de Totales y Gráficos):** Toda creación, edición o eliminación de un movimiento debe actualizar inmediatamente el balance, los totales del panel, los gráficos y el estado del semáforo de presupuestos.
- **RN-009 (Estructura estándar de Plantilla CSV):** La importación y exportación empleará estrictamente las columnas: `Fecha`, `Tipo`, `Categoría`, `Descripción`, `Importe`. Si el archivo CSV a importar contiene datos corruptos o cabeceras incompatibles, el sistema debe rechazar el archivo e informar al usuario del error sin alterar los datos existentes.

---

## 5. Métricas de Éxito

Para comprobar que la aplicación cumple eficazmente con su propósito de cara a un usuario final no técnico, se definen las siguientes métricas de éxito del MVP:

1. **Exactitud Matemática (100% de fiabilidad):** El balance general, los subtotales por categoría y los cálculos de presupuestos deben ser 100% exactos y concordantes con las operaciones registradas.
2. **Eficiencia en el Registro (< 15 segundos):** Un usuario debe poder registrar un nuevo gasto o ingreso en menos de 15 segundos desde cualquier pantalla principal.
3. **Claridad del Estado Presupuestario:** El 100% de las categorías con presupuestos deben reflejar de forma inequívoca su color de alerta (verde, amarillo o rojo) sin requerir cálculos manuales por parte del usuario.
4. **Respaldo sin Pérdida de Información:** El proceso de exportación a CSV y re-importación utilizando la plantilla oficial debe conservar el 100% de los datos numéricos, fechas y categorías.
5. **Autonomía del Usuario:** Un usuario sin experiencia contable o informática previa debe poder comprender su balance, sus gastos mayores y su saldo disponible en su primera sesión sin necesidad de manual técnico.

---

## 6. Estado de la Fase 1
- **Estado:** Aprobada formalmente.
