require('@adonisjs/require-ts')

const { configure } = require('japa')
configure({
	files: ['test/**/*.spec.ts'],
})
