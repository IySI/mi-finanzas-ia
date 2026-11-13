# Fase 3: Requerimientos No Funcionales (Calidad y Rendimiento) — Mi Finanzas IA

---

## 1. Introducción y Objetivos de Calidad

Este documento define los atributos de calidad, rendimiento y seguridad para **Mi Finanzas IA**. Su propósito es garantizar una experiencia de usuario rápida, confiable, segura y fluida, evitando complejidades innecesarias en el MVP.

---

## 2. Requerimientos de Rendimiento (RNF-REN)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-REN-01** | **Tiempo de Carga Inicial** | La aplicación web debe cargar completamente y estar lista para interactuar en menos de **2.0 segundos** en una conexión estándar. | Medido mediante métricas *Lighthouse* (First Contentful Paint < 1.5s). |
| **RNF-REN-02** | **Respuesta de Interacción** | La apertura del modal de nuevo movimiento, el cambio de pestañas y el guardado de datos deben responder en menos de **100 milisegundos**. | Sensación de inmediatez total sin bloqueos en la interfaz. |
| **RNF-REN-03** | **Renderizado de Gráficos** | Los gráficos financieros deben generarse y actualizarse reactivamente en menos de **300 milisegundos** al registrar o filtrar movimientos. | Transiciones y animaciones suaves con Chart.js. |
| **RNF-REN-04** | **Eficiencia del Paquete (Bundle Size)** | El tamaño del código final optimizado para producción no debe superar **1 MB** (comprimido gZip). | Carga ligera sin consumo excesivo de datos. |

---

## 3. Seguridad y Privacidad (RNF-SEG)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-SEG-01** | **Privacidad Absoluta de Datos (Local First)** | El 100% de la información financiera (ingresos, gastos, saldos, notas) se almacena únicamente en el dispositivo del usuario (`LocalStorage`). | Cero envíos de datos financieros a servidores o terceros en el MVP. |
| **RNF-SEG-02** | **Sanitización de Entradas (Anti-XSS)** | Los campos de texto libre (descripción de movimientos, nombres de categorías) deben ser escapados y sanitizados antes de mostrarse en pantalla. | Se previene la inyección de código JavaScript o HTML malicioso. |
| **RNF-SEG-03** | **Validación Segura de CSV** | La lectura de archivos CSV debe procesarse en memoria del navegador, rechazando archivos con formatos binarios extraños o tamaños sospechosos (> 2 MB). | No se procesan archivos que no sigan estrictamente la estructura tabular aprobada. |
| **RNF-SEG-04** | **Comunicaciones Seguras** | Al publicarse en Vercel, la aplicación debe servirse exclusivamente bajo el protocolo cifrado **HTTPS**. | Certificado SSL/TLS automático y permanente. |

---

## 4. Fiabilidad y Tolerancia a Fallos (RNF-FIA)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-FIA-01** | **Persistencia Inmediata** | Cada creación, modificación o eliminación de un dato se guarda síncronamente en `LocalStorage` en el instante en que el usuario confirma la acción. | Si el usuario refresca o cierra el navegador accidentalmente, no pierde ningún dato previamente confirmado. |
| **RNF-FIA-02** | **Respaldo Portátil** | La exportación a CSV debe generar un archivo estándar descargable que el usuario pueda guardar en su disco duro o nube personal como copia de seguridad. | Capacidad de restaurar la información íntegra mediante la importación en cualquier momento. |
| **RNF-FIA-03** | **Control de Excepciones (Error Boundary)** | Si ocurre un error inesperado al renderizar una vista o procesar un dato, la aplicación no debe quedar en pantalla blanca. | Mostrará un mensaje amigable: *"Ocurrió un problema inesperado. Tus datos están a salvo"*, con un botón para recargar la aplicación. |

---

## 5. Disponibilidad y Operatividad Offline (RNF-DIS)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-DIS-01** | **Funcionamiento Sin Conexión (Offline)** | Una vez cargada la aplicación en el navegador, todas las funciones principales (registrar, calcular, presupuestar, graficar, exportar) deben operar al 100% sin conexión a internet. | Disponibilidad permanente independientemente de fallos de red. |
| **RNF-DIS-02** | **Alta Disponibilidad de Publicación** | El alojamiento web en Vercel debe garantizar un tiempo de actividad (uptime) superior al **99.9%**. | Acceso web global en cualquier momento. |

---

## 6. Compatibilidad y Responsividad (RNF-COM)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-COM-01** | **Compatibilidad Multi-Navegador** | La aplicación debe ser 100% funcional en las dos últimas versiones estables de: Google Chrome, Mozilla Firefox, Microsoft Edge y Apple Safari. | Comportamiento idéntico y sin errores de compatibilidad. |
| **RNF-COM-02** | **Diseño Responsivo (Mobile & Desktop)** | La interfaz debe adaptarse fluidamente a tres rangos de pantalla principales: Teléfonos móviles (≥ 360px), Tablets (≥ 768px) y Computadoras de escritorio (≥ 1024px). | En pantallas móviles, el menú lateral se convierte en un menú colapsable o barra inferior cómoda para el pulgar. |

---

## 7. Escalabilidad y Mantenibilidad (RNF-ESC)

| ID | Atributo | Requisito Verificable | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RNF-ESC-01** | **Arquitectura de Capas Desacopladas** | La lógica de almacenamiento (`Storage Service`) debe estar completamente separada de la interfaz gráfica (`UI Components`). | Si en el futuro se reemplaza `LocalStorage` por una base de datos en la nube (ej. Supabase o Firebase), no será necesario modificar las pantallas. |
| **RNF-ESC-02** | **Preparación para Inteligencia Artificial** | Debe existir un módulo de servicio preparado para conectarse a la API de Google Gemini en fases posteriores, sin alterar el núcleo funcional del MVP. | La IA se incorporará como un analizador adicional de datos ya existentes. |

---

## 8. Estado de la Fase 3
- **Estado:** Aprobada formalmente.
