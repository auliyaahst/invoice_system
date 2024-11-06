const ghpages = require('gh-pages');

// Adjust the 'build' directory if your build output is located elsewhere
ghpages.publish('build', { src: ['**/*', '!node_modules/**/*', '!backend/**/*'] }, callback);