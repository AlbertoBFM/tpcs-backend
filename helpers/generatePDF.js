const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const hbs = require('handlebars');

//* Conpile template with data
const compile = async (templateName, data) => {
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const html = fs.readFileSync(filePath, 'utf-8');
    return hbs.compile(html)(data);
};
//* Create pdf
const createPdf = async ({ template, data }) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    });
    
    const page = await browser.newPage();

    const content = await compile( template, data );
 
    await page.setContent(content);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({
        //*If you want create pdf file, then add property 'path' in this object
        margin: { top: '40px', right: '50px', bottom: '50px', left: '40px' },
        printBackground: true,
        format: 'A4',
        // landscape: true,
    });
    await browser.close();

    return pdf;
}

module.exports = {
    createPdf,
}