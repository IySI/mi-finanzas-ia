/**
 * Servicio de Almacenamiento Local (LocalStorage)
 * Mi Finanzas IA — Fase 4 & Lección 8
 */

const STORAGE_KEYS = {
  CONFIG: 'mi_finanzas_configuracion',
  CATEGORIAS: 'mi_finanzas_categorias',
  MOVIMIENTOS: 'mi_finanzas_movimientos',
  PRESUPUESTOS: 'mi_finanzas_presupuestos'
}

// Categorías predeterminadas según HU-004 y RN-006
export const DEFAULT_CATEGORIAS = [
  { id: 'cat_alimentacion', nombre: 'Alimentación', predeterminada: true },
  { id: 'cat_transporte', nombre: 'Transporte', predeterminada: true },
  { id: 'cat_vivienda', nombre: 'Vivienda', predeterminada: true },
  { id: 'cat_salud', nombre: 'Salud', predeterminada: true },
  { id: 'cat_ocio', nombre: 'Ocio', predeterminada: true },
  { id: 'cat_salario', nombre: 'Salario', predeterminada: true },
  { id: 'cat_otros', nombre: 'Otros', predeterminada: true },
]

// Configuración inicial por defecto según HU-001
export const DEFAULT_CONFIG = {
  moneda: '$',
  saldoInicial: 0.0,
}

export const storageService = {
  /**
   * Obtiene la configuración actual de LocalStorage
   */
  getConfiguracion() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG)
      if (!data) {
        return DEFAULT_CONFIG
      }
      const parsed = JSON.parse(data)
      return {
        moneda: typeof parsed.moneda === 'string' && parsed.moneda.trim() ? parsed.moneda : DEFAULT_CONFIG.moneda,
        saldoInicial: typeof parsed.saldoInicial === 'number' && !isNaN(parsed.saldoInicial) ? parsed.saldoInicial : Number(parsed.saldoInicial) || 0.0,
      }
    } catch (error) {
      console.error('Error al leer la configuración de LocalStorage:', error)
      return DEFAULT_CONFIG
    }
  },

  /**
   * Guarda la configuración en LocalStorage
   */
  saveConfiguracion(config) {
    try {
      const validConfig = {
        moneda: config.moneda ? config.moneda.trim() : '$',
        saldoInicial: Number(config.saldoInicial) || 0.0,
      }
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(validConfig))
      return { success: true, data: validConfig }
    } catch (error) {
      console.error('Error al guardar la configuración en LocalStorage:', error)
      return { success: false, error: 'No se pudo guardar la configuración en el almacenamiento local.' }
    }
  },

  /**
   * Obtiene el listado de categorías (inicializa con las predeterminadas si no existen)
   */
  getCategorias() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIAS)
      if (!data) {
        // Inicializar con categorías predeterminadas
        localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(DEFAULT_CATEGORIAS))
        return DEFAULT_CATEGORIAS
      }
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asegurar que siempre exista la categoría comodín 'Otros'
        const hasOtros = parsed.some(c => c.nombre.toLowerCase() === 'otros')
        if (!hasOtros) {
          parsed.push({ id: 'cat_otros', nombre: 'Otros', predeterminada: true })
          localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(parsed))
        }
        return parsed
      }
      return DEFAULT_CATEGORIAS
    } catch (error) {
      console.error('Error al leer las categorías de LocalStorage:', error)
      return DEFAULT_CATEGORIAS
    }
  },

  /**
   * Guarda la lista completa de categorías en LocalStorage
   */
  saveCategorias(categorias) {
    try {
      if (!Array.isArray(categorias)) {
        throw new Error('El formato de categorías debe ser un arreglo.')
      }
      localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias))
      return { success: true }
    } catch (error) {
      console.error('Error al guardar categorías en LocalStorage:', error)
      return { success: false, error: 'No se pudieron guardar las categorías en el almacenamiento local.' }
    }
  },

  /**
   * Agrega una nueva categoría personalizada
   */
  addCategoria(nombre) {
    const nombreLimpio = nombre ? nombre.trim() : ''
    if (!nombreLimpio) {
      return { success: false, error: 'El nombre de la categoría no puede estar vacío.' }
    }

    const categoriasActuales = this.getCategorias()
    
    // Validar duplicados (insensible a mayúsculas/minúsculas)
    const existe = categoriasActuales.some(
      c => c.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    )
    if (existe) {
      return { success: false, error: `Ya existe una categoría llamada "${nombreLimpio}".` }
    }

    const nuevaCat = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombre: nombreLimpio,
      predeterminada: false,
    }

    const nuevasCategorias = [...categoriasActuales, nuevaCat]
    const saveResult = this.saveCategorias(nuevasCategorias)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, data: nuevaCat, todas: nuevasCategorias }
  },

  /**
   * Elimina una categoría personalizada (protege las predeterminadas)
   */
  deleteCategoria(id) {
    const categoriasActuales = this.getCategorias()
    const categoria = categoriasActuales.find(c => c.id === id)

    if (!categoria) {
      return { success: false, error: 'La categoría no existe.' }
    }

    if (categoria.predeterminada) {
      return { success: false, error: 'No se pueden eliminar categorías predeterminadas del sistema.' }
    }

    // Regla RN-006: Reasignar movimientos asociados a la categoría 'Otros' para preservar la integridad histórica
    const movimientosActuales = this.getMovimientos()
    let movimientosModificados = false
    const movimientosActualizados = movimientosActuales.map((m) => {
      if (m.categoriaId === id || m.categoria === categoria.nombre) {
        movimientosModificados = true
        return {
          ...m,
          categoriaId: 'cat_otros',
          categoria: 'Otros',
          actualizadoEn: new Date().toISOString()
        }
      }
      return m
    })

    if (movimientosModificados) {
      this.saveMovimientos(movimientosActualizados)
    }

    // Limpiar presupuestos huérfanos asociados a la categoría eliminada
    const presupuestosActuales = this.getPresupuestos()
    const presupuestosFiltrados = presupuestosActuales.filter(p => p.categoriaId !== id)
    let presupuestosModificados = false
    if (presupuestosFiltrados.length !== presupuestosActuales.length) {
      presupuestosModificados = true
      this.savePresupuestos(presupuestosFiltrados)
    }

    // Regla RN-006: La categoría 'Otros' siempre debe existir para futuras reasignaciones
    const nuevasCategorias = categoriasActuales.filter(c => c.id !== id)
    const saveResult = this.saveCategorias(nuevasCategorias)
    if (!saveResult.success) {
      return saveResult
    }

    return { 
      success: true, 
      eliminada: categoria, 
      todas: nuevasCategorias,
      movimientosActualizados: movimientosModificados ? movimientosActualizados : null,
      presupuestosActualizados: presupuestosModificados ? presupuestosFiltrados : null
    }
  },

  /**
   * Obtiene la lista de movimientos guardados en LocalStorage (HU-002)
   */
  getMovimientos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS)
      if (!data) {
        return []
      }
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error al leer los movimientos de LocalStorage:', error)
      return []
    }
  },

  /**
   * Guarda la lista completa de movimientos en LocalStorage
   */
  saveMovimientos(movimientos) {
    try {
      if (!Array.isArray(movimientos)) {
        throw new Error('El formato de movimientos debe ser un arreglo.')
      }
      localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(movimientos))
      return { success: true }
    } catch (error) {
      console.error('Error al guardar movimientos en LocalStorage:', error)
      return { success: false, error: 'No se pudieron guardar los movimientos en el almacenamiento local.' }
    }
  },

  /**
   * Registra y valida un nuevo movimiento (HU-002, RN-001, RN-002)
   */
  addMovimiento(movData) {
    // 1. Validar Tipo
    if (movData.tipo !== 'ingreso' && movData.tipo !== 'gasto') {
      return { success: false, error: 'El tipo de movimiento debe ser Ingreso o Gasto.' }
    }

    // 2. Validar Importe
    const numImporte = Number(movData.importe)
    if (isNaN(numImporte) || numImporte <= 0) {
      return { success: false, error: 'El importe debe ser un número estrictamente mayor que cero.' }
    }

    // 3. Validar Fecha
    if (!movData.fecha || isNaN(new Date(movData.fecha).getTime())) {
      return { success: false, error: 'Debes proporcionar una fecha válida.' }
    }

    // 4. Validar Categoría
    if (!movData.categoriaId && !movData.categoria) {
      return { success: false, error: 'Debes seleccionar una categoría válida.' }
    }

    const categorias = this.getCategorias()
    const categoriaObj = categorias.find(c => c.id === movData.categoriaId || c.nombre === movData.categoria)
    const categoriaId = categoriaObj ? categoriaObj.id : 'cat_otros'
    const categoriaNombre = categoriaObj ? categoriaObj.nombre : 'Otros'

    // 5. Construir objeto de Movimiento según modelo de datos aprobado
    const nuevoMovimiento = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tipo: movData.tipo,
      importe: parseFloat(numImporte.toFixed(2)),
      fecha: movData.fecha,
      categoriaId: categoriaId,
      categoria: categoriaNombre,
      descripcion: (movData.descripcion || '').trim(),
      creadoEn: new Date().toISOString()
    }

    const movimientosActuales = this.getMovimientos()
    // Guardar nuevo movimiento al inicio de la lista
    const nuevosMovimientos = [nuevoMovimiento, ...movimientosActuales]

    const saveResult = this.saveMovimientos(nuevosMovimientos)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, data: nuevoMovimiento, todos: nuevosMovimientos }
  },

  /**
   * Modifica un movimiento existente conservando su ID y fecha de creación (HU-006, RN-001, RN-002)
   */
  updateMovimiento(id, updatedData) {
    if (!id) {
      return { success: false, error: 'Identificador de movimiento no proporcionado.' }
    }

    // 1. Validar Tipo
    if (updatedData.tipo !== 'ingreso' && updatedData.tipo !== 'gasto') {
      return { success: false, error: 'El tipo de movimiento debe ser Ingreso o Gasto.' }
    }

    // 2. Validar Importe
    const numImporte = Number(updatedData.importe)
    if (isNaN(numImporte) || numImporte <= 0) {
      return { success: false, error: 'El importe debe ser un número estrictamente mayor que cero.' }
    }

    // 3. Validar Fecha
    if (!updatedData.fecha || isNaN(new Date(updatedData.fecha).getTime())) {
      return { success: false, error: 'Debes proporcionar una fecha válida.' }
    }

    const movimientosActuales = this.getMovimientos()
    const index = movimientosActuales.findIndex(m => m.id === id)
    if (index === -1) {
      return { success: false, error: 'El movimiento a editar no existe en el almacenamiento local.' }
    }

    // Resolver nombre de categoría
    const categorias = this.getCategorias()
    const categoriaObj = categorias.find(c => c.id === updatedData.categoriaId || c.nombre === updatedData.categoria)
    const categoriaId = categoriaObj ? categoriaObj.id : 'cat_otros'
    const categoriaNombre = categoriaObj ? categoriaObj.nombre : 'Otros'

    // Actualizar manteniendo id original y creadoEn original
    const movimientoActualizado = {
      ...movimientosActuales[index],
      tipo: updatedData.tipo,
      importe: parseFloat(numImporte.toFixed(2)),
      fecha: updatedData.fecha,
      categoriaId: categoriaId,
      categoria: categoriaNombre,
      descripcion: (updatedData.descripcion || '').trim(),
      actualizadoEn: new Date().toISOString()
    }

    const nuevosMovimientos = [...movimientosActuales]
    nuevosMovimientos[index] = movimientoActualizado

    const saveResult = this.saveMovimientos(nuevosMovimientos)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, data: movimientoActualizado, todos: nuevosMovimientos }
  },

  /**
   * Elimina un movimiento por su ID de LocalStorage (HU-006, RN-008)
   */
  deleteMovimiento(id) {
    if (!id) {
      return { success: false, error: 'Identificador de movimiento no proporcionado.' }
    }

    const movimientosActuales = this.getMovimientos()
    const movimientoAEliminar = movimientosActuales.find(m => m.id === id)

    if (!movimientoAEliminar) {
      return { success: false, error: 'El movimiento no fue encontrado.' }
    }

    const nuevosMovimientos = movimientosActuales.filter(m => m.id !== id)
    const saveResult = this.saveMovimientos(nuevosMovimientos)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, eliminado: movimientoAEliminar, todos: nuevosMovimientos }
  },

  /**
   * Importa de forma atómica un lote de movimientos validados (HU-012)
   * Asigna identificadores únicos nuevos a cada uno y los combina con los existentes.
   */
  importMovimientos(movimientosValidados) {
    try {
      if (!Array.isArray(movimientosValidados) || movimientosValidados.length === 0) {
        return { success: false, error: 'No se recibieron movimientos válidos para importar.' }
      }

      const movimientosActuales = this.getMovimientos()
      const timestampBase = Date.now()

      const nuevosConId = movimientosValidados.map((m, idx) => ({
        id: `mov_imp_${timestampBase}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        tipo: m.tipo,
        importe: parseFloat(Number(m.importe).toFixed(2)),
        fecha: m.fecha,
        categoriaId: m.categoriaId || 'cat_otros',
        categoria: m.categoria || 'Otros',
        descripcion: (m.descripcion || '').trim(),
        creadoEn: new Date(timestampBase + idx).toISOString()
      }))

      // Combinar los nuevos movimientos al inicio de la lista
      const todosMovimientos = [...nuevosConId, ...movimientosActuales]

      const saveResult = this.saveMovimientos(todosMovimientos)
      if (!saveResult.success) {
        return saveResult
      }

      return {
        success: true,
        importados: nuevosConId,
        totalImportados: nuevosConId.length,
        todos: todosMovimientos
      }
    } catch (error) {
      console.error('Error al importar movimientos en LocalStorage:', error)
      return { success: false, error: 'Error inesperado al persistir los movimientos importados en LocalStorage.' }
    }
  },

  /**
   * Obtiene la lista de presupuestos guardados en LocalStorage (HU-007)
   */
  getPresupuestos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESUPUESTOS)
      if (!data) {
        return []
      }
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error al leer los presupuestos de LocalStorage:', error)
      return []
    }
  },

  /**
   * Guarda la lista completa de presupuestos en LocalStorage
   */
  savePresupuestos(presupuestos) {
    try {
      if (!Array.isArray(presupuestos)) {
        throw new Error('El formato de presupuestos debe ser un arreglo.')
      }
      localStorage.setItem(STORAGE_KEYS.PRESUPUESTOS, JSON.stringify(presupuestos))
      return { success: true }
    } catch (error) {
      console.error('Error al guardar presupuestos en LocalStorage:', error)
      return { success: false, error: 'No se pudieron guardar los presupuestos en el almacenamiento local.' }
    }
  },

  /**
   * Guarda o actualiza un presupuesto mensual evitando duplicados para la misma categoría y mes (HU-007, RN-001)
   */
  upsertPresupuesto(presData) {
    // 1. Validar categoría
    if (!presData.categoriaId) {
      return { success: false, error: 'Debes seleccionar una categoría para el presupuesto.' }
    }

    // 2. Validar límite (> 0)
    const numLimite = Number(presData.limite)
    if (isNaN(numLimite) || numLimite <= 0) {
      return { success: false, error: 'El límite mensual debe ser un número estrictamente mayor que cero.' }
    }

    // 3. Validar mes (YYYY-MM)
    if (!presData.mes || !/^\d{4}-\d{2}$/.test(presData.mes)) {
      return { success: false, error: 'El mes debe tener un formato válido (YYYY-MM).' }
    }

    const presupuestosActuales = this.getPresupuestos()
    const indexExistente = presupuestosActuales.findIndex(
      p => p.categoriaId === presData.categoriaId && p.mes === presData.mes
    )

    let nuevosPresupuestos = [...presupuestosActuales]
    let presupuestoGuardado

    if (indexExistente >= 0) {
      // Modificar presupuesto existente
      presupuestoGuardado = {
        ...presupuestosActuales[indexExistente],
        limite: parseFloat(numLimite.toFixed(2)),
        actualizadoEn: new Date().toISOString()
      }
      nuevosPresupuestos[indexExistente] = presupuestoGuardado
    } else {
      // Crear nuevo presupuesto
      presupuestoGuardado = {
        id: `pres_${presData.mes}_${presData.categoriaId}_${Date.now().toString(36)}`,
        categoriaId: presData.categoriaId,
        mes: presData.mes,
        limite: parseFloat(numLimite.toFixed(2)),
        creadoEn: new Date().toISOString()
      }
      nuevosPresupuestos.push(presupuestoGuardado)
    }

    const saveResult = this.savePresupuestos(nuevosPresupuestos)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, data: presupuestoGuardado, todos: nuevosPresupuestos }
  },

  /**
   * Elimina un presupuesto por su ID
   */
  deletePresupuesto(id) {
    if (!id) {
      return { success: false, error: 'Identificador no proporcionado.' }
    }

    const presupuestosActuales = this.getPresupuestos()
    const nuevosPresupuestos = presupuestosActuales.filter(p => p.id !== id)

    const saveResult = this.savePresupuestos(nuevosPresupuestos)
    if (!saveResult.success) {
      return saveResult
    }

    return { success: true, todos: nuevosPresupuestos }
  }
}
