const axios = require('axios');
const cheerio = require('cheerio');

exports.config = {
    name: 'facebook',
    author: 'Lance Cochangco',
    description: 'Download Facebook videos',
    method: 'get',
    category: 'downloader',
    link: ['/facebook?url=https://www.facebook.com/itsmusicmood/videos/1234801394606164/?app=fbl']
};

// Function to handle Facebook video download
async function fbdown(link) {
    return new Promise((resolve, reject) => {
        let config = {
            'url': link
        };
        axios('https://www.getfvid.com/downloader', {
            method: 'POST',
            data: new URLSearchParams(Object.entries(config)),
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "cookie": "_ga=GA1.2.1310699039.1624884412; _gid=GA1.2.908874955.1625126838;"
            }
        })
        .then(async ({ data }) => {
            const $ = cheerio.load(data);
            resolve({
                Normal_video: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
                HD: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
                audio: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(2) > a').attr('href')
            });
        })
        .catch(reject);
    });
}

exports.initialize = async function ({ req, res }) {
    try {
        const url = req.query.url;
        if (!url) return res.json({ status: false, creator: this.config.author, message: "[!] enter url parameter!" });

        const data = await fbdown(url);
        if (!data.Normal_video) return res.json({ status: false, creator: this.config.author, message: "[!] video not found" });

        res.json({
            status: true,
            code: 200,
            result: data,
            creator: this.config.author
        });
    } catch (error) {
        console.error("Error downloading Facebook video:", error);
        res.json({
            status: false,
            code: 503,
            message: "service got error, try again in 10 seconds",
            creator: this.config.author
        });
    }
};
