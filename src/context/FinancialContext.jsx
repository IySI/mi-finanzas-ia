import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { storageService, DEFAULT_CONFIG, DEFAULT_CATEGORIAS } from '../services/storageService'

const FinancialContext = createContext()

export function FinancialProvider({ children }) {
  const [configuracion, setConfiguracion] = useState(DEFAULT_CONFIG)
  const [categorias, setCategorias] = useState(DEFAULT_CATEGORIAS)
  const [movimientos, setMovimientos] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [cargando, setCargando] = useState(true)

  // Cargar datos reales al iniciar la aplicación
  useEffect(() => {
    try {
      const configGuardada = storageService.getConfiguracion()
      const categoriasGuardadas = storageService.getCategorias()
      const movimientosGuardados = storageService.getMovimientos()
      const presupuestosGuardados = storageService.getPresupuestos()

      setConfiguracion(configGuardada)
      setCategorias(categoriasGuardadas)
      setMovimientos(movimientosGuardados)
      setPresupuestos(presupuestosGuardados)
    } catch (err) {
      console.error('Error al inicializar datos:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  // Guardar configuración (HU-001)
  const guardarConfiguracion = (nuevaConfig) => {
    const res = storageService.saveConfiguracion(nuevaConfig)
    if (res.success) {
      setConfiguracion(res.data)
    }
    return res
  }

  // Agregar categoría (HU-004)
  const agregarCategoria = (nombre) => {
    const res = storageService.addCategoria(nombre)
    if (res.success) {
      setCategorias(res.todas)
    }
    return res
  }

  // Eliminar categoría (HU-004, RN-006 con reasignación a 'Otros')
  const eliminarCategoria = (id) => {
    const res = storageService.deleteCategoria(id)
    if (res.success) {
      setCategorias(res.todas)
      if (res.movimientosActualizados) {
        setMovimientos(res.movimientosActualizados)
      }
      if (res.presupuestosActualizados) {
        setPresupuestos(res.presupuestosActualizados)
      }
    }
    return res
  }

  // Agregar nuevo movimiento (HU-002, RN-001, RN-002)
  const agregarMovimiento = (movData) => {
    const res = storageService.addMovimiento(movData)
    if (res.success) {
      setMovimientos(res.todos)
    }
    return res
  }

  // Editar movimiento existente (HU-006, RN-001, RN-002)
  const editarMovimiento = (id, updatedData) => {
    const res = storageService.updateMovimiento(id, updatedData)
    if (res.success) {
      setMovimientos(res.todos)
    }
    return res
  }

  // Eliminar movimiento (HU-006, RN-008)
  const eliminarMovimiento = (id) => {
    const res = storageService.deleteMovimiento(id)
    if (res.success) {
      setMovimientos(res.todos)
    }
    return res
  }

  // Importar lote de movimientos validados (HU-012)
  const importarMovimientos = (movimientosValidados) => {
    const res = storageService.importMovimientos(movimientosValidados)
    if (res.success) {
      setMovimientos(res.todos)
    }
    return res
  }

  // Guardar o actualizar presupuesto (HU-007, RN-001)
  const guardarPresupuesto = (presData) => {
    const res = storageService.upsertPresupuesto(presData)
    if (res.success) {
      setPresupuestos(res.todos)
    }
    return res
  }

  // Eliminar presupuesto (HU-007)
  const eliminarPresupuesto = (id) => {
    const res = storageService.deletePresupuesto(id)
    if (res.success) {
      setPresupuestos(res.todos)
    }
    return res
  }

  // Lista completa de movimientos ordenados cronológicamente descendente (HU-005)
  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      const dateDiff = new Date(b.fecha) - new Date(a.fecha)
      if (dateDiff !== 0) return dateDiff
      return new Date(b.creadoEn || 0) - new Date(a.creadoEn || 0)
    })
  }, [movimientos])

  // Mes actual en formato YYYY-MM para filtrar ingresos y gastos del periodo
  const mesActual = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }, [])

  // Cálculos Financieros Reactivos del Dashboard (HU-003, RN-003, RN-004, RN-005)
  const financialTotals = useMemo(() => {
    let totalIngresos = 0
    let totalGastos = 0
    let ingresosMes = 0
    let gastosMes = 0

    movimientos.forEach((m) => {
      const importe = Number(m.importe) || 0
      const esDelMes = typeof m.fecha === 'string' && m.fecha.startsWith(mesActual)

      if (m.tipo === 'ingreso') {
        totalIngresos += importe
        if (esDelMes) ingresosMes += importe
      } else if (m.tipo === 'gasto') {
        totalGastos += importe
        if (esDelMes) gastosMes += importe
      }
    })

    // Balance General = Saldo Inicial + Total Ingresos - Total Gastos
    const saldoInicial = Number(configuracion.saldoInicial) || 0
    const balanceGeneral = saldoInicial + totalIngresos - totalGastos

    return {
      totalIngresos,
      totalGastos,
      ingresosMes,
      gastosMes,
      balanceGeneral,
      esNegativo: balanceGeneral < 0
    }
  }, [movimientos, configuracion.saldoInicial, mesActual])

  // Últimos 5 movimientos ordenados por fecha descendente
  const ultimosMovimientos = useMemo(() => {
    return movimientosOrdenados.slice(0, 5)
  }, [movimientosOrdenados])

  // Cálculo automático de consumo y semáforo de presupuestos (HU-007, HU-008, RN-007)
  const presupuestosConCalculos = useMemo(() => {
    return presupuestos.map((p) => {
      const catObj = categorias.find(c => c.id === p.categoriaId)
      const categoriaNombre = catObj ? catObj.nombre : 'Otros'

      // Sumar únicamente gastos del mes correspondiente y categoría correspondiente
      const totalGastado = movimientos.reduce((acc, m) => {
        if (m.tipo === 'gasto' && typeof m.fecha === 'string' && m.fecha.startsWith(p.mes)) {
          if (m.categoriaId === p.categoriaId || m.categoria === categoriaNombre) {
            return acc + (Number(m.importe) || 0)
          }
        }
        return acc
      }, 0)

      const limite = Number(p.limite) || 0
      const restante = limite - totalGastado
      const porcentaje = limite > 0 ? (totalGastado / limite) * 100 : 0
      const porcentajeVisual = Math.min(porcentaje, 100)
      const excedido = totalGastado > limite ? totalGastado - limite : 0

      // Semáforo: Verde (<80%), Amarillo (80% a 99.99%), Rojo (>=100%)
      let estado = 'verde'
      let estadoTexto = 'Normal'
      if (porcentaje >= 100) {
        estado = 'rojo'
        estadoTexto = 'Límite alcanzado o superado'
      } else if (porcentaje >= 80) {
        estado = 'amarillo'
        estadoTexto = 'Cerca del límite'
      }

      return {
        ...p,
        categoriaNombre,
        totalGastado,
        restante,
        porcentaje,
        porcentajeVisual,
        excedido,
        estado,
        estadoTexto
      }
    })
  }, [presupuestos, movimientos, categorias])

  // Presupuestos del mes actual (para Dashboard y resumen mensual)
  const presupuestosMesActual = useMemo(() => {
    return presupuestosConCalculos.filter(p => p.mes === mesActual)
  }, [presupuestosConCalculos, mesActual])

  // Formateador de moneda dinámico
  const formatoMoneda = (cantidad) => {
    const num = Number(cantidad) || 0
    const esNegativo = num < 0
    const valorAbsoluto = Math.abs(num)
    const formateado = valorAbsoluto.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return `${esNegativo ? '-' : ''}${configuracion.moneda} ${formateado}`
  }

  return (
    <FinancialContext.Provider
      value={{
        configuracion,
        guardarConfiguracion,
        categorias,
        agregarCategoria,
        eliminarCategoria,
        movimientos,
        movimientosOrdenados,
        agregarMovimiento,
        editarMovimiento,
        eliminarMovimiento,
        importarMovimientos,
        presupuestos,
        guardarPresupuesto,
        eliminarPresupuesto,
        presupuestosConCalculos,
        presupuestosMesActual,
        totales: financialTotals,
        ultimosMovimientos,
        mesActual,
        formatoMoneda,
        cargando
      }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (!context) {
    throw new Error('useFinancial debe usarse dentro de un FinancialProvider')
  }
  return context
}
