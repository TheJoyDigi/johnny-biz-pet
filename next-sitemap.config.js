module.exports = {
  siteUrl: "https://www.ruhrohretreat.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  exclude: ["/blog/_layout", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
    ],
  },
  transform: async (config, path) => {
    // If the path is the root path ("/")
    if (path === "/") {
      return {
        loc: path, // => this will be siteUrl + path
        changefreq: config.changefreq,
        priority: 1.0, // Set priority to 1 for the root path
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    // returning null will remove the item from sitemap.
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
