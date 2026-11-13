import React, { useState, useMemo } from 'react'
import { 
  Upload, 
  Download, 
  Filter, 
  Pencil, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Calendar, 
  Search,
  Wallet
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import { csvService } from '../services/csvService'
import ImportModal from '../components/ImportModal'

export default function MovimientosView({ onOpenModal, onEditMovement }) {
  const { 
    configuracion, 
    categorias, 
    movimientos,
    movimientosOrdenados, 
    eliminarMovimiento, 
    importarMovimientos,
    formatoMoneda 
  } = useFinancial()

  // Estados de Filtros (HU-009)
  const [periodoFiltro, setPeriodoFiltro] = useState('todos') // 'todos', 'este_mes', 'mes_anterior', 'personalizado'
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [errorFechas, setErrorFechas] = useState(null)
  const [notification, setNotification] = useState(null)

  // Estado del Modal de Importación (HU-012)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4500)
  }

  // Exportar todos los movimientos a CSV (HU-011)
  const handleExportCSV = () => {
    if (!movimientosOrdenados || movimientosOrdenados.length === 0) {
      showNotification('No hay movimientos registrados para exportar.', 'info')
      return
    }

    try {
      const res = csvService.exportarMovimientos(movimientosOrdenados)
      if (res.success) {
        showNotification(`¡Exportación exitosa! Se descargó el archivo "${res.nombreArchivo}" con ${res.total} movimientos.`, 'success')
      } else {
        showNotification(res.error || 'Ocurrió un error al exportar el archivo CSV.', 'error')
      }
    } catch (err) {
      console.error('Error al exportar movimientos:', err)
      showNotification('No se pudo exportar el archivo CSV.', 'error')
    }
  }

  // Manejar importación exitosa tras validación y confirmación (HU-012)
  const handleImportSuccess = (filasValidadas) => {
    try {
      const res = importarMovimientos(filasValidadas)
      if (res.success) {
        showNotification(`¡Importación completada! Se guardaron exitosamente ${res.totalImportados} movimientos en tu historial.`, 'success')
      } else {
        showNotification(res.error || 'Ocurrió un error al guardar los movimientos importados.', 'error')
      }
    } catch (err) {
      console.error('Error al importar movimientos:', err)
      showNotification('No se pudo completar la importación de movimientos.', 'error')
    }
  }

  // Calcular cadenas de mes actual y mes anterior con la fecha local del usuario
  const { esteMesStr, mesAnteriorStr, nombreEsteMes, nombreMesAnterior } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthNum = now.getMonth() // 0 a 11

    // Mes actual (YYYY-MM)
    const esteMes = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}`
    const nombreActual = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

    // Mes anterior (maneja cambio de año automáticamente)
    const prevDate = new Date(currentYear, currentMonthNum - 1, 1)
    const prevYear = prevDate.getFullYear()
    const prevMonthNum = prevDate.getMonth()
    const mesAnterior = `${prevYear}-${String(prevMonthNum + 1).padStart(2, '0')}`
    const nombreAnterior = prevDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

    return {
      esteMesStr: esteMes,
      mesAnteriorStr: mesAnterior,
      nombreEsteMes: nombreActual.charAt(0).toUpperCase() + nombreActual.slice(1),
      nombreMesAnterior: nombreAnterior.charAt(0).toUpperCase() + nombreAnterior.slice(1)
    }
  }, [])

  // Validación de Rango de Fechas
  const handleFechaInicioChange = (val) => {
    setFechaInicio(val)
    if (fechaFin && val && val > fechaFin) {
      setErrorFechas('La fecha inicial no puede ser posterior a la fecha final.')
    } else {
      setErrorFechas(null)
    }
  }

  const handleFechaFinChange = (val) => {
    setFechaFin(val)
    if (fechaInicio && val && fechaInicio > val) {
      setErrorFechas('La fecha inicial no puede ser posterior a la fecha final.')
    } else {
      setErrorFechas(null)
    }
  }

  // Limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setPeriodoFiltro('todos')
    setCategoriaFiltro('todas')
    setFechaInicio('')
    setFechaFin('')
    setBusquedaTexto('')
    setErrorFechas(null)
  }

  // Filtrado combinado de movimientos (HU-009)
  const movimientosFiltrados = useMemo(() => {
    return movimientosOrdenados.filter((m) => {
      // 1. Filtro por Fecha
      if (periodoFiltro === 'este_mes') {
        if (!m.fecha || !m.fecha.startsWith(esteMesStr)) return false
      } else if (periodoFiltro === 'mes_anterior') {
        if (!m.fecha || !m.fecha.startsWith(mesAnteriorStr)) return false
      } else if (periodoFiltro === 'personalizado') {
        if (!errorFechas) {
          if (fechaInicio && m.fecha < fechaInicio) return false
          if (fechaFin && m.fecha > fechaFin) return false
        }
      }

      // 2. Filtro por Categoría
      if (categoriaFiltro !== 'todas') {
        const coincideId = m.categoriaId === categoriaFiltro
        const coincideNombre = m.categoria === categoriaFiltro
        if (!coincideId && !coincideNombre) return false
      }

      // 3. Filtro opcional por texto en descripción o categoría
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase().trim()
        const desc = (m.descripcion || '').toLowerCase()
        const cat = (m.categoria || '').toLowerCase()
        if (!desc.includes(query) && !cat.includes(query)) return false
      }

      return true
    })
  }, [movimientosOrdenados, periodoFiltro, categoriaFiltro, fechaInicio, fechaFin, busquedaTexto, esteMesStr, mesAnteriorStr, errorFechas])

  // Cálculo de totales filtrados (HU-009, Requisito 4)
  const totalesFiltrados = useMemo(() => {
    let ingresos = 0
    let gastos = 0

    movimientosFiltrados.forEach((m) => {
      const imp = Number(m.importe) || 0
      if (m.tipo === 'ingreso') {
        ingresos += imp
      } else if (m.tipo === 'gasto') {
        gastos += imp
      }
    })

    const balanceNeto = ingresos - gastos

    return {
      cantidad: movimientosFiltrados.length,
      ingresos,
      gastos,
      balanceNeto,
      esNegativo: balanceNeto < 0
    }
  }, [movimientosFiltrados])

  // Eliminar movimiento con diálogo de confirmación (HU-006, RN-008)
  const handleDelete = (movimiento) => {
    const descripcion = movimiento.descripcion || movimiento.categoria || 'Movimiento'
    const montoFormateado = `${movimiento.tipo === 'ingreso' ? '+' : '-'}${formatoMoneda(movimiento.importe)}`

    const confirmado = window.confirm(
      `¿Estás seguro de que deseas eliminar este movimiento?\n\n• Concepto: ${descripcion}\n• Importe: ${montoFormateado}\n• Fecha: ${movimiento.fecha}\n\nEsta acción no se puede deshacer.`
    )

    if (confirmado) {
      const res = eliminarMovimiento(movimiento.id)
      if (res.success) {
        showNotification('Movimiento eliminado correctamente. El balance se ha recalculado.', 'success')
      } else {
        showNotification(res.error || 'No se pudo eliminar el movimiento.', 'error')
      }
    }
  }

  const hayFiltrosActivos = periodoFiltro !== 'todos' || categoriaFiltro !== 'todas' || Boolean(busquedaTexto.trim()) || Boolean(fechaInicio) || Boolean(fechaFin)

  return (
    <div className="space-y-6">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Historial de Movimientos</h2>
          <p className="text-xs text-slate-400">
            Consulta, filtra y audita tus transacciones reales ({movimientosOrdenados.length} en total)
          </p>
        </div>

        {/* Botones de Importar y Exportar CSV (HU-011, HU-012) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-emerald-500/50 flex items-center gap-2 shadow-sm transition-all"
            title="Importar movimientos desde archivo CSV estándar (HU-012)"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-emerald-500/50 flex items-center gap-2 shadow-sm transition-all"
            title="Exportar todos los movimientos a CSV (HU-011)"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {notification.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Panel de Filtros por Fechas y Categorías (HU-009) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Controles de Filtro */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Periodo de Fechas */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <select 
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="todos">Todos los periodos</option>
                <option value="este_mes">Este mes ({nombreEsteMes})</option>
                <option value="mes_anterior">Mes anterior ({nombreMesAnterior})</option>
                <option value="personalizado">Rango personalizado...</option>
              </select>
            </div>

            {/* Filtro por Categoría */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
              <select 
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Buscador de texto */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                placeholder="Buscar concepto..."
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 justify-end">
            {hayFiltrosActivos && (
              <button
                onClick={handleLimpiarFiltros}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}

            <button
              onClick={onOpenModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        {/* Inputs de Rango Personalizado (cuando se selecciona 'personalizado') */}
        {periodoFiltro === 'personalizado' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 rounded-xl animate-in fade-in">
            <span className="text-xs font-semibold text-slate-600">Rango de fechas:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-500">Desde:</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-500">Hasta:</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => handleFechaFinChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {errorFechas && (
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorFechas}
              </span>
            )}
          </div>
        )}

        {/* Tarjetas de Totales Filtrados (HU-009, Requisito 4) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium block">Movimientos encontrados</span>
            <span className="text-base font-bold text-slate-800">{totalesFiltrados.cantidad}</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 font-medium block">Ingresos filtrados</span>
            <span className="text-base font-bold text-emerald-600">+{formatoMoneda(totalesFiltrados.ingresos)}</span>
          </div>

          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
            <span className="text-[11px] text-rose-700 font-medium block">Gastos filtrados</span>
            <span className="text-base font-bold text-rose-600">-{formatoMoneda(totalesFiltrados.gastos)}</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            totalesFiltrados.esNegativo 
              ? 'bg-rose-50/70 border-rose-200' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[11px] text-slate-500 font-medium block">Balance neto del periodo</span>
            <span className={`text-base font-bold ${
              totalesFiltrados.esNegativo ? 'text-rose-600' : 'text-slate-800'
            }`}>
              {formatoMoneda(totalesFiltrados.balanceNeto)}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          💡 El balance neto del periodo es exclusivo de la consulta actual y no altera el Balance General consolidado del Dashboard.
        </p>
      </div>

      {/* Tabla de Movimientos Filtrados */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {movimientosOrdenados.length === 0 ? (
          /* Estado Vacío cuando no hay ningún movimiento registrado en la app */
          <div className="text-center py-16 px-4 bg-slate-50/50">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No hay movimientos en el historial</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Registra tus ingresos y gastos para visualizarlos ordenados cronológicamente, editarlos o auditarlos.
            </p>
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Primer Movimiento</span>
            </button>
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          /* Estado Vacío cuando los filtros activos no encuentran coincidencias (Requisito 5) */
          <div className="text-center py-16 px-4 bg-slate-50/50">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
              <Filter className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No se encontraron movimientos con los filtros seleccionados</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Prueba cambiando el rango de fechas, la categoría seleccionada o limpia los filtros para volver a ver todas tus transacciones.
            </p>
            <button
              onClick={handleLimpiarFiltros}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer Filtros</span>
            </button>
          </div>
        ) : (
          /* Tabla con Movimientos Filtrados */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Fecha</th>
                  <th className="py-3.5 px-4 font-semibold">Tipo</th>
                  <th className="py-3.5 px-4 font-semibold">Categoría</th>
                  <th className="py-3.5 px-4 font-semibold">Descripción</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Importe</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {movimientosFiltrados.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {tx.fecha}
                    </td>

                    {/* Tipo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.tipo === 'ingreso' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          Ingreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          Gasto
                        </span>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {tx.categoria || 'Otros'}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className="py-3.5 px-4 text-slate-800">
                      <span className="font-medium">{tx.descripcion || '—'}</span>
                    </td>

                    {/* Importe */}
                    <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap text-xs ${
                      tx.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.tipo === 'ingreso' ? '+' : '-'}{formatoMoneda(tx.importe)}
                    </td>

                    {/* Acciones: Editar y Eliminar (HU-006) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => onEditMovement(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar este movimiento"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar este movimiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resumen al pie de la tabla */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Mostrando <strong>{movimientosFiltrados.length}</strong> de <strong>{movimientosOrdenados.length}</strong> movimientos registrados
              </span>
              <span className="text-[11px] text-slate-400">
                Orden cronológico (más reciente primero) conservado con filtros reactivos
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Importación CSV (HU-012) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categoriasExistentes={categorias}
        movimientosExistentes={movimientos}
        formatoMoneda={formatoMoneda}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  )
}
