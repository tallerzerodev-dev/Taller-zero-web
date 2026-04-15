const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function scrapeFlowDocs() {
    try {
        const sitemapText = await fetch('https://developers.flow.cl/sitemap.xml').then(r => r.text());
        const urls = [];
        const regex = /<loc>(https:\/\/developers\.flow\.cl\/docs\/.*?)<\/loc>/g;
        let match;
        while ((match = regex.exec(sitemapText)) !== null) {
            urls.push(match[1]);
        }

        let markdown = '# Documentación Oficial de Flow.cl\n\nEste documento contiene la recopilación completa de la documentación para integradores de Flow.\n\n';

        console.log(`Encontradas ${urls.length} URLs de documentación.`);

        for (const url of urls) {
            console.log(`Scraping: ${url}`);
            try {
                const html = await fetch(url).then(r => r.text());
                const dom = new JSDOM(html);
                const document = dom.window.document;

                const article = document.querySelector('article');
                if (article) {
                    const title = article.querySelector('h1')?.textContent || url.split('/').pop();
                    markdown += `---\n\n## ${title}\n\n`;
                    markdown += `> Fuente: ${url}\n\n`;

                    let contentHtml = article.innerHTML;
                    // Simple naive clean up
                    contentHtml = contentHtml.replace(/<[^>]+>/g, (tag) => {
                        // Keep newlines and titles somewhat structured
                        if (tag.match(/^<h[1-6]/i)) return '\n\n### ';
                        if (tag.match(/^<\/(p|div)/i)) return '\n\n';
                        if (tag.match(/^<li/i)) return '\n- ';
                        // Keep links if possible
                        return '';
                    });

                    markdown += unescapeHTML(contentHtml).replace(/\n\s*\n/g, '\n\n').trim() + '\n\n';
                }
            } catch (err) {
                console.error(`Error procesando ${url}:`, err.message);
            }
        }

        fs.writeFileSync('README_FLOW.md', markdown, 'utf-8');
        console.log('✅ Documentación guardada en README_FLOW.md');
    } catch (e) {
        console.error('Error general:', e);
    }
}

function unescapeHTML(html) {
    return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#8203;/g, '').replace(/&nbsp;/g, ' ');
}

scrapeFlowDocs();