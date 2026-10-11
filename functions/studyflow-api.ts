import { attachDatabasePool } from '@neon/functions';
import { Hono } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Pool } from 'pg';

type Bindings = {
  Variables: {
    userId: string;
  };
};

type AssignmentPayload = {
  title?: string;
  course?: string;
  due_date?: string;
  completed?: boolean;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/$/, '');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
const allowedOrigins = new Set(process.env.ALLOWED_ORIGINS!.split(',').map((origin) => origin.trim()));
const app = new Hono<Bindings>();

function corsHeaders(origin: string | null) {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

app.use('*', async (context, next) => {
  const origin = context.req.header('origin') ?? null;
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) context.header(key, value);

  if (context.req.method === 'OPTIONS') return context.body(null, 204);
  if (origin && Object.keys(headers).length === 0) return context.json({ error: 'Origin is not allowed.' }, 403);

  const authorization = context.req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) return context.json({ error: 'Unauthorized.' }, 401);

  try {
    const { payload } = await jwtVerify(authorization.slice(7), jwks, {
      issuer: `${supabaseUrl}/auth/v1`,
    });
    if (typeof payload.sub !== 'string') return context.json({ error: 'Unauthorized.' }, 401);
    context.set('userId', payload.sub);
    await next();
  } catch {
    return context.json({ error: 'Unauthorized.' }, 401);
  }
});

app.get('/health', (context) => context.json({ ok: true }));

app.delete('/account', async (context) => {
  const userId = context.get('userId');
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  });
  if (!response.ok) {
    return context.json({ error: 'Could not delete your account.' }, 502);
  }

  await Promise.all([
    pool.query('delete from public.courses where user_id = $1', [userId]),
    pool.query('delete from public.assignments where user_id = $1', [userId]),
    pool.query('delete from public.study_plan_items where user_id = $1', [userId]),
    pool.query('delete from public.study_sessions where user_id = $1', [userId]),
  ]);
  return context.body(null, 204);
});

app.get('/courses', async (context) => {
  const result = await pool.query(
    'select id, name, created_at from public.courses where user_id = $1 order by created_at',
    [context.get('userId')]
  );
  return context.json(result.rows);
});

app.post('/courses', async (context) => {
  const body = await context.req.json<{ name?: string }>();
  if (!hasText(body.name)) return context.json({ error: 'Course name is required.' }, 400);

  const result = await pool.query(
    'insert into public.courses (user_id, name) values ($1, $2) returning id, name, created_at',
    [context.get('userId'), body.name.trim().toUpperCase()]
  );
  return context.json(result.rows[0], 201);
});

app.get('/assignments', async (context) => {
  const result = await pool.query(
    'select id, title, course, due_date, completed, created_at from public.assignments where user_id = $1 order by created_at desc',
    [context.get('userId')]
  );
  return context.json(result.rows);
});

app.post('/assignments', async (context) => {
  const body = await context.req.json<AssignmentPayload>();
  if (!hasText(body.title) || !hasText(body.course) || !hasText(body.due_date)) {
    return context.json({ error: 'Title, course, and due date are required.' }, 400);
  }

  const result = await pool.query(
    'insert into public.assignments (user_id, title, course, due_date, completed) values ($1, $2, $3, $4, $5) returning id, title, course, due_date, completed, created_at',
    [context.get('userId'), body.title.trim(), body.course.trim(), body.due_date, body.completed ?? false]
  );
  return context.json(result.rows[0], 201);
});

app.patch('/assignments/:id', async (context) => {
  const body = await context.req.json<AssignmentPayload>();
  if (typeof body.completed !== 'boolean') return context.json({ error: 'Completed must be a boolean.' }, 400);

  const result = await pool.query(
    'update public.assignments set completed = $1 where id = $2 and user_id = $3 returning id, completed',
    [body.completed, context.req.param('id'), context.get('userId')]
  );
  if (!result.rows[0]) return context.json({ error: 'Assignment not found.' }, 404);
  return context.json(result.rows[0]);
});

app.delete('/assignments/:id', async (context) => {
  const result = await pool.query(
    'delete from public.assignments where id = $1 and user_id = $2 returning id',
    [context.req.param('id'), context.get('userId')]
  );
  if (!result.rows[0]) return context.json({ error: 'Assignment not found.' }, 404);
  return context.body(null, 204);
});

app.get('/study-plan-items', async (context) => {
  const result = await pool.query(
    'select id, day, task, created_at from public.study_plan_items where user_id = $1 order by created_at',
    [context.get('userId')]
  );
  return context.json(result.rows);
});

app.post('/study-plan-items', async (context) => {
  const body = await context.req.json<{ day?: string; task?: string }>();
  if (!hasText(body.day) || !hasText(body.task)) return context.json({ error: 'Day and task are required.' }, 400);

  const result = await pool.query(
    'insert into public.study_plan_items (user_id, day, task) values ($1, $2, $3) returning id, day, task, created_at',
    [context.get('userId'), body.day.trim(), body.task.trim()]
  );
  return context.json(result.rows[0], 201);
});

app.get('/study-sessions', async (context) => {
  const result = await pool.query(
    'select id, date, duration, created_at from public.study_sessions where user_id = $1 order by created_at desc',
    [context.get('userId')]
  );
  return context.json(result.rows);
});

app.post('/study-sessions', async (context) => {
  const body = await context.req.json<{ date?: string; duration?: number }>();
  if (!hasText(body.date) || typeof body.duration !== 'number' || body.duration <= 0) {
    return context.json({ error: 'A date and positive duration are required.' }, 400);
  }

  const result = await pool.query(
    'insert into public.study_sessions (user_id, date, duration) values ($1, $2, $3) returning id, date, duration, created_at',
    [context.get('userId'), body.date, body.duration]
  );
  return context.json(result.rows[0], 201);
});

export default app;