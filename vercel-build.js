import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, lstatSync, statSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  outputDir: join(__dirname, 'dist'),
  filesToCopy: [
    'package.json',
    'pnpm-lock.yaml',
    'tsconfig.json',
    'vercel.json',
    'vercel.tsconfig.json',
    'server',
    'shared',
    'api',
    'migrations'
  ],
  excludeDirs: ['node_modules', '.git', '.vercel', '.next', 'dist', 'build'],
  logLevel: process.env.LOG_LEVEL || 'info' // 'debug', 'info', 'warn', 'error'
};

// Logger utilitaire
const logger = {
  debug: (message, ...args) => config.logLevel === 'debug' && console.debug(`[DEBUG] ${message}`, ...args),
  info: (message, ...args) => (config.logLevel === 'debug' || config.logLevel === 'info') && console.log(`[INFO] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args)
};

// Créer le répertoire de sortie s'il n'existe pas
function ensureOutputDir() {
  try {
    if (!existsSync(config.outputDir)) {
      mkdirSync(config.outputDir, { recursive: true });
      logger.info(`Created output directory: ${config.outputDir}`);
    }
  } catch (error) {
    logger.error(`Failed to create output directory: ${error.message}`);
    process.exit(1);
  }
}

// Vérifier si un chemin doit être exclu
function shouldExclude(path) {
  return config.excludeDirs.some(dir => path.includes(dir));
}

// Copier un fichier
function copyFileSync(source, target) {
  try {
    let targetFile = target;
    
    // Si la cible est un répertoire, on crée un fichier avec le même nom
    if (existsSync(target) && lstatSync(target).isDirectory()) {
      targetFile = join(target, source.split('/').pop());
    }
    
    // Créer le répertoire parent si nécessaire
    const targetDir = dirname(targetFile);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    
    writeFileSync(targetFile, readFileSync(source));
    logger.debug(`Copied: ${source} -> ${targetFile}`);
  } catch (error) {
    logger.error(`Failed to copy file ${source} to ${target}: ${error.message}`);
    throw error;
  }
}

// Copier un dossier récursivement
function copyFolderRecursiveSync(source, target) {
  try {
    // Vérifier si le dossier source doit être exclu
    if (shouldExclude(source)) {
      logger.debug(`Skipping excluded directory: ${source}`);
      return;
    }
    
    // Vérifier si le dossier cible existe, sinon le créer
    if (!existsSync(target)) {
      mkdirSync(target, { recursive: true });
      logger.debug(`Created directory: ${target}`);
    }
    
    // Lire le contenu du dossier source
    const files = readdirSync(source);
    
    // Parcourir tous les fichiers et dossiers
    for (const file of files) {
      const curSource = join(source, file);
      const curTarget = join(target, file);
      
      // Vérifier si le fichier/dossier doit être exclu
      if (shouldExclude(curSource)) {
        logger.debug(`Skipping excluded path: ${curSource}`);
        continue;
      }
      
      const stats = lstatSync(curSource);
      
      if (stats.isDirectory()) {
        // C'est un dossier, on le copie récursivement
        copyFolderRecursiveSync(curSource, curTarget);
      } else if (stats.isFile()) {
        // C'est un fichier, on le copie
        copyFileSync(curSource, curTarget);
      } else if (stats.isSymbolicLink()) {
        logger.debug(`Skipping symlink: ${curSource}`);
      }
    }
  } catch (error) {
    logger.error(`Error copying directory ${source} to ${target}: ${error.message}`);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    logger.info('Starting Vercel build process...');
    
    // Créer le répertoire de sortie
    ensureOutputDir();
    
    // Copier les fichiers et dossiers nécessaires
    for (const item of config.filesToCopy) {
      const source = join(__dirname, item);
      const target = join(config.outputDir, item);
      
      if (!existsSync(source)) {
        logger.warn(`Source not found: ${source}`);
        continue;
      }
      
      const stats = statSync(source);
      
      if (stats.isDirectory()) {
        logger.info(`Copying directory: ${source} -> ${target}`);
        copyFolderRecursiveSync(source, target);
      } else if (stats.isFile()) {
        logger.info(`Copying file: ${source} -> ${target}`);
        copyFileSync(source, target);
      }
    }
    
    // Exécuter le build du client
    logger.info('Building client...');
    await execAsync('pnpm run build', { cwd: __dirname });
    
    logger.info('Build completed successfully!');
  } catch (error) {
    logger.error(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Démarrer le processus de build
main().catch(error => {
  logger.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
