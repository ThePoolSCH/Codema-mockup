
import { User, Student, Incident, UserRole, IncidentStatus, IncidentPriority, EventType, Grade, Course } from './types';

export const MOCK_GRADES: Grade[] = [
  { id: 'g1', name: '3ro Primaria' },
  { id: 'g2', name: '5to Primaria' },
  { id: 'g3', name: '1ro Secundaria' },
  { id: 'g4', name: '2do Secundaria' },
];

export const MOCK_COURSES: Course[] = [
  { id: 'c1', name: 'Matemáticas', gradeId: 'g2' },
  { id: 'c2', name: 'Lenguaje', gradeId: 'g2' },
  { id: 'c3', name: 'Historia', gradeId: 'g3' },
  { id: 'c4', name: 'Ciencias', gradeId: 'g1' },
  { id: 'c5', name: 'Geometría', gradeId: 'g2' },
  { id: 'c6', name: 'Arte', gradeId: 'g1' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin Principal', role: UserRole.ADMIN, email: 'admin@educontrol.com', avatar: 'https://picsum.photos/seed/admin/100' },
  { id: 'u2', name: 'Ana Garcia (Prof)', role: UserRole.TEACHER, email: 'ana.garcia@educontrol.com', avatar: 'https://picsum.photos/seed/ana/100', gradeIds: ['g1', 'g2'], courseIds: ['c1', 'c2', 'c4'], tutorGradeIds: ['g2'] },
  { id: 'u3', name: 'Carlos Ruiz (Psi)', role: UserRole.PSYCHOLOGIST, email: 'carlos.ruiz@educontrol.com', avatar: 'https://picsum.photos/seed/carlos/100' },
  { id: 'u4', name: 'Beatriz Mendez (Staff)', role: UserRole.STAFF, email: 'beatriz.mendez@educontrol.com', avatar: 'https://picsum.photos/seed/beatriz/100' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Juanito Perez', gradeId: 'g1', courseIds: ['c4', 'c6'], parentContact: 'juan.perez.p@email.com' },
  { id: 's2', name: 'Sofia Rodriguez', gradeId: 'g2', courseIds: ['c1', 'c2', 'c5'], parentContact: 'marta.rod@email.com' },
  { id: 's3', name: 'Lucas Silva', gradeId: 'g4', courseIds: [], parentContact: 'silva.fam@email.com' },
  { id: 's4', name: 'Valentina Torres', gradeId: 'g3', courseIds: ['c3'], parentContact: 'torres.v@email.com' },
  { id: 's5', name: 'Mateo Lopez', gradeId: 'g2', courseIds: ['c1'], parentContact: 'lopez.m@email.com' },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Comportamiento Anómalo - Sofia',
    type: 'Problemas Escolares',
    priority: IncidentPriority.MEDIUM,
    status: IncidentStatus.OPEN,
    studentId: 's2',
    reporterId: 'u2',
    assignedToIds: ['u2', 'u3'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 25).toISOString(),
    events: [
      {
        id: 'ev-1',
        type: EventType.OBSERVATION,
        title: 'Detección inicial',
        description: 'Se observa a la niña retraída y sin participar en clase, algo inusual en ella.',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia'
      },
      {
        id: 'ev-1-2',
        type: EventType.CALL,
        title: 'Llamada a la madre',
        description: 'Se conversó con la Sra. Marta. Indica que ha habido cambios en casa recientemente.',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia'
      },
      {
        id: 'ev-1-3',
        type: EventType.MEETING,
        title: 'Reunión presencial con Psicología',
        description: 'Sesión de exploración con la alumna para determinar nivel de afectación emocional.',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        authorId: 'u3',
        authorName: 'Carlos Ruiz',
        agreements: 'Se recomienda seguimiento semanal por 1 mes.'
      }
    ]
  },
  {
    id: 'inc-2',
    title: 'Posible Bullying - Lucas',
    type: 'Bullying',
    priority: IncidentPriority.HIGH,
    status: IncidentStatus.OPEN,
    studentId: 's3',
    reporterId: 'u2',
    assignedToIds: ['u2', 'u3', 'u4'],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    events: [
      {
        id: 'ev-2',
        type: EventType.MEETING,
        title: 'Reunión con padre de Lucas',
        description: 'El padre informa que Lucas no quiere venir al colegio por comentarios de compañeros del 2do bloque.',
        date: new Date(Date.now() - 86400000 * 9).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia',
        agreements: 'Se investigará con los compañeros del curso y se reforzará la vigilancia en recreos.',
        reportGenerated: true
      },
      {
        id: 'ev-2-2',
        type: EventType.OBSERVATION,
        title: 'Seguimiento en Recreo',
        description: 'Se observa interacción tensa entre Lucas y alumnos de 5to grado.',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        authorId: 'u4',
        authorName: 'Beatriz Mendez'
      },
      {
        id: 'ev-2-3',
        type: EventType.MEETING,
        title: 'Reunión de Confrontación (Mediación)',
        description: 'Reunión con los involucrados para establecer límites y disculpas formales.',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        authorId: 'u3',
        authorName: 'Carlos Ruiz',
        agreements: 'Compromiso de respeto mutuo firmado por alumnos.'
      }
    ]
  },
  {
    id: 'inc-3',
    title: 'Bajo Rendimiento Matemáticas - Mateo',
    type: 'Rendimiento Académico',
    priority: IncidentPriority.LOW,
    status: IncidentStatus.CLOSED,
    studentId: 's5',
    reporterId: 'u2',
    assignedToIds: ['u2'],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    events: [
      {
        id: 'ev-3-1',
        type: EventType.OBSERVATION,
        title: 'Alerta de Notas',
        description: 'El alumno reprobó las últimas 3 prácticas de Geometría.',
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia'
      },
      {
        id: 'ev-3-2',
        type: EventType.MEETING,
        title: 'Reunión Plan de Refuerzo',
        description: 'Se establece horario de asesorías extras los martes.',
        date: new Date(Date.now() - 86400000 * 25).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia',
        agreements: 'Asistencia obligatoria a tutorías.'
      },
      {
        id: 'ev-3-3',
        type: EventType.RESOLUTION,
        title: 'Cierre por Mejora Académica',
        description: 'Mateo aprobó el examen bimestral con nota destacada. Se cierra el seguimiento.',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        authorId: 'u2',
        authorName: 'Ana Garcia'
      }
    ]
  },
  {
    id: 'inc-4',
    title: 'Faltas Injustificadas - Valentina',
    type: 'Problemas Escolares',
    priority: IncidentPriority.MEDIUM,
    status: IncidentStatus.CLOSED,
    studentId: 's4',
    reporterId: 'u4',
    assignedToIds: ['u4', 'u2'],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    isSimple: true,
    events: [
      {
        id: 'ev-4-1',
        type: EventType.OBSERVATION,
        title: 'Registro de Inasistencia',
        description: 'Valentina ha faltado 4 días seguidos sin aviso de los padres.',
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        authorId: 'u4',
        authorName: 'Beatriz Mendez'
      },
      {
        id: 'ev-4-2',
        type: EventType.RESOLUTION,
        title: 'Justificación Presentada',
        description: 'Los padres presentan certificado médico por cuadro viral. Caso cerrado.',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        authorId: 'u4',
        authorName: 'Beatriz Mendez'
      }
    ]
  },
  {
    id: 'inc-5',
    title: 'Agresión Física en Patio - Juanito',
    type: 'Problemas Escolares',
    priority: IncidentPriority.URGENT,
    status: IncidentStatus.OPEN,
    studentId: 's1',
    reporterId: 'u4',
    assignedToIds: ['u4', 'u3', 'u1'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    events: [
      {
        id: 'ev-5-1',
        type: EventType.OBSERVATION,
        title: 'Incidente de violencia',
        description: 'Juanito golpeó a un compañero de 4to grado tras una disputa por un balón.',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        authorId: 'u4',
        authorName: 'Beatriz Mendez'
      },
      {
        id: 'ev-5-2',
        type: EventType.FOLLOW_UP,
        title: 'Entrevista con Coordinación',
        description: 'Se citó a Juanito a la dirección para descargo inicial.',
        date: new Date(Date.now() - 1800000).toISOString(),
        authorId: 'u1',
        authorName: 'Admin Principal'
      }
    ]
  }
];
