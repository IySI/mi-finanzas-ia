import React, { useState, useMemo } from 'react'
import { 
  PieChart as PieIcon, 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Receipt,
  Info
} from 'lucide-react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { useFinancial } from '../context/FinancialContext'

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

// Paleta de colores atractiva y accesible para categorías
const CATEGORY_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#e11d48', // Rose
  '#84cc16', // Lime
  '#64748b', // Slate
]

export default function ReportesView() {
  const { configuracion, movimientos, formatoMoneda } = useFinancial()
  const [selectedPeriod, setSelectedPeriod] = useState('mes_actual')

  // Fechas y nombres de periodos calculados con la fecha local del usuario
  const { 
    esteMesStr, 
    nombreEsteMes, 
    mesAnteriorStr, 
    nombreMesAnterior, 
    esteAnoStr, 
    anoAnteriorStr 
  } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthNum = now.getMonth()

    const esteMes = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}`
    const nombreActual = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

    const prevMonthDate = new Date(currentYear, currentMonthNum - 1, 1)
    const prevYear = prevMonthDate.getFullYear()
    const prevMonthNum = prevMonthDate.getMonth()
    const mesAnterior = `${prevYear}-${String(prevMonthNum + 1).padStart(2, '0')}`
    const nombreAnterior = prevMonthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

    return {
      esteMesStr: esteMes,
      nombreEsteMes: nombreActual.charAt(0).toUpperCase() + nombreActual.slice(1),
      mesAnteriorStr: mesAnterior,
      nombreMesAnterior: nombreAnterior.charAt(0).toUpperCase() + nombreAnterior.slice(1),
      esteAnoStr: `${currentYear}`,
      anoAnteriorStr: `${currentYear - 1}`
    }
  }, [])

  // Filtrar movimientos según el período seleccionado
  const movimientosPeriodo = useMemo(() => {
    return movimientos.filter((m) => {
      if (!m.fecha) return false
      if (selectedPeriod === 'mes_actual') {
        return m.fecha.startsWith(esteMesStr)
      } else if (selectedPeriod === 'mes_anterior') {
        return m.fecha.startsWith(mesAnteriorStr)
      } else if (selectedPeriod === 'ano_actual') {
        return m.fecha.startsWith(esteAnoStr)
      } else if (selectedPeriod === 'ano_anterior') {
        return m.fecha.startsWith(anoAnteriorStr)
      }
      return true
    })
  }, [movimientos, selectedPeriod, esteMesStr, mesAnteriorStr, esteAnoStr, anoAnteriorStr])

  // Resumen financiero del período seleccionado (HU-010, Requisito 5)
  const resumenFinanciero = useMemo(() => {
    let ingresos = 0
    let gastos = 0

    movimientosPeriodo.forEach((m) => {
      const imp = Number(m.importe) || 0
      if (m.tipo === 'ingreso') {
        ingresos += imp
      } else if (m.tipo === 'gasto') {
        gastos += imp
      }
    })

    const balanceNeto = ingresos - gastos

    return {
      ingresos,
      gastos,
      balanceNeto,
      esNegativo: balanceNeto < 0,
      totalMovimientos: movimientosPeriodo.length
    }
  }, [movimientosPeriodo])

  // Datos para Gráfico de Gastos por Categoría (Doughnut Chart)
  const doughnutData = useMemo(() => {
    const gastosPorCategoria = {}
    let totalGastosPeriodo = 0

    movimientosPeriodo.forEach((m) => {
      if (m.tipo === 'gasto') {
        const cat = m.categoria || 'Otros'
        const imp = Number(m.importe) || 0
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + imp
        totalGastosPeriodo += imp
      }
    })

    const labels = Object.keys(gastosPorCategoria)
    const dataValues = Object.values(gastosPorCategoria)

    if (labels.length === 0 || totalGastosPeriodo === 0) {
      return null
    }

    const backgroundColors = labels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length])

    // Lista detallada con porcentajes para la leyenda
    const itemsDetallados = labels.map((label, idx) => {
      const monto = dataValues[idx]
      const porcentaje = totalGastosPeriodo > 0 ? (monto / totalGastosPeriodo) * 100 : 0
      return {
        categoria: label,
        monto,
        porcentaje,
        color: backgroundColors[idx]
      }
    }).sort((a, b) => b.monto - a.monto)

    return {
      chartData: {
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      },
      itemsDetallados,
      totalGastosPeriodo
    }
  }, [movimientosPeriodo])

  // Datos para Gráfico de Ingresos vs. Gastos (Bar Chart)
  const barData = useMemo(() => {
    const esMensual = selectedPeriod === 'mes_actual' || selectedPeriod === 'mes_anterior'

    if (esMensual) {
      // Comparativa directa del mes seleccionado
      const nombreEtiqueta = selectedPeriod === 'mes_actual' ? nombreEsteMes : nombreMesAnterior
      return {
        labels: [nombreEtiqueta],
        datasets: [
          {
            label: 'Ingresos',
            data: [resumenFinanciero.ingresos],
            backgroundColor: '#10b981',
            borderRadius: 8,
            maxBarThickness: 60
          },
          {
            label: 'Gastos',
            data: [resumenFinanciero.gastos],
            backgroundColor: '#f43f5e',
            borderRadius: 8,
            maxBarThickness: 60
          }
        ]
      }
    } else {
      // Comparativa anual mes a mes de Enero a Diciembre
      const anoSeleccionado = selectedPeriod === 'ano_actual' ? esteAnoStr : anoAnteriorStr
      const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const ingresosMesAMes = new Array(12).fill(0)
      const gastosMesAMes = new Array(12).fill(0)

      movimientosPeriodo.forEach((m) => {
        if (m.fecha && m.fecha.startsWith(anoSeleccionado)) {
          const mesIndex = parseInt(m.fecha.split('-')[1], 10) - 1
          const imp = Number(m.importe) || 0
          if (mesIndex >= 0 && mesIndex < 12) {
            if (m.tipo === 'ingreso') {
              ingresosMesAMes[mesIndex] += imp
            } else if (m.tipo === 'gasto') {
              gastosMesAMes[mesIndex] += imp
            }
          }
        }
      })

      return {
        labels: mesesLabels,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosMesAMes,
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Gastos',
            data: gastosMesAMes,
            backgroundColor: '#f43f5e',
            borderRadius: 6
          }
        ]
      }
    }
  }, [selectedPeriod, resumenFinanciero, movimientosPeriodo, nombreEsteMes, nombreMesAnterior, esteAnoStr, anoAnteriorStr])

  // Opciones de configuración para el gráfico Doughnut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Usamos nuestra propia leyenda detallada
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0
            const total = doughnutData?.totalGastosPeriodo || 1
            const pct = ((val / total) * 100).toFixed(1)
            return ` ${context.label}: ${configuracion.moneda}${val.toFixed(2)} (${pct}%)`
          }
        }
      }
    },
    cutout: '68%'
  }

  // Opciones de configuración para el gráfico Bar
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: '600' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0
            return ` ${context.dataset.label}: ${configuracion.moneda}${val.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${configuracion.moneda}${value}`,
          font: { size: 10 }
        },
        grid: {
          color: '#f1f5f9'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11, weight: '500' }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y Selector de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reportes Financieros</h2>
          <p className="text-xs text-slate-400">
            Visualiza y analiza tus patrones de gasto y capacidad de ahorro con gráficos interactivos (HU-010)
          </p>
        </div>

        {/* Selector de Período (Requisito 4) */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="mes_actual">Mes actual ({nombreEsteMes})</option>
            <option value="mes_anterior">Mes anterior ({nombreMesAnterior})</option>
            <option value="ano_actual">Año actual ({esteAnoStr})</option>
            <option value="ano_anterior">Año anterior ({anoAnteriorStr})</option>
          </select>
        </div>
      </div>

      {/* Resumen Financiero del Período (HU-010, Requisito 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ingresos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            +{formatoMoneda(resumenFinanciero.ingresos)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Entradas en el período seleccionado</span>
        </div>

        {/* Total Gastos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gastos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600">
            -{formatoMoneda(resumenFinanciero.gastos)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Salidas en el período seleccionado</span>
        </div>

        {/* Balance Neto del Período */}
        <div className={`bg-white rounded-2xl p-5 border shadow-sm ${
          resumenFinanciero.esNegativo ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance Neto del Período</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              resumenFinanciero.esNegativo ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${
            resumenFinanciero.esNegativo ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {formatoMoneda(resumenFinanciero.balanceNeto)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {resumenFinanciero.esNegativo ? 'Déficit en este período' : 'Ahorro / Superávit generado'}
          </span>
        </div>
      </div>

      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          El balance neto del período es un cálculo exclusivo de la consulta actual y no altera el Balance General consolidado del Dashboard ni contabiliza el saldo inicial como ingreso.
        </span>
      </div>

      {/* Grid con los Dos Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Gastos por Categoría (Doughnut Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">Distribución de Gastos por Categoría</h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                Chart.js
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Porcentaje que representa cada categoría respecto al total de gastos del período
            </p>

            {/* Contenedor del Gráfico o Estado Vacío */}
            {!doughnutData ? (
              <div className="h-64 flex flex-col items-center justify-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center">
                <Receipt className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-xs font-semibold text-slate-700">No hay gastos en este período</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Registra gastos para visualizar la distribución porcentual en este gráfico circular.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Canvas de Chart.js */}
                <div className="h-60 relative flex items-center justify-center">
                  <Doughnut data={doughnutData.chartData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] text-slate-400 font-medium">Gastos Totales</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatoMoneda(doughnutData.totalGastosPeriodo)}
                    </span>
                  </div>
                </div>

                {/* Leyenda interactiva detallada con porcentajes e importes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {doughnutData.itemsDetallados.map((item) => (
                    <div 
                      key={item.categoria} 
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-semibold text-slate-700 truncate">{item.categoria}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-bold text-slate-800 block">{item.porcentaje.toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-400">{formatoMoneda(item.monto)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Ingresos vs. Gastos (Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">Comparativa: Ingresos vs. Gastos</h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                Chart.js
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              {selectedPeriod.includes('ano') 
                ? 'Evolución mes a mes para evaluar tu comportamiento financiero en el año' 
                : 'Comparación directa de entradas y salidas durante el mes'}
            </p>

            {/* Contenedor del Gráfico o Estado Vacío */}
            {resumenFinanciero.totalMovimientos === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center">
                <BarChart2 className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-xs font-semibold text-slate-700">No hay movimientos en este período</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Registra ingresos o gastos para comparar barras de entradas y salidas.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Canvas de Chart.js */}
                <div className="h-64">
                  <Bar data={barData} options={barOptions} />
                </div>

                {/* Resumen del Superávit/Déficit */}
                <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  resumenFinanciero.esNegativo 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}>
                  <div>
                    <span className={`font-semibold ${
                      resumenFinanciero.esNegativo ? 'text-rose-800' : 'text-emerald-800'
                    }`}>
                      {resumenFinanciero.esNegativo ? 'Déficit del período:' : 'Capacidad de Ahorro / Superávit:'}
                    </span>
                    <p className="text-[11px] text-slate-500">Diferencia entre ingresos y gastos registrados</p>
                  </div>
                  <span className={`text-base font-bold ${
                    resumenFinanciero.esNegativo ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {resumenFinanciero.esNegativo ? '-' : '+'}{formatoMoneda(Math.abs(resumenFinanciero.balanceNeto))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
