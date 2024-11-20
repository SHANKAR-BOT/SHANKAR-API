const dylux = require('api-dylux'); // Ensure dylux is imported

// Define loghandler with custom error messages
const loghandler = {
    error: {
        status: false,
        code: 503,
        message: "Service got an error, try again in 10 seconds",
        creator: "Lance Cochangco"
    },
    noturl: {
        status: false,
        code: 503,
        message: "Enter parameter url",
        creator: "Lance Cochangco"
    }
};

exports.config = {
    name: 'gdrive',
    author: 'Lance Cochangco', // The creator's name here
    description: 'Download files from Google Drive using a URL',
    method: 'get',
    category: 'downloader',
    link: ['/gdrive?url=']
};

exports.initialize = async function ({ req, res }) { 
    try {
        const url = req.query.url;
        if (!url) {
            return res.json(loghandler.noturl); // Return error for missing URL
        }

        dylux.GDriveDl(url).then(data => {
            if (!data) {
                return res.json({
                    status: false,
                    creator: this.config.author,
                    message: "[!] Data not found"
                });
            }
            res.json({
                status: true,
                creator: this.config.author,
                result: data
            });
        })
        .catch(e => {
            console.error("Error fetching GDrive data:", e);
            res.json(loghandler.error); // Return error if download fails
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.json(loghandler.error); // Return error on unexpected exceptions
    }
};
