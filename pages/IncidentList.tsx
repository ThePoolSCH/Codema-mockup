
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { UserRole, IncidentStatus, IncidentPriority } from '../types';
import { Link } from 'react-router-dom';

const IncidentList: React.FC = () => {
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!context) return null;
  const { user, incidents, students } = context;

  const filteredIncidents = incidents.filter(inc => {
    // Role filter
    const hasAccess = user?.role === UserRole.ADMIN || inc.reporterId === user?.id || inc.assignedToIds.includes(user?.id || '');
    if (!hasAccess) return false;

    // Search filter
    const student = students.find(s => s.id === inc.studentId);
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Incidencias</h1>
          <p className="text-slate-500">Gestión de casos reportados y seguimiento.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por título o alumno..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="ALL">Todos los estados</option>
            <option value={IncidentStatus.OPEN}>Abiertos</option>
            <option value={IncidentStatus.CLOSED}>Cerrados</option>
            <option value={IncidentStatus.PENDING_REVIEW}>En Revisión</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Incidencia</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Alumno / Grado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridad</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(inc => {
                const student = students.find(s => s.id === inc.studentId);
                return (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inc.status === IncidentStatus.OPEN ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{inc.title}</p>
                      <p className="text-xs text-slate-400">{inc.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{student?.name}</p>
                      <p className="text-xs text-slate-500">{student?.grade}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        inc.priority === IncidentPriority.URGENT || inc.priority === IncidentPriority.HIGH 
                        ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/incidents/${inc.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Detalles
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No se encontraron incidencias con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentList;
