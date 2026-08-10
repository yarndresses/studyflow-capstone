import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('StudyFlow first sprint features', () => {
  it('allows a user to add and complete an assignment', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i, exact: true }));

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
    await user.click(screen.getByRole('button', { name: /^log in$/i, exact: true }));

    await user.selectOptions(screen.getByLabelText(/filter course/i), 'CS410');
    await user.selectOptions(screen.getByLabelText(/filter due date/i), 'Upcoming');

    expect(screen.getByText('Database Design Report')).toBeInTheDocument();
  });
});
