import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Assignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  completed: boolean;
};

type StudyPlanItem = {
  id: string;
  day: string;
  task: string;
};

type StudySession = {
  id: string;
  date: string;
  duration: number;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [courses, setCourses] = useState<string[]>([]);
  const [courseInput, setCourseInput] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
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
  const [formError, setFormError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session?.user.id) return;
    const userId = session.user.id;
    const [coursesRes, assignmentsRes, planRes, sessionsRes] = await Promise.all([
      supabase.from('courses').select('name').eq('user_id', userId).order('created_at'),
      supabase.from('assignments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('study_plan_items').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('study_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (coursesRes.data) {
      const names = coursesRes.data.map((r) => r.name as string);
      setCourses(names);
      if (names.length > 0) setCourse(names[0]);
    }
    if (assignmentsRes.data) {
      setAssignments(assignmentsRes.data.map((r) => ({ id: r.id as string, title: r.title as string, course: r.course as string, dueDate: r.due_date as string, completed: r.completed as boolean })));
    }
    if (planRes.data) {
      setStudyPlan(planRes.data.map((r) => ({ id: r.id as string, day: r.day as string, task: r.task as string })));
    }
    if (sessionsRes.data) {
      setStudySessions(sessionsRes.data.map((r) => ({ id: r.id as string, date: r.date as string, duration: r.duration as number })));
    }
  }, []);

  useEffect(() => {
    if (session) {
      const name = session.user.user_metadata?.name as string | undefined;
      setProfileName(name ?? 'Student');
      loadData();
    }
  }, [session, loadData]);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setFormError('');
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { name: authName } } });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
    }
  };

  const insertWithUserFallback = async (table: 'courses' | 'assignments' | 'study_plan_items' | 'study_sessions', payload: Record<string, unknown>) => {
    if (session?.user.id) {
      const withUser = { ...payload, user_id: session.user.id };
      const { data, error } = await supabase.from(table).insert(withUser).select().single();
      if (!error) return { data, error: null };
      const fallback = await supabase.from(table).insert(payload).select().single();
      return fallback;
    }
    return supabase.from(table).insert(payload).select().single();
  };

  const addCourse = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    const trimmed = courseInput.trim().toUpperCase();
    if (!trimmed || courses.includes(trimmed)) return;
    const { error } = await insertWithUserFallback('courses', { name: trimmed });
    if (error) {
      setFormError(`Couldn't add course: ${error.message}`);
      return;
    }
    setCourses((c) => [...c, trimmed]);
    setCourse(trimmed);
    setCourseInput('');
  };

  const addAssignment = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!title || !course || !dueDate) return;
    const { data, error } = await insertWithUserFallback('assignments', { title, course, due_date: dueDate, completed: false });
    if (error || !data) {
      setFormError(`Couldn't add assignment: ${error?.message ?? 'Please try again.'}`);
      return;
    }
    setAssignments((current) => [{ id: data.id as string, title: data.title as string, course: data.course as string, dueDate: data.due_date as string, completed: false }, ...current]);
    setTitle('');
    setDueDate('');
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from('assignments').update({ completed: !completed }).eq('id', id);
    setAssignments((current) => current.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)));
  };

  const deleteAssignment = async (id: string) => {
    await supabase.from('assignments').delete().eq('id', id);
    setAssignments((current) => current.filter((a) => a.id !== id));
  };

  const addStudyPlanItem = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!studyTask) return;
    const { data, error } = await insertWithUserFallback('study_plan_items', { day: studyDay, task: studyTask });
    if (error || !data) {
      setFormError(`Couldn't add study plan item: ${error?.message ?? 'Please try again.'}`);
      return;
    }
    setStudyPlan((current) => [...current, { id: data.id as string, day: data.day as string, task: data.task as string }]);
    setStudyTask('');
  };

  const logStudySession = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!studySessionDate || !studyDuration) return;
    const { data, error } = await insertWithUserFallback('study_sessions', { date: studySessionDate, duration: Number(studyDuration) });
    if (error || !data) {
      setFormError(`Couldn't log study session: ${error?.message ?? 'Please try again.'}`);
      return;
    }
    setStudySessions((current) => [{ id: data.id as string, date: data.date as string, duration: data.duration as number }, ...current]);
    setStudySessionDate('');
    setStudyDuration('');
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    await supabase.auth.updateUser({ data: { name: profileName } });
  };

  const courseOptions = useMemo(() => ['All', ...courses], [courses]);

  const filteredAssignments = useMemo(() => {
    const base = assignments.filter((assignment) => {
      const matchesCourse = filterCourse === 'All' || assignment.course === filterCourse;
      const today = new Date();
      const due = new Date(assignment.dueDate);
      const matchesDueDate = filterDueDate === 'All' || (filterDueDate === 'Overdue' && due < today) || (filterDueDate === 'Upcoming' && due >= today);
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCourse && matchesDueDate && matchesSearch;
    });
    if (sortOption === 'due-date') return [...base].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return base;
  }, [assignments, filterCourse, filterDueDate, searchTerm, sortOption]);

  const completedCount = useMemo(() => assignments.filter((a) => a.completed).length, [assignments]);
  const totalAssignments = assignments.length;

  const streak = useMemo(() => {
    if (studySessions.length === 0) return 0;
    const uniqueDates = Array.from(new Set(studySessions.map((s) => s.date))).sort().reverse();
    let currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      if (Math.round((prev.getTime() - curr.getTime()) / 86400000) === 1) currentStreak++;
      else break;
    }
    return currentStreak;
  }, [studySessions]);

  if (authLoading) return <div className="auth-shell"><div className="card auth-card"><p>Loading...</p></div></div>;

  if (!session) {
    return (
      <div className="auth-shell">
        <div className="card auth-card">
          <h1>StudyFlow</h1>
          <p>Organise your study plan, manage deadlines, and track progress.</p>
          <div className="auth-toggle">
            <button type="button" className={authMode === 'login' ? 'active' : 'secondary'} onClick={() => setAuthMode('login')}>Login tab</button>
            <button type="button" className={authMode === 'signup' ? 'active' : 'secondary'} onClick={() => setAuthMode('signup')}>Signup tab</button>
          </div>
          <form onSubmit={handleAuth}>
            {authMode === 'signup' && (
              <label>Name<input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your name" /></label>
            )}
            <label>Email<input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" /></label>
            {authError && <p className="error">{authError}</p>}
            <button type="submit">{authMode === 'login' ? 'Log in' : 'Create account'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header><h1>StudyFlow</h1><p>Welcome back, {profileName}.</p></header>

      <section className="card">
        <h2>Student Name</h2>
        <form onSubmit={saveProfile} className="stack">
          <label htmlFor="profile-name">
            <input id="profile-name" aria-label="Profile name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          </label>
          <button type="submit">Change Name</button>
        </form>
      </section>

      <section className="card">
        <h2>Dashboard</h2>
        <div className="summary-grid">
          <div className="summary-box"><strong>Total assignments</strong><p>{totalAssignments}</p></div>
          <div className="summary-box"><strong>Completed assignments</strong><p>{completedCount}</p></div>
          <div className="summary-box"><strong>Study streak</strong><p>{streak} day(s)</p></div>
          <div className="summary-box"><strong>Study time logged</strong><p>{studySessions.reduce((t, s) => t + s.duration, 0)} minutes</p></div>
        </div>
      </section>

      <section className="card">
        <h2>Add a course</h2>
        <form onSubmit={addCourse} className="stack">
          <label>Course name<input value={courseInput} onChange={(e) => setCourseInput(e.target.value)} placeholder="CS410" /></label>
          <button type="submit">Add course</button>
        </form>
        <div className="pill-list">{courses.map((n) => <span key={n} className="pill">{n}</span>)}</div>
      </section>

      <form onSubmit={addAssignment} className="card form-card">
        <h2>Add Assignment</h2>
        {formError && <p className="error">{formError}</p>}
        <label htmlFor="assignment-title">Assignment title<input id="assignment-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" /></label>
        <label htmlFor="assignment-course">Assignment course
          <select id="assignment-course" value={course} onChange={(e) => setCourse(e.target.value)}>
            {courses.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label htmlFor="assignment-due-date">Assignment due date<input id="assignment-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
        <button type="submit">Add Assignment</button>
      </form>

      <section className="card">
        <h2>Study Plan</h2>
        <form onSubmit={addStudyPlanItem} className="stack">
          <label htmlFor="study-day">Study day
            <select id="study-day" value={studyDay} onChange={(e) => setStudyDay(e.target.value)}>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label htmlFor="study-plan-task">Study plan task<input id="study-plan-task" value={studyTask} onChange={(e) => setStudyTask(e.target.value)} placeholder="Review algorithms" /></label>
          <button type="submit">Add study plan</button>
        </form>
        <ul className="assignment-list">
          {studyPlan.map((item) => <li key={item.id} className="assignment-item"><strong>{item.day}</strong><span>{item.task}</span></li>)}
        </ul>
      </section>

      <section className="card">
        <h2>Study Sessions</h2>
        <form onSubmit={logStudySession} className="stack">
          <label htmlFor="study-date">Study date<input id="study-date" type="date" value={studySessionDate} onChange={(e) => setStudySessionDate(e.target.value)} /></label>
          <label htmlFor="study-duration">Study duration<input id="study-duration" type="number" min="1" value={studyDuration} onChange={(e) => setStudyDuration(e.target.value)} placeholder="45" /></label>
          <button type="submit">Log study session</button>
        </form>
        <div className="summary-box">
          <p>Study streak: {streak} day(s)</p>
          <ul className="assignment-list">
            {[...studySessions].reverse().map((s) => <li key={s.id} className="assignment-item"><span>{s.date}</span><span>{s.duration} minutes</span></li>)}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2>Assignments</h2>
        <div className="filters">
          <label htmlFor="search-tasks">Search tasks<input id="search-tasks" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks" /></label>
          <label htmlFor="sort-tasks">Sort tasks
            <select id="sort-tasks" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="default">Default</option>
              <option value="due-date">Due date</option>
            </select>
          </label>
          <label htmlFor="filter-course">Filter course
            <select id="filter-course" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              {courseOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label htmlFor="filter-due-date">Filter due date
            <select id="filter-due-date" value={filterDueDate} onChange={(e) => setFilterDueDate(e.target.value)}>
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
                <p>{assignment.course} • Due {assignment.dueDate}</p>
              </div>
              <div className="actions">
                <button type="button" onClick={() => toggleComplete(assignment.id, assignment.completed)}>{assignment.completed ? 'Undo' : 'Complete'}</button>
                <button type="button" className="secondary" onClick={() => deleteAssignment(assignment.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
