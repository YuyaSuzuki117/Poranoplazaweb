/**
 * Add srcset/sizes attributes to img elements referencing project/service images.
 * Only adds to images that have a -640w variant available.
 */
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html',
  'pages/works.html',
  'pages/services.html',
  'pages/company.html',
  'pages/contact.html'
];

let totalUpdated = 0;

for (const htmlFile of htmlFiles) {
  const fp = path.resolve(htmlFile);
  if (!fs.existsSync(fp)) continue;

  let content = fs.readFileSync(fp, 'utf8');
  let fileUpdated = 0;

  // Match img tags with src pointing to .webp files
  content = content.replace(/<img\b([^>]*?)src="([^"]*\.webp)"([^>]*?)>/g, (match, before, src, after) => {
    // Skip if already has srcset
    if (before.includes('srcset') || after.includes('srcset')) return match;

    // Skip decorative/tiny images (aria-hidden testimonial backgrounds are OK - they benefit from srcset)
    // Skip logo
    if (src.includes('logo')) return match;

    // Resolve the actual file path relative to HTML file
    const htmlDir = path.dirname(fp);
    const imgPath = path.resolve(htmlDir, src);
    const ext = path.extname(imgPath);
    const base = imgPath.slice(0, -ext.length);
    const smallPath = base + '-640w' + ext;

    // Only add srcset if 640w variant exists
    if (!fs.existsSync(smallPath)) return match;

    // Build srcset
    const smallSrc = src.replace(ext, '-640w' + ext);

    // Determine sizes based on context
    // Hero images: full viewport width
    // Gallery/thumbnail images: smaller
    let sizes = '(max-width: 640px) 100vw, 50vw';

    // Hero slides are always full width
    if (match.includes('hero-slide') || match.includes('object-cover w-full h-full')) {
      sizes = '100vw';
    }
    // Full-width section images
    else if (match.includes('w-full') && !match.includes('gallery')) {
      sizes = '(max-width: 768px) 100vw, 50vw';
    }
    // Gallery thumbnails
    else if (match.includes('gallery') || match.includes('aspect-[3/2]')) {
      sizes = '(max-width: 640px) 100vw, 300px';
    }
    // Comparison slider images
    else if (src.includes('before') || src.includes('after')) {
      sizes = '(max-width: 768px) 100vw, 600px';
    }

    const srcsetAttr = ` srcset="${smallSrc} 640w, ${src} ${getOrigWidth(imgPath)}w"`;
    const sizesAttr = ` sizes="${sizes}"`;

    fileUpdated++;
    return `<img${before}src="${src}"${srcsetAttr}${sizesAttr}${after}>`;
  });

  if (fileUpdated > 0) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`${htmlFile}: ${fileUpdated} images updated`);
    totalUpdated += fileUpdated;
  }
}

function getOrigWidth(imgPath) {
  // Use known widths from scan
  if (imgPath.includes('iwanaga') || imgPath.includes('null') || imgPath.includes('serene/photo5') || imgPath.includes('serene/photo6')) return 1920;
  if (imgPath.includes('services/aircon')) return 1253;
  if (imgPath.includes('services/interior')) return 1200;
  return 1200; // default for most project images
}

console.log(`\nTotal: ${totalUpdated} images updated with srcset/sizes`);
