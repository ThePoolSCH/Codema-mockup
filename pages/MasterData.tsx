
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { UserRole, Grade, Course, Student, User } from '../types';

// Moved Modal component outside MasterData and added React.FC typing to correctly handle nested JSX children and solve TS errors
const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <div 
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    onClick={(e) => {
      // Close on backdrop click
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const MasterData: React.FC = () => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'GRADES' | 'COURSES' | 'STUDENTS' | 'TEACHERS'>('GRADES');
  
  // Modal states
  const [showModal, setShowModal] = useState<string | null>(null);

  // Form states
  const [newGrade, setNewGrade] = useState({ name: '' });
  const [newCourse, setNewCourse] = useState({ name: '', gradeId: '' });
  const [newStudent, setNewStudent] = useState({ name: '', gradeId: '', courseIds: [] as string[], contact: '' });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', courseIds: [] as string[], tutorGradeIds: [] as string[] });

  if (!context) return null;
  const { grades, setGrades, courses, setCourses, students, setStudents, users, setUsers } = context;

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Grade = { id: `g-${Date.now()}`, name: newGrade.name };
    setGrades([...grades, g]);
    setShowModal(null);
    setNewGrade({ name: '' });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const c: Course = { id: `c-${Date.now()}`, name: newCourse.name, gradeId: newCourse.gradeId };
    setCourses([...courses, c]);
    setShowModal(null);
    setNewCourse({ name: '', gradeId: '' });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const s: Student = {
      id: `s-${Date.now()}`,
      name: newStudent.name,
      gradeId: newStudent.gradeId,
      courseIds: newStudent.courseIds,
      parentContact: newStudent.contact
    };
    setStudents([...students, s]);
    setShowModal(null);
    setNewStudent({ name: '', gradeId: '', courseIds: [], contact: '' });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const t: User = {
      id: `u-${Date.now()}`,
      name: newTeacher.name,
      email: newTeacher.email,
      role: UserRole.TEACHER,
      avatar: `https://picsum.photos/seed/${Date.now()}/100`,
      courseIds: newTeacher.courseIds,
      tutorGradeIds: newTeacher.tutorGradeIds,
      // Infer grades taught from courses
      gradeIds: Array.from(new Set(newTeacher.courseIds.map(cid => courses.find(c => c.id === cid)?.gradeId || '')))
    };
    setUsers([...users, t]);
    setShowModal(null);
    setNewTeacher({ name: '', email: '', courseIds: [], tutorGradeIds: [] });
  };

  const toggleAllCoursesForGrade = (gradeId: string) => {
    const gradeCourses = courses.filter(c => c.gradeId === gradeId).map(c => c.id);
    const allSelected = gradeCourses.every(cid => newStudent.courseIds.includes(cid));
    
    if (allSelected) {
      setNewStudent(prev => ({ ...prev, courseIds: prev.courseIds.filter(cid => !gradeCourses.includes(cid)) }));
    } else {
      setNewStudent(prev => ({ ...prev, courseIds: Array.from(new Set([...prev.courseIds, ...gradeCourses])) }));
    }
  };

  const renderGrades = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Grados (Ej: 5to A)</h3>
        <button onClick={() => setShowModal('GRADE')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <i className="fa-solid fa-plus mr-2"></i>Nuevo Grado
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {grades.map(g => (
              <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{g.name}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                  <button className="text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Cursos por Grado</h3>
        <button onClick={() => setShowModal('COURSE')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <i className="fa-solid fa-plus mr-2"></i>Nuevo Curso
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Grado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{c.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{grades.find(g => g.id === c.gradeId)?.name}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                  <button className="text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Alumnos</h3>
        <button onClick={() => setShowModal('STUDENT')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <i className="fa-solid fa-plus mr-2"></i>Nuevo Alumno
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Grado</th>
              <th className="px-6 py-3">Cursos</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{s.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{grades.find(g => g.id === s.gradeId)?.name}</td>
                <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[200px]">
                  {s.courseIds.map(cid => courses.find(c => c.id === cid)?.name).join(', ')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                  <button className="text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Profesores</h3>
        <button onClick={() => setShowModal('TEACHER')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <i className="fa-solid fa-plus mr-2"></i>Nuevo Profesor
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Grados Dictados</th>
              <th className="px-6 py-3">Tutoría (Grados)</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.filter(u => u.role === UserRole.TEACHER).map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  <div className="flex items-center space-x-2">
                    <img src={u.avatar} className="w-6 h-6 rounded-full" />
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                   <span className="font-bold text-slate-400">{u.gradeIds?.map(gid => grades.find(g => g.id === gid)?.name).join(', ')}</span>
                </td>
                <td className="px-6 py-4">
                  {u.tutorGradeIds && u.tutorGradeIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {u.tutorGradeIds.map(gid => {
                        const g = grades.find(grade => grade.id === gid);
                        return (
                          <span key={gid} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold border border-indigo-200 uppercase">
                            Tutor: {g?.name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">Sin tutoría</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                  <button className="text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Datos Maestros</h1>
          <p className="text-slate-500">Configuración global de la estructura escolar.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
            <i className="fa-solid fa-file-export"></i>
            <span>Descargar Plantilla</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm">
            <i className="fa-solid fa-file-import"></i>
            <span>Carga Masiva (Excel)</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200">
        {[
          { id: 'GRADES', label: 'Grados', icon: 'fa-layer-group' },
          { id: 'COURSES', label: 'Cursos', icon: 'fa-book-open' },
          { id: 'STUDENTS', label: 'Alumnos', icon: 'fa-user-graduate' },
          { id: 'TEACHERS', label: 'Profesores', icon: 'fa-chalkboard-user' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'GRADES' && renderGrades()}
        {activeTab === 'COURSES' && renderCourses()}
        {activeTab === 'STUDENTS' && renderStudents()}
        {activeTab === 'TEACHERS' && renderTeachers()}
      </div>

      {/* MODALS */}
      {showModal === 'GRADE' && (
        <Modal title="Nuevo Grado" onClose={() => setShowModal(null)}>
          <form onSubmit={handleCreateGrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Grado</label>
              <input 
                type="text" 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej: 5to Primaria A"
                value={newGrade.name}
                onChange={e => setNewGrade({ name: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'COURSE' && (
        <Modal title="Nuevo Curso" onClose={() => setShowModal(null)}>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Curso</label>
              <input 
                type="text" 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej: Matemáticas"
                value={newCourse.name}
                onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a Grado</label>
              <select 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={newCourse.gradeId}
                onChange={e => setNewCourse({ ...newCourse, gradeId: e.target.value })}
              >
                <option value="">Seleccionar grado...</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'STUDENT' && (
        <Modal title="Nuevo Alumno" onClose={() => setShowModal(null)}>
          <form onSubmit={handleCreateStudent} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newStudent.name}
                onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
              <select 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={newStudent.gradeId}
                onChange={e => setNewStudent({ ...newStudent, gradeId: e.target.value, courseIds: [] })}
              >
                <option value="">Seleccionar grado...</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            {newStudent.gradeId && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Cursos</label>
                  <button 
                    type="button" 
                    onClick={() => toggleAllCoursesForGrade(newStudent.gradeId)}
                    className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
                  >
                    Seleccionar Todos
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {courses.filter(c => c.gradeId === newStudent.gradeId).map(c => (
                    <label key={c.id} className={`flex items-center p-2 border rounded-lg cursor-pointer text-xs transition-colors ${newStudent.courseIds.includes(c.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={newStudent.courseIds.includes(c.id)}
                        onChange={() => {
                          const ids = newStudent.courseIds.includes(c.id)
                            ? newStudent.courseIds.filter(x => x !== c.id)
                            : [...newStudent.courseIds, c.id];
                          setNewStudent({ ...newStudent, courseIds: ids });
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'TEACHER' && (
        <Modal title="Nuevo Profesor" onClose={() => setShowModal(null)}>
          <form onSubmit={handleCreateTeacher} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTeacher.name}
                onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                required 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTeacher.email}
                onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Asignar Tutoría (Grados)</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Selecciona los grados de los cuales este profesor será tutor.</p>
              <div className="grid grid-cols-2 gap-2">
                {grades.map(g => (
                  <label key={g.id} className={`flex items-center p-2 border rounded-lg cursor-pointer text-xs transition-colors ${newTeacher.tutorGradeIds.includes(g.id) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={newTeacher.tutorGradeIds.includes(g.id)}
                      onChange={() => {
                        const ids = newTeacher.tutorGradeIds.includes(g.id)
                          ? newTeacher.tutorGradeIds.filter(x => x !== g.id)
                          : [...newTeacher.tutorGradeIds, g.id];
                        setNewTeacher({ ...newTeacher, tutorGradeIds: ids });
                      }}
                    />
                    <span className={newTeacher.tutorGradeIds.includes(g.id) ? 'font-bold text-indigo-800' : ''}>{g.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Asignar Cursos Dictados</label>
              <div className="space-y-4">
                {grades.map(g => (
                  <div key={g.id} className="mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{g.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {courses.filter(c => c.gradeId === g.id).map(c => {
                        const isAssigned = newTeacher.courseIds.includes(c.id);

                        return (
                          <div key={c.id} className={`flex items-center justify-between p-2 border rounded-lg transition-colors ${isAssigned ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'}`}>
                            <label className="flex items-center cursor-pointer text-xs flex-1">
                              <input 
                                type="checkbox" 
                                className="mr-2"
                                checked={isAssigned}
                                onChange={() => {
                                  const ids = isAssigned
                                    ? newTeacher.courseIds.filter(x => x !== c.id)
                                    : [...newTeacher.courseIds, c.id];
                                  setNewTeacher({ ...newTeacher, courseIds: ids });
                                }}
                              />
                              <span className={isAssigned ? 'font-bold text-blue-800' : ''}>{c.name}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-6 sticky bottom-0 bg-white pb-2">
              <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MasterData;
