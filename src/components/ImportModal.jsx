import React, { useState, useRef } from 'react'
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  HelpCircle
} from 'lucide-react'
import { csvService } from '../services/csvService'

export default function ImportModal({
  isOpen,
  onClose,
  categoriasExistentes = [],
  movimientosExistentes = [],
  formatoMoneda,
  onImportSuccess
}) {
  const [archivo, setArchivo] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [resultadoValidacion, setResultadoValidacion] = useState(null)
  const [errorValidacion, setErrorValidacion] = useState(null)
  const [confirmarDuplicados, setConfirmarDuplicados] = useState(false)
  const [mostrarDetalleDuplicados, setMostrarDetalleDuplicados] = useState(false)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Reiniciar estado al cerrar o limpiar
  const handleReset = () => {
    setArchivo(null)
    setProcesando(false)
    setResultadoValidacion(null)
    setErrorValidacion(null)
    setConfirmarDuplicados(false)
    setMostrarDetalleDuplicados(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Manejar selección de archivo
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setArchivo(file)
    setProcesando(true)
    setErrorValidacion(null)
    setResultadoValidacion(null)
    setConfirmarDuplicados(false)

    try {
      const res = await csvService.procesarYValidarCSV(
        file,
        categoriasExistentes,
        movimientosExistentes
      )

      if (res.success) {
        setResultadoValidacion(res)
        // Si no hay duplicados, se puede importar directamente
        if (!res.tieneDuplicados) {
          setConfirmarDuplicados(true)
        }
      } else {
        setErrorValidacion(res.error)
      }
    } catch (err) {
      console.error('Error al procesar archivo CSV:', err)
      setErrorValidacion(`Error inesperado al leer el archivo: ${err.message}`)
    } finally {
      setProcesando(false)
    }
  }

  // Confirmar y guardar importación (HU-012, Puntos 5, 6 y 7)
  const handleConfirmarImportacion = () => {
    if (!resultadoValidacion || !resultadoValidacion.filasValidadas) {
      return
    }

    if (resultadoValidacion.tieneDuplicados && !confirmarDuplicados) {
      return
    }

    onImportSuccess(resultadoValidacion.filasValidadas)
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Importar Movimientos desde CSV</h3>
              <p className="text-xs text-slate-500">Validación atómica y prevención inteligente de duplicados (HU-012)</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* PASO 1: Selector de Archivo (Si aún no se ha validado o si hubo error) */}
          {!resultadoValidacion && !procesando && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  errorValidacion 
                    ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/50' 
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-800 text-sm mb-1">
                  {archivo ? archivo.name : 'Haz clic aquí para seleccionar tu archivo CSV'}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  El archivo debe contener exactamente las columnas: <br />
                  <span className="font-semibold text-slate-600">Fecha, Tipo, Categoría, Descripción, Importe</span>
                </p>
              </div>

              {/* Error de validación atómica (Punto 5) */}
              {errorValidacion && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-900">Importación cancelada (Validación no superada)</p>
                      <p className="leading-relaxed font-medium">{errorValidacion}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-700 flex items-center justify-between">
                    <span>🛡️ Ningún dato de tus movimientos existentes ha sido modificado.</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="font-bold underline hover:text-rose-900"
                    >
                      Elegir otro archivo
                    </button>
                  </div>
                </div>
              )}

              {/* Guía informativa de requisitos */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Requisitos de seguridad para la importación:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] pl-1">
                  <li><strong>Formato de fecha:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">YYYY-MM-DD</code> (ej: 2026-11-13).</li>
                  <li><strong>Tipo de movimiento:</strong> Debe ser exactamente <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">Ingreso</code> o <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">Gasto</code>.</li>
                  <li><strong>Categorías:</strong> Deben coincidir con categorías ya creadas en la app. No se crean categorías automáticamente.</li>
                  <li><strong>Importes:</strong> Valores numéricos positivos mayores a cero.</li>
                  <li><strong>Operación atómica:</strong> Si una sola fila tiene un error, todo el archivo se rechaza sin guardar nada parcial.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Estado de carga / procesamiento */}
          {procesando && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-700">Leyendo y validando archivo CSV...</p>
              <p className="text-xs text-slate-400">Verificando columnas, formatos y cotejando categorías</p>
            </div>
          )}

          {/* PASO 3 y 4: Resumen Previo y Solicitud de Confirmación (HU-012) */}
          {resultadoValidacion && !procesando && (
            <div className="space-y-4 animate-in fade-in">
              {/* Tarjetas de Resumen del Lote */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Movimientos</p>
                  <p className="text-lg font-bold text-slate-800">{resultadoValidacion.resumen.totalMovimientos}</p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{resultadoValidacion.resumen.cantIngresos} Ingresos</span>
                  </p>
                  <p className="text-sm font-bold text-emerald-700">
                    +{formatoMoneda(resultadoValidacion.resumen.sumaIngresos)}
                  </p>
                </div>

                <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-medium text-rose-600 uppercase tracking-wider flex items-center justify-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>{resultadoValidacion.resumen.cantGastos} Gastos</span>
                  </p>
                  <p className="text-sm font-bold text-rose-700">
                    -{formatoMoneda(resultadoValidacion.resumen.sumaGastos)}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Balance Lote</p>
                  <p className={`text-sm font-bold ${
                    resultadoValidacion.resumen.balanceNetoLote >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {resultadoValidacion.resumen.balanceNetoLote >= 0 ? '+' : ''}
                    {formatoMoneda(resultadoValidacion.resumen.balanceNetoLote)}
                  </p>
                </div>
              </div>

              {/* ADVERTENCIA DE DUPLICADOS (Punto 6) */}
              {resultadoValidacion.tieneDuplicados && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-950">
                        Advertencia preventiva: Se detectaron {resultadoValidacion.duplicados.length} posibles movimientos duplicados
                      </p>
                      <p className="leading-relaxed text-amber-800">
                        Los datos de fecha, tipo, categoría, descripción e importe coinciden con registros que ya tienes guardados en tu historial.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => setMostrarDetalleDuplicados(!mostrarDetalleDuplicados)}
                      className="text-amber-800 hover:text-amber-950 font-semibold underline text-[11px]"
                    >
                      {mostrarDetalleDuplicados ? 'Ocultar coincidencias' : `Ver las ${resultadoValidacion.duplicados.length} coincidencias detectadas`}
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-950">
                      <input 
                        type="checkbox"
                        checked={confirmarDuplicados}
                        onChange={(e) => setConfirmarDuplicados(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-amber-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Confirmar e importar todos de todas formas</span>
                    </label>
                  </div>

                  {/* Detalle desplegable de duplicados */}
                  {mostrarDetalleDuplicados && (
                    <div className="max-h-36 overflow-y-auto border border-amber-200/80 rounded-lg bg-white p-2 text-[11px] space-y-1.5">
                      {resultadoValidacion.duplicados.map((dup, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0 text-slate-700">
                          <span className="font-mono text-slate-500">Fila {dup.filaCSV}: {dup.fecha}</span>
                          <span className="font-semibold text-slate-800">{dup.categoria} - {dup.descripcion || '(Sin descripción)'}</span>
                          <span className={dup.tipo === 'ingreso' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {dup.tipo === 'ingreso' ? '+' : '-'}{formatoMoneda(dup.importe)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Vista previa de las filas validadas (muestra hasta 5 filas o scroll) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Vista previa de registros a importar ({resultadoValidacion.filasValidadas.length})
                  </span>
                  <button 
                    onClick={handleReset}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Cambiar archivo
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Categoría</th>
                        <th className="py-2 px-3">Descripción</th>
                        <th className="py-2 px-3 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultadoValidacion.filasValidadas.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{f.fecha}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              f.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {f.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">{f.categoria}</td>
                          <td className="py-2 px-3 text-slate-500 max-w-[150px] truncate" title={f.descripcion}>
                            {f.descripcion || '—'}
                          </td>
                          <td className={`py-2 px-3 text-right font-bold ${
                            f.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {f.tipo === 'ingreso' ? '+' : '-'}{formatoMoneda(f.importe)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal con Botones */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          {resultadoValidacion && !procesando && (
            <button
              type="button"
              onClick={handleConfirmarImportacion}
              disabled={resultadoValidacion.tieneDuplicados && !confirmarDuplicados}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all ${
                resultadoValidacion.tieneDuplicados && !confirmarDuplicados
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {resultadoValidacion.tieneDuplicados && !confirmarDuplicados
                  ? 'Confirma la advertencia de duplicados'
                  : `Confirmar e Importar ${resultadoValidacion.filasValidadas.length} Movimientos`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
