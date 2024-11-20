const dylux = require('api-dylux');

exports.config = {
    name: 'wallpaper',
    author: 'Lance Cochangco', // The creator's name here
    description: 'Search for wallpapers',
    method: 'get',
    category: 'search',
    link: ['/wallpaper?query=landscape']
};

exports.initialize = async function ({ req, res }) { 
    try {
        const text1 = req.query.query;
        if (!text1) {
            return res.json({ status: false, creator: this.config.author, message: "[!] enter query parameter!" });
        }

        dylux.wallpaper(text1).then((data) => {
            if (!data) {
                return res.json(loghandler.notfound);
            }
            res.json({
                status: true,
                creator: this.config.author,
                result: data
            });
        }).catch((err) => {
            res.sendFile(error);
        });
    } catch (error) {
        console.error("Error fetching wallpapers:", error);
        res.status(500).json({ error: "Failed to retrieve wallpapers." });
    }
};
