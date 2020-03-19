// postcss.config.js
const tailwindcss = require('tailwindcss');
const cssnano = require('cssnano')({
  preset: 'default',
});

const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: ['./components/**/*.js', './pages/**/*.js'],

  // Include any special characters being used in your css
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
});

module.exports = {
  plugins: [
    tailwindcss('./tailwind.config.js'),
    require('postcss-preset-env'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss, cssnano] : []),
  ],
};
