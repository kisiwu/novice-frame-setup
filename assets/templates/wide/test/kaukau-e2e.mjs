import { defineConfig } from 'kaukau/config'

export default defineConfig({
	enableLogs: false,
	exitOnFail: true,
	files: 'test',
	ext: '.e2e-spec.ts',
	options: {
		bail: false,
		fullTrace: true,
		grep: '',
		ignoreLeaks: false,
		reporter: 'spec',
		retries: 0,
		slow: 100,
		timeout: 2000,
		ui: 'bdd',
		color: true
	}
})
