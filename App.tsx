
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Incident, Student, Grade, Course } from './types';
import { MOCK_USERS, MOCK_INCIDENTS, MOCK_STUDENTS, MOCK_GRADES, MOCK_COURSES } from './mockData';
import Dashboard from './pages/Dashboard';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import CalendarView from './pages/CalendarView';
import NewIncident from './pages/NewIncident';
import MasterData from './pages/MasterData';

// Context for user and global data
export const AppContext = React.createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
} | null>(null);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context?.user) return <Navigate to="/login" />;

  const handleLogout = () => {
    context.setUser(null);
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (path: string) => 
    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive(path) 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">EduControl</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className={navItemClass('/')}>
            <i className="fa-solid fa-chart-line w-5 text-center"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/incidents" className={navItemClass('/incidents')}>
            <i className="fa-solid fa-folder-open w-5 text-center"></i>
            <span>Incidencias</span>
          </Link>
          <Link to="/calendar" className={navItemClass('/calendar')}>
            <i className="fa-solid fa-calendar-days w-5 text-center"></i>
            <span>Calendario</span>
          </Link>
          {context.user.role === UserRole.ADMIN && (
            <Link to="/masters" className={navItemClass('/masters')}>
              <i className="fa-solid fa-database w-5 text-center"></i>
              <span>Maestros</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex flex-col mb-4 px-2">
            <p className="text-sm font-semibold truncate">{context.user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{context.user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 flex items-center space-x-2 px-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-widest text-xs">Gestión Escolar</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/incidents/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-shadow hover:shadow-lg">
              <i className="fa-solid fa-plus"></i>
              <span>Nueva Incidencia</span>
            </Link>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const Login: React.FC = () => {
  const context = React.useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (u: User) => {
    context?.setUser(u);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">EduControl</h1>
          <p className="text-slate-500 mt-2">Selecciona un usuario para entrar (Simulación)</p>
        </div>
        <div className="space-y-4">
          {MOCK_USERS.map(u => (
            <button
              key={u.id}
              onClick={() => handleLogin(u)}
              className="w-full flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <img src={u.avatar} className="w-12 h-12 rounded-full mr-4" alt={u.name} />
              <div>
                <p className="font-semibold text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-500">{u.role}</p>
              </div>
              <i className="fa-solid fa-chevron-right ml-auto text-slate-300"></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  const value = useMemo(() => ({
    user,
    setUser,
    incidents,
    setIncidents,
    students,
    setStudents,
    grades,
    setGrades,
    courses,
    setCourses,
    users,
    setUsers
  }), [user, incidents, students, grades, courses, users]);

  return (
    <AppContext.Provider value={value}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/incidents" element={<Layout><IncidentList /></Layout>} />
          <Route path="/incidents/new" element={<Layout><NewIncident /></Layout>} />
          <Route path="/incidents/:id" element={<Layout><IncidentDetail /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarView /></Layout>} />
          <Route path="/masters" element={<Layout><MasterData /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
