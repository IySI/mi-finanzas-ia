import React, { useState } from 'react'
import { Target, AlertTriangle, CheckCircle2, XCircle, Plus, Pencil, Trash2, Check, AlertCircle, Sparkles } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

export default function PresupuestosView() {
  const { 
    configuracion, 
    categorias, 
    guardarPresupuesto, 
    eliminarPresupuesto, 
    presupuestosConCalculos, 
    mesActual, 
    formatoMoneda 
  } = useFinancial()

  const [selectedCategoriaId, setSelectedCategoriaId] = useState(categorias[0]?.id || '')
  const [selectedMonth, setSelectedMonth] = useState(mesActual)
  const [limitAmount, setLimitAmount] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorForm, setErrorForm] = useState(null)

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type })
    setErrorForm(null)
    setTimeout(() => setNotification(null), 4000)
  }

  // Formatear mes legible (ej. "Noviembre 2026")
  const getMesNombre = (mesStr) => {
    try {
      const [year, month] = mesStr.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const nombre = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
      return nombre.charAt(0).toUpperCase() + nombre.slice(1)
    } catch {
      return mesStr
    }
  }

  // Guardar o Actualizar Presupuesto (HU-007, RN-001)
  const handleSaveBudget = (e) => {
    e.preventDefault()

    const numLimite = parseFloat(limitAmount)
    if (!limitAmount || isNaN(numLimite)) {
      setErrorForm('Por favor introduce un límite numérico válido.')
      return
    }

    if (numLimite <= 0) {
      setErrorForm('El límite mensual debe ser un número estrictamente mayor que cero (> 0).')
      return
    }

    if (!selectedCategoriaId) {
      setErrorForm('Debes seleccionar una categoría.')
      return
    }

    const catObj = categorias.find(c => c.id === selectedCategoriaId)
    const categoriaNombre = catObj ? catObj.nombre : 'Categoría'

    const res = guardarPresupuesto({
      categoriaId: selectedCategoriaId,
      mes: selectedMonth,
      limite: numLimite
    })

    if (res.success) {
      showNotification(`¡Presupuesto para "${categoriaNombre}" guardado exitosamente para ${getMesNombre(selectedMonth)}!`, 'success')
      setLimitAmount('')
      setErrorForm(null)
    } else {
      setErrorForm(res.error || 'Ocurrió un error al guardar el presupuesto.')
    }
  }

  // Cargar presupuesto en el formulario para editar su límite
  const handleEditBudget = (presupuesto) => {
    setSelectedCategoriaId(presupuesto.categoriaId)
    setSelectedMonth(presupuesto.mes)
    setLimitAmount(presupuesto.limite.toString())
    setErrorForm(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Eliminar presupuesto con confirmación
  const handleDeleteBudget = (presupuesto) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar el presupuesto mensual de "${presupuesto.categoriaNombre}" para ${getMesNombre(presupuesto.mes)}?`
    )

    if (confirmado) {
      const res = eliminarPresupuesto(presupuesto.id)
      if (res.success) {
        showNotification(`Presupuesto de "${presupuesto.categoriaNombre}" eliminado.`, 'success')
      } else {
        showNotification(res.error || 'No se pudo eliminar el presupuesto.', 'error')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Presupuestos Mensuales</h2>
          <p className="text-xs text-slate-400">
            Establece límites de gasto y supervisa tu consumo en tiempo real con alertas de semáforo (HU-007 y HU-008)
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm self-start sm:self-auto">
          Periodo activo: <strong>{getMesNombre(mesActual)}</strong>
        </span>
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Formulario para Establecer o Modificar Presupuesto Mensual */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800">Asignar o Modificar Presupuesto Mensual</h3>
        </div>

        {errorForm && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorForm}</span>
          </div>
        )}

        <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Selector de Categoría */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Categoría *
            </label>
            <select
              value={selectedCategoriaId}
              onChange={(e) => setSelectedCategoriaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} {cat.predeterminada ? '' : '(Personalizada)'}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Mes */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Mes Objetivo *
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Límite Mensual */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Límite Mensual *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                {configuracion.moneda}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="Ej. 400.00"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reglas del Semáforo Explicadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800">🟢 Estado Normal (&lt; 80%)</h4>
            <p className="text-[11px] text-emerald-700">El gasto acumulado en el mes está bajo control y lejos del límite.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-800">🟡 Cerca del Límite (80% - 99.9%)</h4>
            <p className="text-[11px] text-amber-700">Alerta preventiva: se ha consumido más del 80% del presupuesto asignado.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-800">🔴 Límite Alcanzado o Superado (≥ 100%)</h4>
            <p className="text-[11px] text-rose-700">El presupuesto mensual asignado fue alcanzado o superado. Indica el excedente.</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Presupuestos Reales de LocalStorage */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-base">Presupuestos Activos ({presupuestosConCalculos.length})</h3>
          <span className="text-xs text-slate-400">Cálculo reactivo con gastos reales</span>
        </div>

        {presupuestosConCalculos.length === 0 ? (
          /* Estado Vacío Amigable */
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">No hay presupuestos configurados todavía</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Establece un límite de gasto mensual para categorías como Alimentación, Ocio o Transporte para activar las alertas de semáforo automáticas.
            </p>
          </div>
        ) : (
          /* Listado de Tarjetas de Presupuestos */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {presupuestosConCalculos.map((b) => {
              let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
              let progressBarBg = 'bg-emerald-500'
              let statusLabel = '🟢 Normal (<80%)'

              if (b.estado === 'amarillo') {
                badgeBg = 'bg-amber-50 text-amber-700 border-amber-200'
                progressBarBg = 'bg-amber-500'
                statusLabel = '🟡 Cerca del Límite'
              } else if (b.estado === 'rojo') {
                badgeBg = 'bg-rose-50 text-rose-700 border-rose-200'
                progressBarBg = 'bg-rose-500'
                statusLabel = '🔴 Límite Superado'
              }

              return (
                <div key={b.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{b.categoriaNombre}</h4>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {getMesNombre(b.mes)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{b.estadoTexto}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
                        {statusLabel}
                      </span>
                      {/* Botón Editar Límite */}
                      <button
                        onClick={() => handleEditBudget(b)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1"
                        title="Modificar límite de este presupuesto"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDeleteBudget(b)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar este presupuesto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de progreso visual con contenedor protegido */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Gastado: {formatoMoneda(b.totalGastado)}</span>
                      <span className={`font-bold ${b.estado === 'rojo' ? 'text-rose-600' : 'text-slate-800'}`}>
                        {b.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${progressBarBg} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${b.porcentajeVisual}%` }}
                      />
                    </div>
                  </div>

                  {/* Detalle numérico: Límite, Disponible o Excedido */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Límite mensual: <strong className="text-slate-700">{formatoMoneda(b.limite)}</strong>
                    </span>
                    {b.excedido > 0 ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        Excedido en: {formatoMoneda(b.excedido)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Disponible: {formatoMoneda(b.restante)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
