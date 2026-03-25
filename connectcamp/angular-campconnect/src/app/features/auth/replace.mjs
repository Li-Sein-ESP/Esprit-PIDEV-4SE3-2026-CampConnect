import fs from 'fs';

const htmlPath = 'C:/Users/houst/Desktop/PI/ConnectCamp/angular-campconnect/src/app/features/auth/login.component.html';
let html = fs.readFileSync(htmlPath, 'utf-8');

// Regex to capture an entire <div class="input-group"> ... </div> block
const inputGroupRegex = /<div class="input-group">\s*<label[^>]*>([^<]*?)\s*<\/label>\s*(?:<div class="relative">)?\s*<input([^>]*)>\s*(<svg[^]*?<\/svg>)?\s*(?:<\/div>)?\s*<\/div>/g;

html = html.replace(inputGroupRegex, (match, labelContent, inputAttrs, svgObj) => {
    // extract type, formControlName, class, placeholder from inputAttrs
    const label = labelContent.trim().replace(/\s+/g, ' ');

    // Pass attributes directly, removing 'class="...modern-input..."'
    let newAttrs = inputAttrs.replace(/class="[^"]*modern-input[^"]*"/, '').trim();

    // Optional svg
    const svgContent = svgObj ? `\n                        ${svgObj}\n                    ` : '';

    return `<div class="mb-5">
                    <app-wave-input label="${label}" ${newAttrs}>${svgContent}</app-wave-input>
                </div>`;
});

fs.writeFileSync(htmlPath, html);
console.log('Done replacement');
