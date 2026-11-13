import React from 'react'

export default function StatCard({ title, amount, subtitle, icon: Icon, colorTheme = 'emerald', isNegative = false }) {
  const themeStyles = {
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      valueColor: isNegative ? 'text-rose-600' : 'text-slate-900',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600 border-rose-100',
      valueColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700',
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 border-blue-100',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-blue-50 text-blue-700',
    }
  }

  const currentTheme = themeStyles[colorTheme] || themeStyles.emerald

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${currentTheme.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className={`text-2xl font-bold tracking-tight ${currentTheme.valueColor}`}>
          {amount}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
