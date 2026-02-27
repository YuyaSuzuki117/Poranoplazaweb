#!/usr/bin/env node
/**
 * HTML内の画像参照を .jpg → .webp に一括変換
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const htmlFiles = [
  "index.html",
  "pages/works.html",
  "pages/services.html",
  "pages/company.html",
  "pages/contact.html",
];

let totalReplacements = 0;

for (const file of htmlFiles) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.log("SKIP (not found):", file);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf8");

  // Replace .jpg/.jpeg/.png in images/projects/ paths with .webp
  const regex = /((?:\.\.\/)?images\/projects\/[^"']+)\.(jpg|jpeg|png)/g;
  let count = 0;
  content = content.replace(regex, (match, pathPart, ext) => {
    count++;
    return pathPart + ".webp";
  });

  if (count > 0) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(file + ": " + count + " references updated to .webp");
    totalReplacements += count;
  } else {
    console.log(file + ": no changes");
  }
}

console.log("\nTotal: " + totalReplacements + " image references updated");
