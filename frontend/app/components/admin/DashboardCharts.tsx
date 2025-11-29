'use client';

import { useEffect, useState } from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  revenueData: number[];
  categoryData: ChartData[];
  orderStatusData: ChartData[];
}

export default function DashboardCharts({ 
  revenueData, 
  categoryData, 
  orderStatusData 
}: DashboardChartsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const maxRevenue = Math.max(...revenueData);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
          <span>📈</span>
          Revenus des 7 derniers jours
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {revenueData.map((revenue, index) => {
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full flex flex-col items-center group">
                  {/* Value tooltip */}
                  <div className="absolute -top-10 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatPrice(revenue)}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
                    style={{ 
                      height: `${height}%`,
                      minHeight: height > 0 ? '8px' : '0px'
                    }}
                  />
                </div>
                
                {/* Day label */}
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
          <span>🎯</span>
          Répartition par catégorie
        </h3>
        
        <div className="space-y-4">
          {categoryData.map((category, index) => {
            const maxValue = Math.max(...categoryData.map(c => c.value));
            const percentage = maxValue > 0 ? (category.value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium truncate">
                    {category.label}
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {category.value}
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${category.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {categoryData.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <span className="text-4xl mb-3 block">📊</span>
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Order Status */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
          <span>📋</span>
          Statut des commandes
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {orderStatusData.map((status, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{status.label}</span>
              </div>
              <span className="text-slate-900 dark:text-white text-2xl font-bold">{status.value}</span>
            </div>
          ))}
        </div>
        
        {orderStatusData.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <span className="text-4xl mb-3 block">📋</span>
            <p>Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );
}