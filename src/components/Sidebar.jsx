import React from 'react'
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  BarChart3, 
  Settings, 
  PlusCircle,
  Wallet,
  X
} from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, onOpenModal, isOpenMobile, setIsOpenMobile }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'presupuestos', label: 'Presupuestos', icon: Target },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ]

  const handleSelectTab = (id) => {
    setActiveTab(id)
    if (setIsOpenMobile) {
      setIsOpenMobile(false)
    }
  }

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Barra lateral */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Cabecera / Logotipo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">Mi Finanzas <span className="text-emerald-600">IA</span></h1>
              <p className="text-[10px] text-slate-400 font-medium">Control de Finanzas</p>
            </div>
          </div>
          {setIsOpenMobile && (
            <button 
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              onClick={() => setIsOpenMobile(false)}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botón de Acción Principal (+ Nuevo Movimiento) */}
        <div className="p-4">
          <button
            onClick={onOpenModal}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all hover:shadow-emerald-600/30"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Nuevo Movimiento</span>
          </button>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-5 bg-emerald-600 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Pie del Menú con versión y autoría */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Versión MVP</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Lección 7</span>
            </div>
            <p className="text-[11px] text-slate-400">Estructura visual e interfaz</p>
          </div>
        </div>
      </aside>
    </>
  )
}
