import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const authCallbacks = vi.hoisted(() => ({ change: (_event: string, _session: unknown) => {} }));
const mockState = vi.hoisted(() => ({ assignmentInsertError: false }));

const mockSession = vi.hoisted(() => ({
  user: { id: 'u1', email: 'student@example.com', user_metadata: { name: 'Student' } },
}));

vi.mock('./supabase', () => {
  const mockCourses = [{ name: 'CS410' }, { name: 'CS320' }, { name: 'ENG210' }];
  const mockAssignments = [
    { id: '1', title: 'Database Design Report', course: 'CS410', due_date: '2026-08-12', completed: false },
    { id: '2', title: 'Algorithms Homework', course: 'CS320', due_date: '2026-08-10', completed: false },
    { id: '3', title: 'Reading Reflection', course: 'ENG210', due_date: '2026-08-15', completed: true },
  ];

  return {
    supabase: {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
          authCallbacks.change = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
        signInWithPassword: async () => {
          authCallbacks.change('SIGNED_IN', mockSession);
          return { data: { session: mockSession }, error: null };
        },
        updateUser: async () => ({ data: {}, error: null }),
      },
      from: (table: string) => ({
        select: () => ({
          order: () => Promise.resolve({ data: table === 'courses' ? mockCourses : table === 'assignments' ? mockAssignments : [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: (data: Record<string, unknown>) => ({
          select: () => ({
            single: () => Promise.resolve(
              table === 'assignments' && mockState.assignmentInsertError
                ? { data: null, error: { message: 'Unable to save assignment' } }
                : { data: { id: `mock-${Date.now()}`, ...data }, error: null }
            ),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
    },
  };
});

async function loginUser(user: ReturnType<typeof userEvent.setup>) {
  const emailInput = await screen.findByLabelText(/email/i);
  await user.type(emailInput, 'student@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /^log in$/i }));
  await screen.findByText(/dashboard/i);
}

describe('StudyFlow features', () => {
  beforeEach(() => {
    mockState.assignmentInsertError = false;
  });

  it('allows a user to add and complete an assignment', async () => {
    const user = userEvent.setup();
    render(<App />);
    await loginUser(user);

    await user.type(screen.getByLabelText(/assignment title/i), 'Final Presentation');
    await user.selectOptions(screen.getByLabelText(/assignment course/i), 'CS320');
    await user.type(screen.getByLabelText(/assignment due date/i), '2026-08-20');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    expect(screen.getByText('Final Presentation')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /complete/i })[0]);
    expect(screen.getAllByText('Undo').length).toBeGreaterThan(0);
  });

  it('shows a helpful message when assignment creation fails', async () => {
    mockState.assignmentInsertError = true;
    const user = userEvent.setup();
    render(<App />);
    await loginUser(user);

    await user.type(screen.getByLabelText(/assignment title/i), 'Final Presentation');
    await user.selectOptions(screen.getByLabelText(/assignment course/i), 'CS320');
    await user.type(screen.getByLabelText(/assignment due date/i), '2026-08-20');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    expect(await screen.findByText(/couldn't add assignment/i)).toBeInTheDocument();
  });

  it('filters assignments by course and date', async () => {
    const user = userEvent.setup();
    render(<App />);
    await loginUser(user);

    await user.selectOptions(screen.getByLabelText(/filter course/i), 'CS410');
    await user.selectOptions(screen.getByLabelText(/filter due date/i), 'Upcoming');

    expect(screen.getByText('Database Design Report')).toBeInTheDocument();
  });

  it('supports study planning and session tracking', async () => {
    const user = userEvent.setup();
    render(<App />);
    await loginUser(user);

    await user.selectOptions(screen.getByLabelText(/study day/i), 'Tuesday');
    await user.type(screen.getByLabelText(/study plan task/i), 'Review algorithms');
    await user.click(screen.getByRole('button', { name: /add study plan/i }));
    expect(screen.getByText('Review algorithms')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/study date/i), '2026-08-11');
    await user.type(screen.getByLabelText(/study duration/i), '45');
    await user.click(screen.getByRole('button', { name: /log study session/i }));

    expect(screen.getByText('Study streak: 1 day(s)')).toBeInTheDocument();
    expect(screen.getAllByText(/45 minutes/i).length).toBeGreaterThan(0);
  });

  it('shows dashboard insights, supports search and sorting, and updates the profile', async () => {
    const user = userEvent.setup();
    render(<App />);
    await loginUser(user);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/completed assignments/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/search tasks/i), 'Database');
    expect(screen.getByText('Database Design Report')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/sort tasks/i), 'due-date');
    expect(screen.getByText('Database Design Report')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/profile name/i));
    await user.type(screen.getByLabelText(/profile name/i), 'Alex');
    await user.click(screen.getByRole('button', { name: /change name/i }));
    expect(screen.getByText(/welcome back, alex/i)).toBeInTheDocument();
  });
});
