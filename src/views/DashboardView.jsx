import React from 'react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  PlusCircle, 
  Receipt,
  Calendar
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { useFinancial } from '../context/FinancialContext'

export default function DashboardView({ onOpenModal, onNavigate }) {
  const { 
    configuracion, 
    totales, 
    ultimosMovimientos, 
    presupuestosMesActual,
    mesActual, 
    formatoMoneda 
  } = useFinancial()

  // Formatear el mes actual legible (ej. "Noviembre 2026")
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

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Panel Principal</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Periodo actual: <strong>{getMesNombre(mesActual)}</strong></span>
          </p>
        </div>

        <button
          onClick={onOpenModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {/* Tarjetas Principales (KPIs) con DATOS 100% REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Balance General Reactivo (HU-003, RN-003, RN-004) */}
        <StatCard
          title="Balance General"
          amount={formatoMoneda(totales.balanceGeneral)}
          subtitle={
            totales.esNegativo 
              ? 'Balance negativo (Gastos superan saldo e ingresos)' 
              : 'Saldo Inicial + Ingresos - Gastos'
          }
          icon={Wallet}
          colorTheme={totales.esNegativo ? 'rose' : 'emerald'}
          isNegative={totales.esNegativo}
        />

        {/* Total Ingresos del Mes */}
        <StatCard
          title={`Total Ingresos (${getMesNombre(mesActual)})`}
          amount={formatoMoneda(totales.ingresosMes)}
          subtitle="Ingresos registrados en el mes actual"
          icon={TrendingUp}
          colorTheme="emerald"
        />

        {/* Total Gastos del Mes */}
        <StatCard
          title={`Total Gastos (${getMesNombre(mesActual)})`}
          amount={formatoMoneda(totales.gastosMes)}
          subtitle="Gastos realizados en el mes actual"
          icon={TrendingDown}
          colorTheme="rose"
        />
      </div>

      {/* Sección Inferior: Presupuestos Reales y Últimos Movimientos Reales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Control de Presupuestos REALES (HU-007 y HU-008) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Control de Presupuestos</h3>
            </div>
            <button 
              onClick={() => onNavigate('presupuestos')}
              className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
            >
              Gestionar
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Resumen del mes actual ({getMesNombre(mesActual)})
          </p>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {presupuestosMesActual.length === 0 ? (
              /* Estado Vacío de Presupuestos */
              <div className="text-center py-8 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 my-auto">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-700">Sin presupuestos para este mes</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                  Configura límites de gasto mensual para activar el semáforo y monitorear tus finanzas.
                </p>
                <button
                  onClick={() => onNavigate('presupuestos')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  + Asignar Presupuesto
                </button>
              </div>
            ) : (
              /* Listado de Presupuestos Reales con Semáforo */
              presupuestosMesActual.map((b) => {
                let barColor = 'bg-emerald-500'
                let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                let statusText = 'Normal (<80%)'

                if (b.estado === 'amarillo') {
                  barColor = 'bg-amber-500'
                  badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'
                  statusText = 'Cerca del límite'
                } else if (b.estado === 'rojo') {
                  barColor = 'bg-rose-500'
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200'
                  statusText = 'Superado (≥100%)'
                }

                return (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{b.categoriaNombre}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Barra de progreso visual (sin desbordamiento) */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${b.porcentajeVisual}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                      <span>{formatoMoneda(b.totalGastado)} de {formatoMoneda(b.limite)}</span>
                      <span className={`font-bold ${b.estado === 'rojo' ? 'text-rose-600' : 'text-slate-700'}`}>
                        {b.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Últimos 5 Movimientos REALES (HU-003) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Últimos Movimientos</h3>
              <p className="text-xs text-slate-400">Transacciones reales registradas en LocalStorage</p>
            </div>
            {ultimosMovimientos.length > 0 && (
              <button 
                onClick={() => onNavigate('movimientos')}
                className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
              >
                Ver todos ({ultimosMovimientos.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1 flex flex-col justify-center">
            {ultimosMovimientos.length === 0 ? (
              /* Estado vacío cuando no hay transacciones */
              <div className="text-center py-10 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 my-auto">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">Aún no hay movimientos registrados</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Comienza registrando tu primer ingreso o gasto para que el balance y las estadísticas comiencen a calcularse automáticamente.
                </p>
                <button
                  onClick={onOpenModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Primer Movimiento</span>
                </button>
              </div>
            ) : (
              /* Tabla con los últimos movimientos reales */
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold">Concepto / Categoría</th>
                    <th className="pb-3 font-semibold text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ultimosMovimientos.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 text-slate-500 whitespace-nowrap">{tx.fecha}</td>
                      <td className="py-3 text-slate-800 font-medium">
                        <div className="flex items-center gap-2">
                          {tx.tipo === 'ingreso' ? (
                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {tx.descripcion || tx.categoria || 'Sin descripción'}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {tx.categoria}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 text-right font-bold whitespace-nowrap text-xs ${
                        tx.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}{formatoMoneda(tx.importe)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
