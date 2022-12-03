const { rollup } = require('rollup');
const argv = require('yargs').argv;
const fs = require('fs-extra');
const gulp = require('gulp');
const path = require('path');
const rollupConfig = require('./rollup.config');
const peggy = require('./gulp-peggy');

const through2 = require('through2');
const yaml = require('js-yaml');
const Datastore = require('nedb');
const mergeStream = require('merge-stream');

/********************/
/*  CONFIGURATION   */
/********************/

const name = path.basename(path.resolve('.'));
const sourceDirectory = './src';
const buildDirectory = './build';
const distDirectory = './dist';
const stylesDirectory = `${sourceDirectory}/styles`;
const stylesExtension = 'css';
const sourceFileExtension = 'ts';
const packsDirectory = `${sourceDirectory}/packs`;
const peggyGrammarExtension = 'pegjs';
const grammarFilePath = 'src/peggy/';
const staticFiles = ['assets', 'fonts', 'lang', 'templates', 'module.json'];

/********************/
/* Peggy Parser Gen */
/********************/

async function peggyCopyDTS() {
  return gulp.src(`${grammarFilePath}*.d.ts`).pipe(gulp.dest(`${buildDirectory}/parser`));
}

async function peggyGen() {
  return gulp
    .src(`${grammarFilePath}*.${peggyGrammarExtension}`)
    .pipe(peggy())
    .pipe(gulp.dest(`${buildDirectory}/parser`));
}

/* ----------------------------------------- */
/*  Compile Compendia
/* ----------------------------------------- */
function compilePacks() {
  // determine the source folders to process
  const folders = fs.readdirSync(packsDirectory).filter((file) => {
    return fs.statSync(path.join(packsDirectory, file)).isDirectory();
  });

  // process each folder into a compendium db
  const packs = folders.map((folder) => {
    const filename = path.resolve(__dirname, distDirectory, 'packs', `${folder}.db`);
    fs.removeSync(filename);
    const db = new Datastore({
      filename: filename,
      autoload: true,
    });
    return gulp.src(path.join(packsDirectory, folder, '/**/*.yml')).pipe(
      through2.obj((file, enc, cb) => {
        let json = yaml.loadAll(file.contents.toString());
        // replace all Journal entries (.tab files) newlines with <br> to ensure correct display
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let [folderIndex, folder] of json.entries()) {
          if (folder.pages) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (let [pageIndex, page] of folder.pages.entries()) {
              if (page['name']?.match(/\.tab/)) {
                page.text.content = page.text.content.replaceAll('\n', '<br />');
              }
            }
          }
        }
        db.insert(json);
        cb(null, file);
      }),
    );
  });
  return mergeStream.call(null, packs);
}

/********************/
/*      BUILD       */
/********************/

/**
 * Build the distributable JavaScript code
 */
async function buildCode() {
  const build = await rollup({ input: rollupConfig.input, plugins: rollupConfig.plugins });
  return build.write(rollupConfig.output);
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp.src(`${stylesDirectory}/${name}.${stylesExtension}`).pipe(gulp.dest(`${distDirectory}/styles`));
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
    }
  }
}

/**
 * Watch for changes in grammars
 */
function buildWatchPeggy() {
  gulp.watch(`${sourceDirectory}/**/*.${peggyGrammarExtension}`, { ignoreInitial: false }, peggyGen);
  gulp.watch(`${grammarFilePath}*.d.ts`, { ignoreInitial: false }, peggyCopyDTS);
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  buildWatchPeggy();
  gulp.watch(`${sourceDirectory}/**/*.${sourceFileExtension}`, { ignoreInitial: false }, buildCode, compilePacks);
  gulp.watch(`${stylesDirectory}/**/*.${stylesExtension}`, { ignoreInitial: false }, buildStyles);
  gulp.watch(
    staticFiles.map((file) => `${sourceDirectory}/${file}`),
    { ignoreInitial: false },
    copyFiles,
  );
}

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
async function clean() {
  const distFiles = [...staticFiles, 'module'];

  if (fs.existsSync(`${stylesDirectory}/${name}.${stylesExtension}`)) {
    distFiles.push('styles');
  }

  console.log(' ', 'Dist files to clean:');
  console.log('   ', distFiles.join('\n    '));

  for (const filePath of distFiles) {
    await fs.remove(`${distDirectory}/${filePath}`);
  }
  const buildFiles = [buildDirectory];
  console.log(' ', 'Build files to clean:');
  console.log('   ', buildFiles.join('\n    '));
  await fs.remove(`${buildDirectory}`);
}

/********************/
/*       LINK       */
/********************/

/**
 * Get the data path of Foundry VTT based on what is configured in `foundryconfig.json`
 */
function getDataPath() {
  const config = fs.readJSONSync('foundryconfig.json');

  if (config?.dataPath) {
    if (!fs.existsSync(path.resolve(config.dataPath))) {
      throw new Error('User Data path invalid, no Data directory found');
    }

    return path.resolve(config.dataPath);
  } else {
    throw new Error('No User Data path defined in foundryconfig.json');
  }
}

/**
 * Link build to User Data folder
 */
async function linkUserData() {
  let destinationDirectory;
  if (fs.existsSync(path.resolve(sourceDirectory, 'module.json'))) {
    destinationDirectory = 'modules';
  } else {
    throw new Error('Could not find module.json');
  }

  const linkDirectory = path.resolve(getDataPath(), 'Data', destinationDirectory, name);

  if (argv.clean || argv.c) {
    console.log(`Removing build in ${linkDirectory}.`);

    await fs.remove(linkDirectory);
  } else if (!fs.existsSync(linkDirectory)) {
    console.log(`Linking dist to ${linkDirectory}.`);
    await fs.ensureDir(path.resolve(linkDirectory, '..'));
    await fs.symlink(path.resolve(distDirectory), linkDirectory);
  }
}

const execPeggy = gulp.parallel(peggyCopyDTS, peggyGen);
const execBuild = gulp.series(execPeggy, gulp.parallel(buildCode, buildStyles, copyFiles, compilePacks));

exports.packs = compilePacks;
exports.peggy = execPeggy;
exports.build = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.watchpeggy = buildWatchPeggy;
exports.clean = clean;
exports.link = linkUserData;
