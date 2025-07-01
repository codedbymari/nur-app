'use client';

export default function StatisticsGrid({ statistikk }) {
  const stats = [
    { value: statistikk.totalSoknader, label: 'Totale søknader', color: 'text-[#780000]' },
    { value: statistikk.ventendeSoknader, label: 'Venter på svar', color: 'text-orange-600' },
    { value: statistikk.godkjenteSoknader, label: 'Godkjente', color: 'text-green-600' },
    { value: statistikk.avslatteSoknader, label: 'Avslåtte', color: 'text-red-600' },
    { value: statistikk.totalBrukere, label: 'Totale brukere', color: 'text-[#780000]' },
    { value: statistikk.aktiveBrukere, label: 'Aktive brukere', color: 'text-green-600' },
    { value: statistikk.aktiveInvitasjoner, label: 'Aktive invitasjoner', color: 'text-blue-600' },
    { value: statistikk.bruktInvitasjoner, label: 'Brukte invitasjoner', color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[#FDF0D5] p-4 rounded-lg">
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
