const fs = require('fs');
let css = fs.readFileSync('C:/Users/houst/Desktop/PI/ConnectCamp/campconnect-landing-page-design/styles.css', 'utf8');
css = css.replace(/:root/g, ':host');
css = css.replace(/body \{/g, ':host {');
css = css.replace(/html \{/g, ':host {');
fs.writeFileSync('C:/Users/houst/Desktop/PI/ConnectCamp/angular-campconnect/src/app/features/landing/landing.component.scss', css);
console.log('done');
