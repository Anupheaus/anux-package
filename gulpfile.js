const gulp = require('gulp');

// Where your Less files are located
const srcDir = './harness';
// Where your CSS files will be generated
const dstDir = '../anux-react-drag-and-drop/node_modules/anux-package/harness';

gulp.task('copy', () => gulp
  .src(`${srcDir}/*.*`)
  .pipe(gulp.dest(dstDir)));

gulp.task('export', () => gulp
  .watch(`${srcDir}/*.*`, gulp.series('copy')));
