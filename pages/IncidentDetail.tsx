
import React, { useContext, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { IncidentStatus, EventType, IncidentPriority, UserRole, IncidentEvent } from '../types';

const IncidentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeriveModal, setShowDeriveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    type: EventType.OBSERVATION, 
    agreements: '',
    customDate: '' 
  });

  if (!context) return null;
  const { user, incidents, setIncidents, students, users, setUsers } = context;

  const incident = useMemo(() => incidents.find(i => i.id === id), [incidents, id]);
  const student = useMemo(() => students.find(s => s.id === incident?.studentId), [students, incident]);

  if (!incident) return <div className="text-center p-12">Incidencia no encontrada.</div>;

  const canClose = incident.isSimple || incident.events.length >= 2;

  const handleCloseIncident = () => {
    if (!canClose) return;
    setIncidents(prev => prev.map(i => {
      if (i.id === incident.id) {
        let updatedEvents = [...i.events];
        if (updatedEvents.length > 0) {
          const sorted = [...updatedEvents].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const latest = sorted[0];
          const latestIndex = updatedEvents.findIndex(ev => ev.id === latest.id);
          
          if (new Date(latest.date) > new Date()) {
            updatedEvents[latestIndex] = { ...latest, date: new Date().toISOString() };
          }
        }
        return { ...i, status: IncidentStatus.CLOSED };
      }
      return i;
    }));
    setShowCloseModal(false);
  };

  const handleReopenIncident = () => {
    if (confirm('¿Deseas reabrir esta incidencia? El estado cambiará a "Abierta".')) {
      setIncidents(prev => prev.map(i => i.id === incident.id ? { ...i, status: IncidentStatus.OPEN } : i));
    }
  };

  const openEditModal = (ev: IncidentEvent) => {
    setEditingEventId(ev.id);
    setNewEvent({
      title: ev.title,
      description: ev.description,
      type: ev.type,
      agreements: ev.agreements || '',
      customDate: ev.date.split('T')[0]
    });
    setShowEventModal(true);
  };

  const handleAddOrEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      title: newEvent.title,
      description: newEvent.description || 'Sin descripción detallada.',
      type: newEvent.type,
      agreements: newEvent.agreements,
      date: newEvent.customDate ? new Date(newEvent.customDate).toISOString() : new Date().toISOString(),
    };

    if (editingEventId) {
      setIncidents(prev => prev.map(i => {
        if (i.id === incident.id) {
          return {
            ...i,
            events: i.events.map(ev => ev.id === editingEventId ? { ...ev, ...eventData } : ev)
          };
        }
        return i;
      }));
    } else {
      const event: IncidentEvent = {
        id: Math.random().toString(36).substr(2, 9),
        ...eventData,
        authorId: user?.id || '',
        authorName: user?.name || ''
      };
      setIncidents(prev => prev.map(i => i.id === incident.id ? { ...i, events: [...i.events, event] } : i));
    }
    
    setShowEventModal(false);
    setEditingEventId(null);
    setNewEvent({ title: '', description: '', type: EventType.OBSERVATION, agreements: '', customDate: '' });
  };

  const handleDerive = (targetUserId: string) => {
    if (incident.assignedToIds.includes(targetUserId)) return;
    setIncidents(prev => prev.map(i => i.id === incident.id ? { ...i, assignedToIds: [...i.assignedToIds, targetUserId] } : i));
    setShowDeriveModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${incident.status === IncidentStatus.OPEN ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {incident.status === IncidentStatus.OPEN ? 'Abierta' : 'Cerrada'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">{incident.type}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{incident.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-graduation-cap text-slate-400"></i>
              <span>{student?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-calendar text-slate-400"></i>
              <span>Plazo: {incident.deadline ? new Date(incident.deadline).toLocaleDateString() : 'Sin plazo'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {incident.status === IncidentStatus.OPEN ? (
            <button 
              onClick={() => setShowCloseModal(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar Incidencia
            </button>
          ) : (
            <button 
              onClick={handleReopenIncident}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reabrir Incidencia
            </button>
          )}
          <button 
            onClick={() => setShowDeriveModal(true)}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Derivar / Invitar Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Línea de Tiempo</h3>
            {incident.status === IncidentStatus.OPEN && (
              <button 
                onClick={() => { setEditingEventId(null); setShowEventModal(true); }}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1"
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span>Añadir Evento</span>
              </button>
            )}
          </div>

          <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {incident.events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ev => (
              <div key={ev.id} className="relative pl-10 group">
                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xs shadow-sm z-10 ${
                  ev.type === EventType.MEETING ? 'bg-indigo-500 text-white' : 
                  ev.type === EventType.OBSERVATION ? 'bg-blue-400 text-white' : 'bg-slate-400 text-white'
                }`}>
                  <i className={`fa-solid ${ev.type === EventType.MEETING ? 'fa-users' : 'fa-eye'}`}></i>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{ev.title}</h4>
                    <div className="flex items-center space-x-2">
                       {incident.status === IncidentStatus.OPEN && (
                         <button onClick={() => openEditModal(ev)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors">
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                         </button>
                       )}
                       <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(ev.date).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{ev.description}</p>
                  
                  {ev.agreements && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-3">
                      <p className="font-bold text-slate-500 uppercase mb-1">Acuerdos:</p>
                      <p className="text-slate-700">{ev.agreements}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold">
                        {ev.authorName.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-500">Por {ev.authorName}</span>
                    </div>
                    {ev.type === EventType.MEETING && (
                      <button className="text-xs text-blue-600 hover:underline font-medium flex items-center space-x-1">
                        <i className="fa-solid fa-file-pdf"></i>
                        <span>Descargar Acta</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <i className="fa-solid fa-user-group text-slate-400"></i>
              <span>Equipo Interventor</span>
            </h4>
            <div className="space-y-3">
              {incident.assignedToIds.map(uid => {
                const u = users.find(x => x.id === uid);
                return (
                  <div key={uid} className="flex items-center space-x-3">
                    <img src={u?.avatar} className="w-8 h-8 rounded-full border shadow-sm" alt={u?.name} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u?.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{u?.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Close Incident */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center">
            <div className={`w-16 h-16 ${canClose ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
              <i className={`fa-solid ${canClose ? 'fa-check-double' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {canClose ? '¿Cerrar incidencia?' : 'No se puede cerrar'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {canClose 
                ? 'Esta acción marcará el caso como resuelto. Si el último evento estaba planificado para el futuro, se actualizará a la fecha de hoy.'
                : 'Se requieren al menos 2 eventos (inicio y fin) para cerrar una incidencia regular. Por favor, registra un evento de resolución o seguimiento.'}
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                {canClose ? 'Cancelar' : 'Volver'}
              </button>
              {canClose && (
                <button 
                  onClick={handleCloseIncident}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Confirmar Cierre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Añadir/Editar Evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingEventId ? 'Editar Actividad' : 'Registrar Actividad'}</h2>
            <form onSubmit={handleAddOrEditEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Evento</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                  >
                    <option value={EventType.OBSERVATION}>Observación</option>
                    <option value={EventType.MEETING}>Reunión con Padres</option>
                    <option value={EventType.CALL}>Llamada Telefónica</option>
                    <option value={EventType.FOLLOW_UP}>Seguimiento</option>
                    <option value={EventType.RESOLUTION}>Resolución</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha (Opcional)</label>
                  <input 
                    type="date"
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEvent.customDate}
                    onChange={e => setNewEvent({ ...newEvent, customDate: e.target.value })}
                  />
                  <p className="text-[9px] text-slate-400 mt-1 italic">Vacio = Fecha actual</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  placeholder="Ej. Entrevista Presencial"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                  placeholder="Describe lo ocurrido..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                ></textarea>
              </div>
              {newEvent.type === EventType.MEETING && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Acuerdos alcanzados</label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Escribe los compromisos de los padres..."
                    value={newEvent.agreements}
                    onChange={e => setNewEvent({ ...newEvent, agreements: e.target.value })}
                  ></textarea>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md"
                >
                  {editingEventId ? 'Actualizar Actividad' : 'Registrar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Derivar */}
      {showDeriveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Derivar Incidencia</h2>
            <p className="text-sm text-slate-500 mb-6">Selecciona a quién quieres invitar a participar en este caso.</p>
            <div className="space-y-2">
              {users.filter(u => !incident.assignedToIds.includes(u.id)).map(u => (
                <button 
                  key={u.id}
                  onClick={() => handleDerive(u.id)}
                  className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors text-left border border-slate-100"
                >
                  <img src={u.avatar} className="w-10 h-10 rounded-full mr-3" alt={u.name} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowDeriveModal(false)}
              className="mt-6 w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetail;
