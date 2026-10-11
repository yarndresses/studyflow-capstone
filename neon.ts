import { defineConfig } from "@neon/config/v1";

export default defineConfig({
	functions: {
		studyflowapi: {
			name: "StudyFlow API",
			source: "functions/studyflow-api.ts",
			env: {
				SUPABASE_URL: process.env.SUPABASE_URL!,
				SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
				ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
			},
		},
	},
});
