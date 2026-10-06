const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('BROWSER ERROR: ' + msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push('PAGE ERROR: ' + error.message);
  });

  const routes = [
    '/dashboard',
    '/subjects',
    '/exams-assignments',
    '/availability',
    '/calendar',
    '/progress',
    '/summary',
    '/settings'
  ];

  for (const route of routes) {
    console.log('Checking', route);
    await page.goto('http://localhost:5174' + route, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    
    // Check if error boundary is visible
    const isError = await page.evaluate(() => {
      return document.body.innerText.includes('Something went wrong');
    });
    
    if (isError) {
      console.log('❌ ErrorBoundary triggered on', route);
    } else {
      const isBlank = await page.evaluate(() => {
        const main = document.querySelector('main');
        return !main || main.innerText.trim() === '';
      });
      if (isBlank) {
        console.log('❌ Page is completely blank on', route);
      } else {
        console.log('✅ Page rendered on', route);
      }
    }
  }
  
  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    console.log(errors.join('\n'));
  }
  
  await browser.close();
})();
