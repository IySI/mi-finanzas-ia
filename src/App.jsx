import React, { useState } from 'react'
import { Menu, PlusCircle, Wallet } from 'lucide-react'
import Sidebar from './components/Sidebar'
import TransactionModal from './components/TransactionModal'
import DashboardView from './views/DashboardView'
import MovimientosView from './views/MovimientosView'
import PresupuestosView from './views/PresupuestosView'
import ReportesView from './views/ReportesView'
import ConfiguracionView from './views/ConfiguracionView'
import { FinancialProvider } from './context/FinancialContext'

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movimientoAEditar, setMovimientoAEditar] = useState(null)
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  // Abrir modal para crear nuevo movimiento (HU-002)
  const handleOpenNewMovement = () => {
    setMovimientoAEditar(null)
    setIsModalOpen(true)
  }

  // Abrir modal para editar movimiento existente (HU-006)
  const handleEditMovement = (mov) => {
    setMovimientoAEditar(mov)
    setIsModalOpen(true)
  }

  // Cerrar modal y limpiar estado de edición
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setMovimientoAEditar(null)
  }

  // Selector de Vistas
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenModal={handleOpenNewMovement} onNavigate={setActiveTab} />
      case 'movimientos':
        return (
          <MovimientosView 
            onOpenModal={handleOpenNewMovement} 
            onEditMovement={handleEditMovement} 
          />
        )
      case 'presupuestos':
        return <PresupuestosView />
      case 'reportes':
        return <ReportesView />
      case 'configuracion':
        return <ConfiguracionView />
      default:
        return <DashboardView onOpenModal={handleOpenNewMovement} onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Barra Lateral (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenModal={handleOpenNewMovement}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Contenido Principal */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Barra Superior Móvil */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-base">Mi Finanzas <span className="text-emerald-600">IA</span></span>
            </div>
          </div>

          <button
            onClick={handleOpenNewMovement}
            className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors"
            title="Nuevo Movimiento"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </header>

        {/* Área de Visualización */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Modal Universal de Nuevo / Editar Movimiento (HU-002 y HU-006) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movimientoAEditar={movimientoAEditar}
      />
    </div>
  )
}

export default function App() {
  return (
    <FinancialProvider>
      <MainLayout />
    </FinancialProvider>
  )
}
