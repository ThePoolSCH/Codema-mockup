
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Link } from 'react-router-dom';

const CalendarView: React.FC = () => {
  const context = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!context) return null;
  const { incidents, user } = context;

  // Flatten events and only show accessible ones
  const allEvents = incidents
    .filter(inc => user?.role === 'ADMIN' || inc.reporterId === user?.id || inc.assignedToIds.includes(user?.id || ''))
    .flatMap(inc => inc.events.map(ev => ({ ...ev, incidentId: inc.id })));

  // Group events by date for a simple list view
  const eventsByDate = allEvents.reduce((acc, ev) => {
    const dateStr = new Date(ev.date).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(ev);
    return acc;
  }, {} as Record<string, typeof allEvents>);

  // Generate calendar days (simplified)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const monthName = currentDate.toLocaleString('es', { month: 'long' });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendario de Seguimiento</h1>
          <p className="text-slate-500">Reuniones, observaciones y plazos agendados.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200">
           <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-slate-50 rounded"
           >
            <i className="fa-solid fa-chevron-left text-slate-400"></i>
           </button>
           <span className="px-4 font-bold text-slate-700 capitalize w-40 text-center">{monthName} {currentDate.getFullYear()}</span>
           <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-slate-50 rounded"
           >
            <i className="fa-solid fa-chevron-right text-slate-400"></i>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List View / Agenda (Now on the LEFT) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
           <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
                <span>Agenda Próxima</span>
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(Object.entries(eventsByDate) as [string, typeof allEvents][])
                .filter(([dateStr]) => new Date(dateStr) >= new Date(new Date().setHours(0,0,0,0)))
                .sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([dateStr, events]) => (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</p>
                  </div>
                  <div className="space-y-3 pl-3">
                    {events.map(ev => (
                      <Link key={ev.id} to={`/incidents/${ev.incidentId}`} className="block bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors">
                        <p className="text-sm font-bold text-slate-800">{ev.title}</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">{ev.type}</p>
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-200/50">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[8px] flex items-center justify-center font-bold">
                            {ev.authorName.charAt(0)}
                          </div>
                          <span className="text-[10px] text-slate-400">Por {ev.authorName}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {allEvents.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <i className="fa-solid fa-calendar-xmark block text-3xl mb-2"></i>
                  <p className="text-sm">No hay eventos próximos.</p>
                </div>
              )}
           </div>
        </div>

        {/* Monthly Grid (Now on the RIGHT) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="p-4 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
              const hasEvents = dayDate ? eventsByDate[dayDate.toDateString()] : null;
              const isToday = dayDate?.toDateString() === new Date().toDateString();

              return (
                <div key={idx} className={`h-24 p-2 border-r border-b border-slate-50 last:border-r-0 relative ${day ? 'hover:bg-slate-50' : 'bg-slate-50/30'}`}>
                  {day && (
                    <>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isToday ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'text-slate-400'
                        }`}>
                          {day}
                        </span>
                        {isToday && <span className="text-[8px] font-bold text-blue-600 uppercase">Hoy</span>}
                      </div>
                      {hasEvents && (
                        <div className="mt-1 space-y-1">
                          {hasEvents.slice(0, 2).map(ev => (
                            <div key={ev.id} className="text-[9px] bg-blue-100 text-blue-700 p-1 rounded truncate font-medium">
                              {ev.title}
                            </div>
                          ))}
                          {hasEvents.length > 2 && <div className="text-[8px] text-slate-400 font-bold px-1">+{hasEvents.length - 2} más</div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
