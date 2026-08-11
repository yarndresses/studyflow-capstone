import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('StudyFlow first sprint features', () => {
  it('allows a user to add and complete an assignment', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await user.type(screen.getByLabelText(/assignment title/i), 'Final Presentation');
    await user.selectOptions(screen.getByLabelText(/assignment course/i), 'CS320');
    await user.type(screen.getByLabelText(/assignment due date/i), '2026-08-20');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    expect(screen.getByText('Final Presentation')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /complete/i })[0]);
    expect(screen.getAllByText('Undo').length).toBeGreaterThan(0);
  });

  it('filters assignments by course and date', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await user.selectOptions(screen.getByLabelText(/filter course/i), 'CS410');
    await user.selectOptions(screen.getByLabelText(/filter due date/i), 'Upcoming');

    expect(screen.getByText('Database Design Report')).toBeInTheDocument();
  });

  it('supports study planning and session tracking', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

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

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/completed assignments/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/search tasks/i), 'Database');
    expect(screen.getByText('Database Design Report')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/sort tasks/i), 'due-date');
    expect(screen.getByText('Database Design Report')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/profile name/i));
    await user.type(screen.getByLabelText(/profile name/i), 'Alex');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(screen.getByText(/welcome back, alex/i)).toBeInTheDocument();
  });
});
