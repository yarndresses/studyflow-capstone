import { defineConfig } from "@neon/config/v1";

export default defineConfig({
	functions: {
		studyflowapi: {
			name: "StudyFlow API",
			source: "functions/studyflow-api.ts",
			env: {
				SUPABASE_URL: process.env.SUPABASE_URL!,
				ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
			},
		},
	},
});
