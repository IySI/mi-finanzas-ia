import React, { useState, useEffect } from 'react'
import { Settings, DollarSign, Tag, FileSpreadsheet, Plus, Trash2, Check, Download, AlertCircle, Info } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import { csvService } from '../services/csvService'

export default function ConfiguracionView() {
  const { configuracion, guardarConfiguracion, categorias, agregarCategoria, eliminarCategoria } = useFinancial()

  const [moneda, setMoneda] = useState(configuracion.moneda || '$')
  const [saldoInicial, setSaldoInicial] = useState(configuracion.saldoInicial.toString())
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [mensajeExito, setMensajeExito] = useState(null)
  const [mensajeError, setMensajeError] = useState(null)

  // Sincronizar estado local cuando se cargue la configuración de LocalStorage
  useEffect(() => {
    if (configuracion) {
      setMoneda(configuracion.moneda || '$')
      setSaldoInicial(configuracion.saldoInicial.toString())
    }
  }, [configuracion])

  const mostrarExito = (msg) => {
    setMensajeExito(msg)
    setMensajeError(null)
    setTimeout(() => setMensajeExito(null), 4000)
  }

  const mostrarError = (msg) => {
    setMensajeError(msg)
    setMensajeExito(null)
    setTimeout(() => setMensajeError(null), 5000)
  }

  // Guardar Moneda y Saldo Inicial (HU-001)
  const handleSavePreferences = (e) => {
    e.preventDefault()
    const numSaldo = parseFloat(saldoInicial)
    if (isNaN(numSaldo)) {
      mostrarError('Por favor introduce un valor numérico válido para el saldo inicial.')
      return
    }

    if (!moneda.trim()) {
      mostrarError('Debes seleccionar o escribir un símbolo de moneda.')
      return
    }

    const resultado = guardarConfiguracion({
      moneda: moneda.trim(),
      saldoInicial: numSaldo,
    })

    if (resultado.success) {
      mostrarExito('¡Preferencias guardadas exitosamente en el almacenamiento local!')
    } else {
      mostrarError(resultado.error || 'Ocurrió un error al guardar.')
    }
  }

  // Agregar Categoría Personalizada (HU-004)
  const handleAddCategory = (e) => {
    e.preventDefault()
    const nombreLimpio = nuevaCategoria.trim()
    if (!nombreLimpio) {
      mostrarError('El nombre de la nueva categoría no puede estar vacío.')
      return
    }

    const res = agregarCategoria(nombreLimpio)
    if (res.success) {
      setNuevaCategoria('')
      mostrarExito(`Categoría "${res.data.nombre}" creada y guardada en LocalStorage.`)
    } else {
      mostrarError(res.error)
    }
  }

  // Eliminar Categoría Personalizada (HU-004)
  const handleDeleteCategory = (cat) => {
    if (cat.predeterminada) {
      mostrarError('No es posible eliminar categorías predeterminadas del sistema.')
      return
    }

    const confirmado = window.confirm(
      `¿Deseas eliminar la categoría "${cat.nombre}"?\n\nSegún la regla RN-006, si existen movimientos asociados a esta categoría se reasignarán automáticamente a "Otros" para preservar la integridad de tus registros históricos y no alterar el balance.`
    )

    if (confirmado) {
      const res = eliminarCategoria(cat.id)
      if (res.success) {
        mostrarExito(`Categoría "${cat.nombre}" eliminada correctamente.`)
      } else {
        mostrarError(res.error)
      }
    }
  }

  // Descarga de plantilla oficial CSV (HU-011, HU-012, Lección 14)
  const handleDownloadTemplate = () => {
    try {
      csvService.descargarPlantilla()
      mostrarExito('¡Plantilla CSV oficial descargada correctamente con las columnas y ejemplos requeridos!')
    } catch (err) {
      console.error('Error al descargar la plantilla CSV:', err)
      mostrarError('No se pudo descargar la plantilla CSV.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Configuración General</h2>
        <p className="text-xs text-slate-400">Personaliza tu moneda, saldo inicial patrimonial y administra tus categorías (HU-001 y HU-004)</p>
      </div>

      {/* Notificaciones de Éxito y Error */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{mensajeError}</span>
        </div>
      )}

      {/* Grid de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bloque 1: Moneda y Saldo Inicial (HU-001) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Moneda y Saldo Inicial (HU-001)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Define tu divisa y el dinero disponible con el que inicias. Se conserva en LocalStorage bajo la clave <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 text-[11px]">mi_finanzas_configuracion</code>.
            </p>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Símbolo de Moneda
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {['$', '€', 'S/.', 'MXN', 'COP'].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setMoneda(sym)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        moneda === sym
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  placeholder="Otro símbolo (ej. Q, L, ₲)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Saldo Inicial Disponible *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{moneda}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={saldoInicial}
                    onChange={(e) => setSaldoInicial(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Regla RN-005: Este saldo es la base del Balance General y no se contabiliza como ingreso mensual.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
            </form>
          </div>

          {/* Bloque de Descarga de Plantilla CSV */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Plantilla Oficial CSV</h3>
            </div>
            <p className="text-xs text-slate-400">
              Descarga el formato estándar de 5 columnas (Fecha, Tipo, Categoría, Descripción, Importe) para tus respaldos.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Descargar Plantilla Oficial CSV</span>
            </button>
          </div>
        </div>

        {/* Bloque 2: Gestión de Categorías (HU-004) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Administración de Categorías (HU-004)</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{categorias.length} categorías en LocalStorage</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Las categorías predeterminadas están protegidas. Puedes añadir categorías personalizadas o eliminarlas con confirmación.
            </p>

            {/* Formulario para Agregar Categoría */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nombre de nueva categoría (ej. Mascotas, Educación)..."
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>

            {/* Listado de Categorías Reales */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {categorias.map((cat) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.predeterminada ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <span className="font-medium text-slate-800">{cat.nombre}</span>
                    {cat.predeterminada ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-medium">
                        Predeterminada
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-medium">
                        Personalizada
                      </span>
                    )}
                  </div>
                  {!cat.predeterminada && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`Eliminar categoría ${cat.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Clave LocalStorage: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">mi_finanzas_categorias</code>. La categoría <strong>Otros</strong> siempre se mantiene para reasignar movimientos si se elimina una categoría en el futuro (Regla RN-006).
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
