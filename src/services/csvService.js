import Papa from 'papaparse'

/**
 * Servicio de Importación y Exportación CSV
 * Mi Finanzas IA — Fase 4 & Lección 14 (HU-011 y HU-012)
 */

// Cabeceras oficiales y orden obligatorio (HU-011, HU-012)
export const CSV_COLUMNAS_OFICIALES = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Importe']

/**
 * Función auxiliar para descargar un archivo de texto/csv en el navegador
 * Agrega el BOM UTF-8 (\uFEFF) para compatibilidad total con Microsoft Excel
 */
export function descargarArchivoCSV(contenidoCSV, nombreArchivo) {
  const bom = '\uFEFF'
  const blob = new Blob([bom + contenidoCSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', nombreArchivo)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const csvService = {
  /**
   * Genera y descarga la plantilla oficial de movimientos CSV (Lección 14, Punto 3)
   * Incluye los 2 registros de ejemplo exactos requeridos.
   */
  descargarPlantilla() {
    const filasEjemplo = [
      {
        'Fecha': '2026-11-01',
        'Tipo': 'Ingreso',
        'Categoría': 'Salario',
        'Descripción': 'Salario mensual',
        'Importe': '5000'
      },
      {
        'Fecha': '2026-11-02',
        'Tipo': 'Gasto',
        'Categoría': 'Alimentación',
        'Descripción': 'Compra supermercado',
        'Importe': '350'
      }
    ]

    const csvString = Papa.unparse({
      fields: CSV_COLUMNAS_OFICIALES,
      data: filasEjemplo
    }, {
      delimiter: ',',
      header: true
    })

    descargarArchivoCSV(csvString, 'plantilla-mi-finanzas.csv')
    return { success: true }
  },

  /**
   * Exporta todos los movimientos registrados a un archivo CSV (HU-011)
   * Respeta columnas exactas, nombres de categorías e importes numéricos positivos.
   */
  exportarMovimientos(movimientos) {
    if (!Array.isArray(movimientos)) {
      return { success: false, error: 'No se encontraron movimientos para exportar.' }
    }

    // Mapear movimientos al formato oficial de 5 columnas
    const filasExportar = movimientos.map((m) => {
      const tipoCapitalizado = m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'
      const importeNumerico = Math.abs(Number(m.importe) || 0)

      return {
        'Fecha': m.fecha || '',
        'Tipo': tipoCapitalizado,
        'Categoría': m.categoria || 'Otros',
        'Descripción': m.descripcion || '',
        'Importe': importeNumerico.toFixed(2)
      }
    })

    const csvString = Papa.unparse({
      fields: CSV_COLUMNAS_OFICIALES,
      data: filasExportar
    }, {
      delimiter: ',',
      header: true
    })

    const hoy = new Date().toISOString().split('T')[0]
    const nombreArchivo = `mi-finanzas-movimientos-${hoy}.csv`

    descargarArchivoCSV(csvString, nombreArchivo)

    return { 
      success: true, 
      total: filasExportar.length, 
      nombreArchivo 
    }
  },

  /**
   * Procesa y valida de manera segura un archivo CSV seleccionado (HU-012)
   * No aplica cambios a LocalStorage; retorna el diagnóstico y las filas validadas.
   * 
   * @param {File} archivo - Archivo CSV del input
   * @param {Array} categoriasExistentes - Lista de categorías registradas en la app
   * @param {Array} movimientosExistentes - Lista de movimientos ya guardados para cotejo de duplicados
   * @returns {Promise<Object>} Resultado de validación con filas procesadas o error atómico
   */
  async procesarYValidarCSV(archivo, categoriasExistentes = [], movimientosExistentes = []) {
    return new Promise((resolve) => {
      if (!archivo) {
        return resolve({
          success: false,
          error: 'No se ha seleccionado ningún archivo para importar.'
        })
      }

      // Validar extensión
      if (archivo.name) {
        const extension = archivo.name.split('.').pop().toLowerCase()
        if (extension !== 'csv') {
          return resolve({
            success: false,
            error: 'El archivo seleccionado debe tener extensión .csv.'
          })
        }
      }

      // Obtener el contenido de texto (compatible con navegadores modernos y entornos de prueba)
      const obtenerTexto = async () => {
        if (typeof archivo === 'string') return archivo
        if (archivo.text) return await archivo.text()
        return new Promise((res, rej) => {
          const reader = new FileReader()
          reader.onload = (e) => res(e.target.result)
          reader.onerror = (e) => rej(e)
          reader.readAsText(archivo, 'utf-8')
        })
      }

      obtenerTexto().then((contenidoTexto) => {
        Papa.parse(contenidoTexto, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (h) => {
            // Limpiar BOM (\uFEFF) y espacios en los encabezados
            return h.replace(/^\uFEFF/, '').trim()
          },
          complete: (results) => {
          try {
            const { data, meta, errors } = results

            if (errors && errors.length > 0) {
              // Si hay errores críticos de parsing
              const primerError = errors[0]
              return resolve({
                success: false,
                error: `Error al leer el archivo CSV en la fila ${primerError.row || 'desconocida'}: ${primerError.message}`
              })
            }

            if (!data || data.length === 0) {
              return resolve({
                success: false,
                error: 'El archivo CSV está vacío o no contiene filas de datos.'
              })
            }

            // 1. Validar presencia exacta de las columnas requeridas
            const cabecerasObtenidas = meta.fields || []
            const columnasRequeridas = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Importe']
            
            // Función auxiliar para normalizar nombres de columnas (tolerancia a acentos en la cabecera)
            const normalizarCabecera = (c) => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            const cabecerasNormalizadas = cabecerasObtenidas.map(normalizarCabecera)

            for (const col of columnasRequeridas) {
              const colNorm = normalizarCabecera(col)
              if (!cabecerasNormalizadas.includes(colNorm)) {
                return resolve({
                  success: false,
                  error: `El archivo CSV no contiene la columna obligatoria "${col}". Las columnas requeridas son: ${columnasRequeridas.join(', ')}.`
                })
              }
            }

            // Mapeo de cabeceras para acceder a los campos independientemente de mayúsculas/acentos
            const getField = (row, fieldName) => {
              const targetNorm = normalizarCabecera(fieldName)
              for (const key of Object.keys(row)) {
                if (normalizarCabecera(key) === targetNorm) {
                  return row[key]
                }
              }
              return ''
            }

            // 2. Validar cada fila
            const filasValidadas = []
            const regexFecha = /^\d{4}-\d{2}-\d{2}$/

            for (let i = 0; i < data.length; i++) {
              const fila = data[i]
              const numFilaFisica = i + 2 // Fila 1 es la cabecera en el CSV

              const rawFecha = (getField(fila, 'Fecha') || '').trim()
              const rawTipo = (getField(fila, 'Tipo') || '').trim()
              const rawCategoria = (getField(fila, 'Categoría') || '').trim()
              const rawDescripcion = (getField(fila, 'Descripción') || '').trim()
              const rawImporte = (getField(fila, 'Importe') || '').trim()

              // Validar Fecha
              if (!rawFecha) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: El campo Fecha es obligatorio.`
                })
              }

              if (!regexFecha.test(rawFecha)) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: La fecha "${rawFecha}" debe tener el formato YYYY-MM-DD (ej: 2026-11-13).`
                })
              }

              const [anioStr, mesStr, diaStr] = rawFecha.split('-')
              const anio = parseInt(anioStr, 10)
              const mes = parseInt(mesStr, 10) - 1
              const dia = parseInt(diaStr, 10)
              const fechaObj = new Date(anio, mes, dia)

              if (
                fechaObj.getFullYear() !== anio ||
                fechaObj.getMonth() !== mes ||
                fechaObj.getDate() !== dia ||
                isNaN(fechaObj.getTime())
              ) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: La fecha "${rawFecha}" no corresponde a una fecha válida del calendario.`
                })
              }

              // Validar Tipo (Ingreso o Gasto)
              const tipoNormalizado = rawTipo.toLowerCase()
              if (tipoNormalizado !== 'ingreso' && tipoNormalizado !== 'gasto') {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: El tipo "${rawTipo}" no es válido. Debe ser "Ingreso" o "Gasto".`
                })
              }

              // Validar Importe (numérico > 0, soporta punto o coma decimal)
              if (!rawImporte) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: El importe es obligatorio.`
                })
              }

              const importeLimpio = rawImporte.replace(',', '.')
              const importeNum = Number(importeLimpio)

              if (isNaN(importeNum) || importeNum <= 0) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: El importe "${rawImporte}" no es válido. Debe ser un número estrictamente mayor que cero.`
                })
              }

              // Validar Categoría
              if (!rawCategoria) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: La categoría es obligatoria.`
                })
              }

              const categoriaEncontrada = categoriasExistentes.find(
                (c) => c.nombre.trim().toLowerCase() === rawCategoria.toLowerCase()
              )

              if (!categoriaEncontrada) {
                return resolve({
                  success: false,
                  fila: numFilaFisica,
                  error: `Fila ${numFilaFisica}: La categoría "${rawCategoria}" no existe en la aplicación. Por favor, créala previamente en la sección Configuración antes de importar el archivo.`
                })
              }

              filasValidadas.push({
                filaCSV: numFilaFisica,
                fecha: rawFecha,
                tipo: tipoNormalizado,
                categoriaId: categoriaEncontrada.id,
                categoria: categoriaEncontrada.nombre,
                descripcion: rawDescripcion,
                importe: parseFloat(importeNum.toFixed(2))
              })
            }

            // 3. Verificación preventiva de duplicados (HU-012, Punto 6)
            // Se coteja cada fila validada con los movimientos previamente guardados
            const duplicadosDetectados = []

            filasValidadas.forEach((nuevaFila) => {
              const coincide = movimientosExistentes.some((m) => {
                const mismaFecha = m.fecha === nuevaFila.fecha
                const mismoTipo = (m.tipo || '').toLowerCase() === nuevaFila.tipo
                const mismaCat = (m.categoria || '').trim().toLowerCase() === nuevaFila.categoria.toLowerCase()
                const mismaDesc = (m.descripcion || '').trim().toLowerCase() === nuevaFila.descripcion.toLowerCase()
                const mismoImporte = Math.abs(Number(m.importe) - nuevaFila.importe) < 0.001

                return mismaFecha && mismoTipo && mismaCat && mismaDesc && mismoImporte
              })

              if (coincide) {
                duplicadosDetectados.push(nuevaFila)
              }
            })

            // 4. Calcular Resumen previo para confirmación
            let sumaIngresos = 0
            let sumaGastos = 0
            let cantIngresos = 0
            let cantGastos = 0

            filasValidadas.forEach((f) => {
              if (f.tipo === 'ingreso') {
                cantIngresos++
                sumaIngresos += f.importe
              } else {
                cantGastos++
                sumaGastos += f.importe
              }
            })

            return resolve({
              success: true,
              total: filasValidadas.length,
              filasValidadas,
              duplicados: duplicadosDetectados,
              tieneDuplicados: duplicadosDetectados.length > 0,
              resumen: {
                totalMovimientos: filasValidadas.length,
                cantIngresos,
                cantGastos,
                sumaIngresos,
                sumaGastos,
                balanceNetoLote: sumaIngresos - sumaGastos
              }
            })
          } catch (err) {
            console.error('Error durante el procesamiento del archivo CSV:', err)
            return resolve({
              success: false,
              error: `Error inesperado al procesar el archivo CSV: ${err.message}`
            })
          }
        }
      })
    }).catch((err) => {
      resolve({
        success: false,
        error: `Error al leer el archivo: ${err.message}`
      })
    })
  })
  }
}
