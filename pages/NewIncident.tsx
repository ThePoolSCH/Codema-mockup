
import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { IncidentStatus, IncidentPriority, EventType, Incident } from '../types';
import { MOCK_USERS } from '../mockData';

const NewIncident: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [showStudentList, setShowStudentList] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Comportamiento',
    priority: IncidentPriority.MEDIUM,
    studentId: '',
    description: '',
    isSimple: false,
    assignedToIds: [] as string[]
  });

  if (!context) return null;
  const { user, students, setIncidents } = context;

  // Extract unique grades
  const availableGrades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade)));
  }, [students]);

  // Filter students by grade and search text
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesGrade = gradeFilter === '' || s.grade === gradeFilter;
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [students, gradeFilter, studentSearch]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === formData.studentId);
  }, [students, formData.studentId]);

  const toggleAssigned = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedToIds: prev.assignedToIds.includes(userId)
        ? prev.assignedToIds.filter(id => id !== userId)
        : [...prev.assignedToIds, userId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure the reporter is always assigned
    const finalAssignments = Array.from(new Set([...formData.assignedToIds, user?.id || '']));

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      status: formData.isSimple ? IncidentStatus.CLOSED : IncidentStatus.OPEN,
      studentId: formData.studentId,
      reporterId: user?.id || '',
      assignedToIds: finalAssignments,
      createdAt: new Date().toISOString(),
      isSimple: formData.isSimple,
      events: [
        {
          id: `ev-${Date.now()}`,
          type: EventType.OBSERVATION,
          title: 'Registro Inicial',
          description: formData.description || 'Sin descripción adicional.',
          date: new Date().toISOString(),
          authorId: user?.id || '',
          authorName: user?.name || ''
        }
      ]
    };

    setIncidents(prev => [...prev, newIncident]);
    navigate('/incidents');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Nueva Incidencia</h1>
        <p className="text-slate-500">Registra un nuevo caso para seguimiento escolar.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título de la Incidencia</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                required
                placeholder="Ej. Comportamiento disruptivo en patio"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Student Search & Filter */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Filtrar por Grado</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                >
                  <option value="">Todos los grados</option>
                  {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Buscar Alumno</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    placeholder={selectedStudent ? selectedStudent.name : "Escribe nombre del alumno..."}
                    value={studentSearch}
                    onChange={e => {
                      setStudentSearch(e.target.value);
                      setShowStudentList(true);
                    }}
                    onFocus={() => setShowStudentList(true)}
                  />
                  {showStudentList && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                            onClick={() => {
                              setFormData({ ...formData, studentId: s.id });
                              setStudentSearch('');
                              setShowStudentList(false);
                            }}
                          >
                            <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{s.grade}</p>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-sm">No se encontraron alumnos</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedStudent && (
                  <div className="mt-2 flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit text-xs font-bold">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Seleccionado: {selectedStudent.name}</span>
                  </div>
                )}
                {!selectedStudent && <p className="text-[10px] text-red-500 mt-1">* Selección obligatoria</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo / Motivo</label>
              <select 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Rendimiento Académico">Rendimiento Académico</option>
                <option value="Problemas Escolares">Problemas Escolares</option>
                <option value="Bullying">Bullying</option>
                <option value="Salud / Bienestar">Salud / Bienestar</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
              <select 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                required
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as IncidentPriority })}
              >
                <option value={IncidentPriority.LOW}>Baja</option>
                <option value={IncidentPriority.MEDIUM}>Media</option>
                <option value={IncidentPriority.HIGH}>Alta</option>
                <option value={IncidentPriority.URGENT}>Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción Inicial (Opcional)</label>
            <textarea 
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 h-32"
              placeholder="Relata el evento u observación inicial..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </div>

        {/* Derivation Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Equipo Interventor (Derivación)</h3>
          <p className="text-xs text-slate-500 mb-4">Selecciona otros profesionales que deban participar en este caso desde su creación.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_USERS.filter(u => u.id !== user?.id).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleAssigned(u.id)}
                className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${
                  formData.assignedToIds.includes(u.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <img src={u.avatar} className="w-8 h-8 rounded-full mr-3 border" alt={u.name} />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">{u.role}</p>
                </div>
                {formData.assignedToIds.includes(u.id) && (
                   <i className="fa-solid fa-check-circle text-blue-500 ml-auto"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6">
           <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white border border-slate-100 rounded-2xl flex-1 shadow-sm">
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded text-blue-600 focus:ring-blue-500" 
                checked={formData.isSimple}
                onChange={e => setFormData({ ...formData, isSimple: e.target.checked })}
              />
              <div>
                <p className="text-sm font-bold text-slate-800">¿Es una incidencia simple?</p>
                <p className="text-xs text-slate-500">Se marcará como resuelta automáticamente al crearla.</p>
              </div>
            </label>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button 
            type="button" 
            onClick={() => navigate('/incidents')}
            className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={!formData.studentId}
            className={`px-10 py-3 text-white font-bold rounded-xl transition-all shadow-md ${
              formData.studentId ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Registrar Caso
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewIncident;
