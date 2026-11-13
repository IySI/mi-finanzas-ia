import React, { useState, useEffect } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle, AlertCircle, Pencil } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

export default function TransactionModal({ isOpen, onClose, movimientoAEditar = null }) {
  const { configuracion, categorias, agregarMovimiento, editarMovimiento } = useFinancial()

  const isEditing = Boolean(movimientoAEditar)

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const [tipo, setTipo] = useState('gasto')
  const [importe, setImporte] = useState('')
  const [fecha, setFecha] = useState(getTodayDate())
  const [categoriaId, setCategoriaId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState({})

  // Cargar datos al abrir el modal (según sea modo creación o edición)
  useEffect(() => {
    if (isOpen) {
      setErrores({})

      if (movimientoAEditar) {
        // Modo Edición (HU-006)
        setTipo(movimientoAEditar.tipo || 'gasto')
        setImporte(movimientoAEditar.importe ? movimientoAEditar.importe.toString() : '')
        setFecha(movimientoAEditar.fecha || getTodayDate())
        setDescripcion(movimientoAEditar.descripcion || '')

        // Encontrar categoriaId por ID o por nombre
        const cat = categorias.find(c => c.id === movimientoAEditar.categoriaId || c.nombre === movimientoAEditar.categoria)
        setCategoriaId(cat ? cat.id : (categorias[0]?.id || ''))
      } else {
        // Modo Creación (HU-002)
        setTipo('gasto')
        setImporte('')
        setFecha(getTodayDate())
        setDescripcion('')
        const defaultCat = categorias.find(c => c.nombre.toLowerCase() === 'alimentación') || categorias[0]
        setCategoriaId(defaultCat ? defaultCat.id : '')
      }
    }
  }, [isOpen, movimientoAEditar, categorias])

  if (!isOpen) return null

  // Validación de campos antes de guardar (RN-001, RN-002)
  const validarFormulario = () => {
    const nuevosErrores = {}

    // 1. Validar importe
    const numImporte = parseFloat(importe)
    if (!importe || isNaN(numImporte)) {
      nuevosErrores.importe = 'Por favor ingresa un importe numérico válido.'
    } else if (numImporte <= 0) {
      nuevosErrores.importe = 'El importe debe ser estrictamente mayor que cero (> 0).'
    }

    // 2. Validar fecha
    if (!fecha) {
      nuevosErrores.fecha = 'Debes seleccionar una fecha válida.'
    }

    // 3. Validar categoría
    if (!categoriaId) {
      nuevosErrores.categoria = 'Debes seleccionar una categoría.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const catSeleccionada = categorias.find(c => c.id === categoriaId)

    const payload = {
      tipo,
      importe: parseFloat(importe),
      fecha,
      categoriaId,
      categoria: catSeleccionada ? catSeleccionada.nombre : 'Otros',
      descripcion: descripcion.trim()
    }

    let resultado
    if (isEditing) {
      // Guardar cambios en movimiento existente (HU-006)
      resultado = editarMovimiento(movimientoAEditar.id, payload)
    } else {
      // Guardar nuevo movimiento (HU-002)
      resultado = agregarMovimiento(payload)
    }

    if (resultado.success) {
      handleClose()
    } else {
      setErrores({ general: resultado.error || 'Ocurrió un error al procesar el movimiento.' })
    }
  }

  const handleClose = () => {
    setErrores({})
    setImporte('')
    setDescripcion('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro atenuado */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pencil className="w-4 h-4" />
              </div>
            ) : null}
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-snug">
                {isEditing ? 'Editar Movimiento' : 'Registrar Nuevo Movimiento'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modifica los datos del movimiento seleccionado (HU-006)' : 'Guarda un ingreso o gasto real en LocalStorage (HU-002)'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error general si falla el almacenamiento */}
        {errores.general && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errores.general}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Tipo (Ingreso / Gasto) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipo('ingreso')
                  setErrores(prev => ({ ...prev, general: null }))
                }}
                className={`py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all ${
                  tipo === 'ingreso'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo('gasto')
                  setErrores(prev => ({ ...prev, general: null }))
                }}
                className={`py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all ${
                  tipo === 'gasto'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-1 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                Gasto
              </button>
            </div>
          </div>

          {/* Importe y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Importe */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Importe *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {configuracion.moneda}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={importe}
                  onChange={(e) => {
                    setImporte(e.target.value)
                    if (errores.importe) setErrores(prev => ({ ...prev, importe: null }))
                  }}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 ${
                    errores.importe 
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errores.importe && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errores.importe}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value)
                  if (errores.fecha) setErrores(prev => ({ ...prev, fecha: null }))
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 ${
                  errores.fecha 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
              {errores.fecha && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errores.fecha}
                </p>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Categoría *
            </label>
            <select
              value={categoriaId}
              onChange={(e) => {
                setCategoriaId(e.target.value)
                if (errores.categoria) setErrores(prev => ({ ...prev, categoria: null }))
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 ${
                errores.categoria 
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} {cat.predeterminada ? '' : '(Personalizada)'}
                </option>
              ))}
            </select>
            {errores.categoria && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errores.categoria}
              </p>
            )}
          </div>

          {/* Descripción (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Descripción o Concepto (Opcional)
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Supermercado semanal, compra de libros, cena familiar..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-colors"
            >
              {isEditing ? 'Guardar Cambios' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
