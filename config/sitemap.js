var sm = require('sitemap');

var sitemap = sm.createSitemap ({
      hostname: 'https://techmakers.ru',
      cacheTime: 600000,
      urls: [
        { url: '/',  changefreq: 'daily' },
        { url: '/surveys',  changefreq: 'daily' },
        { url: '/smart-lock',  changefreq: 'daily' },
        { url: '/smart-domophone',  changefreq: 'daily' }
      ]
	});	

module.exports = sitemap;








