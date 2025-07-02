'use client';

import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Send, 
  Mail,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

export default function StatisticsGrid({ statistikk }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = [
    { 
      value: statistikk.totalSoknader, 
      label: 'Totale søknader', 
      color: 'text-[#780000]',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      icon: Users,
      trend: '+12%'
    },
    { 
      value: statistikk.ventendeSoknader, 
      label: 'Venter på svar', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      icon: Clock,
      trend: '+5%'
    },
    { 
      value: statistikk.godkjenteSoknader, 
      label: 'Godkjente', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      icon: CheckCircle,
      trend: '+8%'
    },
    { 
      value: statistikk.avslatteSoknader, 
      label: 'Avslåtte', 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      icon: XCircle,
      trend: '-2%'
    },
    { 
      value: statistikk.totalBrukere, 
      label: 'Totale brukere', 
      color: 'text-[#780000]',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      icon: Users,
      trend: '+15%'
    },
    { 
      value: statistikk.aktiveBrukere, 
      label: 'Aktive brukere', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      icon: UserCheck,
      trend: '+7%'
    },
    { 
      value: statistikk.aktiveInvitasjoner, 
      label: 'Aktive invitasjoner', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      icon: Send,
      trend: '+3%'
    },
    { 
      value: statistikk.bruktInvitasjoner, 
      label: 'Brukte invitasjoner', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      icon: Mail,
      trend: '+6%'
    },
  ];

  // Calculate summary stats for collapsed view
  const summaryStats = [
    {
      label: 'Søknader totalt',
      value: statistikk.totalSoknader,
      color: 'text-[#780000]',
      icon: Users
    },
    {
      label: 'Godkjenningsrate',
      value: statistikk.totalSoknader > 0 
        ? `${Math.round((statistikk.godkjenteSoknader / statistikk.totalSoknader) * 100)}%`
        : '0%',
      color: 'text-green-600',
      icon: CheckCircle
    },
    {
      label: 'Aktive brukere',
      value: statistikk.aktiveBrukere,
      color: 'text-blue-600',
      icon: UserCheck
    }
  ];

  return (
    <div className="mb-8">
      {/* Collapsible Header */}
      <div 
        className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-300"
      >
        {/* Header - Always Visible */}
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Platform Oversikt</h2>
              <p className="text-sm text-gray-600">Nøkkelstatistikk for NÜR matchmaking</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Quick Summary in Collapsed State */}
            {!isExpanded && (
              <div className="hidden md:flex items-center space-x-6">
                {summaryStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-lg font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString('nb-NO') : stat.value}
                    </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Expand/Collapse Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200">
              <span className="text-sm font-medium text-gray-700">
                {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-6 pb-6">
            {/* Last Updated */}
            <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>Oppdatert: {new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const isPositiveTrend = stat.trend.startsWith('+');
                
                return (
                  <div 
                    key={index} 
                    className={`relative bg-gray-50 rounded-2xl border ${stat.borderColor} p-6 
                               group cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-200`}
                  >
                    {/* Icon and Trend */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center
                                      transition-transform duration-300`}>
                        <IconComponent className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full
                                     ${isPositiveTrend 
                                       ? 'bg-green-100 text-green-700' 
                                       : 'bg-red-100 text-red-700'}`}>
                        {stat.trend}
                      </div>
                    </div>

                    {/* Value */}
                    <div className={`text-3xl font-bold ${stat.color} mb-2 
                                   transition-transform duration-300`}>
                      {stat.value?.toLocaleString('nb-NO') || '0'}
                    </div>

                    {/* Label */}
                    <div className="text-sm font-medium text-gray-700 leading-tight">
                      {stat.label}
                    </div>

                    {/* Subtle accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl 
                                   ${stat.color.replace('text-', 'bg-')} opacity-20 
                                   group-hover:opacity-40 transition-opacity duration-300`}></div>
                  </div>
                );
              })}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-[#780000] to-[#C1121F] rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Godkjenningsrate</p>
                    <p className="text-2xl font-bold mt-1">
                      {statistikk.totalSoknader > 0 
                        ? Math.round((statistikk.godkjenteSoknader / statistikk.totalSoknader) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white/60" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Aktive brukere rate</p>
                    <p className="text-2xl font-bold mt-1">
                      {statistikk.totalBrukere > 0 
                        ? Math.round((statistikk.aktiveBrukere / statistikk.totalBrukere) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-white/60" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Invitasjoner brukt</p>
                    <p className="text-2xl font-bold mt-1">
                      {(statistikk.aktiveInvitasjoner + statistikk.bruktInvitasjoner) > 0 
                        ? Math.round((statistikk.bruktInvitasjoner / (statistikk.aktiveInvitasjoner + statistikk.bruktInvitasjoner)) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <Send className="w-8 h-8 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}