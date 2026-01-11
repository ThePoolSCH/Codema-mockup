
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { UserRole, IncidentStatus } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { user, incidents } = context;

  // Filter incidents based on role
  const filteredIncidents = incidents.filter(inc => {
    if (user?.role === UserRole.ADMIN) return true;
    return inc.reporterId === user?.id || inc.assignedToIds.includes(user?.id || '');
  });

  const openIncidents = filteredIncidents.filter(i => i.status === IncidentStatus.OPEN);
  const urgentIncidents = filteredIncidents.filter(i => i.priority === 'URGENT' && i.status === IncidentStatus.OPEN);
  
  const stats = [
    { label: 'Incidencias Abiertas', value: openIncidents.length, icon: 'fa-folder-open', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Urgentes', value: urgentIncidents.length, icon: 'fa-triangle-exclamation', color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Mis Asignaciones', value: filteredIncidents.filter(i => i.assignedToIds.includes(user?.id || '')).length, icon: 'fa-user-check', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Total Histórico', value: filteredIncidents.length, icon: 'fa-database', color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hola, {user?.name}</h1>
        <p className="text-slate-500">Aquí tienes un resumen de la actividad escolar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`${s.bg} ${s.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Incidencias Recientes</h3>
            <Link to="/incidents" className="text-sm text-blue-600 font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.slice(0, 5).map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="p-6 flex items-center hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${inc.status === IncidentStatus.OPEN ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      <h4 className="font-semibold text-slate-800 group-hover:text-blue-600">{inc.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {inc.type} • Reportado hace {Math.floor((Date.now() - new Date(inc.createdAt).getTime()) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      inc.priority === 'HIGH' || inc.priority === 'URGENT' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {inc.priority}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <i className="fa-solid fa-clipboard-list text-4xl mb-3 block"></i>
                No hay incidencias registradas
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6">Próximos Eventos</h3>
          <div className="space-y-4">
            {filteredIncidents.flatMap(inc => inc.events).filter(ev => new Date(ev.date) > new Date()).slice(0, 4).map(ev => (
               <div key={ev.id} className="flex space-x-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase">{new Date(ev.date).toLocaleString('es', { month: 'short' })}</div>
                    <div className="text-lg font-bold text-slate-800">{new Date(ev.date).getDate()}</div>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">{ev.type}</p>
                  </div>
               </div>
            ))}
            {filteredIncidents.flatMap(inc => inc.events).filter(ev => new Date(ev.date) > new Date()).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4 italic">No hay eventos agendados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
