const axios = require('axios');
const cheerio = require('cheerio');

exports.config = {
    name: 'wallpaperV2',
    author: 'Lance Cochangco',
    description: 'Search for wallpapers on Best HD Wallpaper',
    method: 'get',
    category: 'search',
    link: ['/wallpaperV2?text=landscape']
};

// Wallpaper search function
function wallpaper(title, page = '1') {
    return new Promise((resolve, reject) => {
        axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`)
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const hasil = [];
                $('div.grid-item').each(function (a, b) {
                    hasil.push({
                        title: $(b).find('div.info > a > h3').text(),
                        type: $(b).find('div.info > a:nth-child(2)').text(),
                        source: 'https://www.besthdwallpaper.com' + $(b).find('div > a:nth-child(3)').attr('href'),
                        image: $(b).find('picture > source:nth-child(2)').attr('srcset')
                    });
                });

                resolve(hasil);
            })
            .catch(reject);
    });
}

// Initialize route
exports.initialize = async function ({ req, res }) {
    try {
        const text1 = req.query.text;
        const page = req.query.page || '1'; // Optional page query, default to '1'
        if (!text1) {
            return res.json({
                status: false,
                creator: this.config.author,
                message: "[!] Please provide the 'text' query parameter"
            });
        }

        // Call the wallpaper function instead of a non-existent pinterest function
        const data = await wallpaper(text1, page);
        if (!data.length) {
            return res.json({
                status: false,
                creator: this.config.author,
                message: "No results found"
            });
        }

        res.json({
            status: true,
            creator: this.config.author,
            result: data
        });
    } catch (error) {
        console.error("Error:", error);
        res.json({
            status: false,
            message: "An error occurred while fetching the wallpapers",
            error: error.message
        });
    }
};
