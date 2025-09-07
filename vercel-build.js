const fs = require('fs');
const path = require('path');

// Créer le répertoire de sortie s'il n'existe pas
const outputDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copier les fichiers nécessaires
const filesToCopy = [
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'vercel.json',
  'server',
  'shared',
  'api'
];

function copyFileSync(source, target) {
  let targetFile = target;
  
  // Si la cible est un répertoire, on crée un fichier avec le même nom
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }
  
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  // Vérifier si le dossier cible existe, sinon le créer
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Lire le contenu du dossier source
  const files = fs.readdirSync(source);
  
  // Parcourir tous les fichiers et dossiers
  files.forEach(file => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    
    if (fs.lstatSync(curSource).isDirectory()) {
      // C'est un dossier, on le copie récursivement
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      // C'est un fichier, on le copie
      copyFileSync(curSource, curTarget);
    }
  });
}

// Copier les fichiers et dossiers
filesToCopy.forEach(item => {
  const source = path.join(__dirname, item);
  const target = path.join(outputDir, item);
  
  if (fs.existsSync(source)) {
    if (fs.lstatSync(source).isDirectory()) {
      copyFolderRecursiveSync(source, target);
    } else {
      copyFileSync(source, target);
    }
  } else {
    console.warn(`File or directory not found: ${source}`);
  }
});

console.log('Build completed successfully!');
