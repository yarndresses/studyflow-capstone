import { FormEvent, useMemo, useState } from 'react';

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  completed: boolean;
};

type StudyPlanItem = {
  id: number;
  day: string;
  task: string;
};

type StudySession = {
  id: number;
  date: string;
  duration: number;
};

type User = {
  name: string;
  email: string;
};

const initialAssignments: Assignment[] = [
  { id: 1, title: 'Database Design Report', course: 'CS410', dueDate: '2026-08-12', completed: false },
  { id: 2, title: 'Algorithms Homework', course: 'CS320', dueDate: '2026-08-10', completed: false },
  { id: 3, title: 'Reading Reflection', course: 'ENG210', dueDate: '2026-08-15', completed: true },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState<string[]>(['CS410', 'CS320', 'ENG210']);
  const [courseInput, setCourseInput] = useState('');
  const [assignments, setAssignments] = useState(initialAssignments);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS410');
  const [dueDate, setDueDate] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('All');
  const [studyDay, setStudyDay] = useState('Monday');
  const [studyTask, setStudyTask] = useState('');
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [studySessionDate, setStudySessionDate] = useState('');
  const [studyDuration, setStudyDuration] = useState('');
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [profileName, setProfileName] = useState('Student');

  const courseOptions = useMemo(() => ['All', ...courses], [courses]);

  const filteredAssignments = useMemo(() => {
    const base = assignments.filter((assignment) => {
      const matchesCourse = filterCourse === 'All' || assignment.course === filterCourse;
      const today = new Date();
      const due = new Date(assignment.dueDate);
      const matchesDueDate =
        filterDueDate === 'All' ||
        (filterDueDate === 'Overdue' && due < today) ||
        (filterDueDate === 'Upcoming' && due >= today);
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCourse && matchesDueDate && matchesSearch;
    });

    if (sortOption === 'due-date') {
      return [...base].sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime());
    }

    return base;
  }, [assignments, filterCourse, filterDueDate, searchTerm, sortOption]);

  const handleAuth = (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password || (authMode === 'signup' && !name)) return;

    setUser({
      name: authMode === 'signup' ? name : 'Student',
      email,
    });
    setIsAuthenticated(true);
  };

  const addCourse = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = courseInput.trim().toUpperCase();
    if (!trimmed) return;

    setCourses((current) => (current.includes(trimmed) ? current : [...current, trimmed]));
    setCourse(trimmed);
    setCourseInput('');
  };

  const addAssignment = (event: FormEvent) => {
    event.preventDefault();
    if (!title || !course || !dueDate) return;

    const newAssignment: Assignment = {
      id: Date.now(),
      title,
      course,
      dueDate,
      completed: false,
    };

    setAssignments((current) => [newAssignment, ...current]);
    setTitle('');
    setCourse(courses[0] ?? '');
    setDueDate('');
  };

  const toggleComplete = (id: number) => {
    setAssignments((current) => current.map((assignment) => (assignment.id === id ? { ...assignment, completed: !assignment.completed } : assignment)));
  };

  const deleteAssignment = (id: number) => {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    setUser((current) => (current ? { ...current, name: profileName } : current));
  };

  const addStudyPlanItem = (event: FormEvent) => {
    event.preventDefault();
    if (!studyTask) return;

    setStudyPlan((current) => [...current, { id: Date.now(), day: studyDay, task: studyTask }]);
    setStudyTask('');
  };

  const logStudySession = (event: FormEvent) => {
    event.preventDefault();
    if (!studySessionDate || !studyDuration) return;

    setStudySessions((current) => [...current, { id: Date.now(), date: studySessionDate, duration: Number(studyDuration) }]);
    setStudySessionDate('');
    setStudyDuration('');
  };

  const completedCount = useMemo(() => assignments.filter((assignment) => assignment.completed).length, [assignments]);
  const totalAssignments = assignments.length;

  const streak = useMemo(() => {
    if (studySessions.length === 0) return 0;

    const uniqueDates = Array.from(new Set(studySessions.map((session) => session.date))).sort();
    let currentStreak = 1;
    for (let index = 1; index < uniqueDates.length; index += 1) {
      const previous = new Date(uniqueDates[index - 1]);
      const current = new Date(uniqueDates[index]);
      const diffDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [studySessions]);

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <div className="card auth-card">
          <h1>StudyFlow</h1>
          <p>Organise your study plan, manage deadlines, and track progress.</p>
          <div className="auth-toggle">
            <button type="button" className={authMode === 'login' ? 'active' : 'secondary'} onClick={() => setAuthMode('login')}>
              Login tab
            </button>
            <button type="button" className={authMode === 'signup' ? 'active' : 'secondary'} onClick={() => setAuthMode('signup')}>
              Signup tab
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {authMode === 'signup' && (
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
            </label>
            <button type="submit">{authMode === 'login' ? 'Log in' : 'Create account'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header>
        <h1>StudyFlow</h1>
        <p>Welcome back, {user?.name ?? profileName}.</p>
      </header>

      <section className="card">
        <h2>Dashboard</h2>
        <div className="summary-grid">
          <div className="summary-box">
            <strong>Total assignments</strong>
            <p>{totalAssignments}</p>
          </div>
          <div className="summary-box">
            <strong>Completed assignments</strong>
            <p>{completedCount}</p>
          </div>
          <div className="summary-box">
            <strong>Study streak</strong>
            <p>{streak} day(s)</p>
          </div>
          <div className="summary-box">
            <strong>Study time logged</strong>
            <p>{studySessions.reduce((total, session) => total + session.duration, 0)} minutes</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Add a course</h2>
        <form onSubmit={addCourse} className="stack">
          <label>
            Course name
            <input value={courseInput} onChange={(event) => setCourseInput(event.target.value)} placeholder="CS410" />
          </label>
          <button type="submit">Add course</button>
        </form>
        <div className="pill-list">
          {courses.map((courseName) => (
            <span key={courseName} className="pill">
              {courseName}
            </span>
          ))}
        </div>
      </section>

      <form onSubmit={addAssignment} className="card form-card">
        <h2>Add Assignment</h2>
        <label htmlFor="assignment-title">
          Assignment title
          <input id="assignment-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Assignment title" />
        </label>
        <label htmlFor="assignment-course">
          Assignment course
          <select id="assignment-course" value={course} onChange={(event) => setCourse(event.target.value)}>
            {courses.map((courseName) => (
              <option key={courseName} value={courseName}>
                {courseName}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="assignment-due-date">
          Assignment due date
          <input id="assignment-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <button type="submit">Add Assignment</button>
      </form>

      <section className="card">
        <h2>Study Plan</h2>
        <form onSubmit={addStudyPlanItem} className="stack">
          <label htmlFor="study-day">
            Study day
            <select id="study-day" value={studyDay} onChange={(event) => setStudyDay(event.target.value)}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="study-plan-task">
            Study plan task
            <input id="study-plan-task" value={studyTask} onChange={(event) => setStudyTask(event.target.value)} placeholder="Review algorithms" />
          </label>
          <button type="submit">Add study plan</button>
        </form>
        <ul className="assignment-list">
          {studyPlan.map((item) => (
            <li key={item.id} className="assignment-item">
              <strong>{item.day}</strong>
              <span>{item.task}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Study Sessions</h2>
        <form onSubmit={logStudySession} className="stack">
          <label htmlFor="study-date">
            Study date
            <input id="study-date" type="date" value={studySessionDate} onChange={(event) => setStudySessionDate(event.target.value)} />
          </label>
          <label htmlFor="study-duration">
            Study duration
            <input id="study-duration" type="number" min="1" value={studyDuration} onChange={(event) => setStudyDuration(event.target.value)} placeholder="45" />
          </label>
          <button type="submit">Log study session</button>
        </form>
        <div className="summary-box">
          <p>Study streak: {streak} day(s)</p>
          {studySessions.map((session) => (
            <p key={session.id}>{session.duration} minutes</p>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Profile</h2>
        <form onSubmit={saveProfile} className="stack">
          <label htmlFor="profile-name">
            Profile name
            <input id="profile-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} />
          </label>
          <button type="submit">Save profile</button>
        </form>
      </section>

      <section className="card">
        <h2>Assignments</h2>
        <div className="filters">
          <label htmlFor="search-tasks">
            Search tasks
            <input id="search-tasks" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tasks" />
          </label>
          <label htmlFor="sort-tasks">
            Sort tasks
            <select id="sort-tasks" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
              <option value="default">Default</option>
              <option value="due-date">Due date</option>
            </select>
          </label>
          <label htmlFor="filter-course">
            Filter course
            <select id="filter-course" value={filterCourse} onChange={(event) => setFilterCourse(event.target.value)}>
              {courseOptions.map((courseOption) => (
                <option key={courseOption} value={courseOption}>
                  {courseOption}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="filter-due-date">
            Filter due date
            <select id="filter-due-date" value={filterDueDate} onChange={(event) => setFilterDueDate(event.target.value)}>
              <option value="All">All</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </label>
        </div>

        <ul className="assignment-list">
          {filteredAssignments.map((assignment) => (
            <li key={assignment.id} className={`assignment-item ${assignment.completed ? 'completed' : ''}`}>
              <div>
                <strong>{assignment.title}</strong>
                <p>
                  {assignment.course} • Due {assignment.dueDate}
                </p>
              </div>
              <div className="actions">
                <button type="button" onClick={() => toggleComplete(assignment.id)}>
                  {assignment.completed ? 'Undo' : 'Complete'}
                </button>
                <button type="button" className="secondary" onClick={() => deleteAssignment(assignment.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
