const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Exclude node_modules, .git, etc.
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        getAllHtmlFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles('/Users/sarthakkapaliya/Projects/Portfolio/thenobody-12.github.io');

const buttonHtml = `
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme"></button>
    <button aria-controls="nav-links"`;

const scriptHtml = `
  <script src="/assets/js/theme-toggle.js"></script>
</head>`;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add script to head
  if (!content.includes('theme-toggle.js')) {
    // We need to use relative paths if the site doesn't run on root
    // For github pages, it might run on a subpath, but looking at current links:
    // index.html uses href="assets/img/...", about.html uses href="../assets/img/..."
    const depth = file.split('/').length - 7; // base depth
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    const scriptTag = `\n  <script src="${prefix}assets/js/theme-toggle.js"></script>\n</head>`;
    
    content = content.replace('</head>', scriptTag);
    changed = true;
  }

  // Add button to nav
  if (!content.includes('id="theme-toggle"')) {
    content = content.replace('<button aria-controls="nav-links"', buttonHtml);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
