const axios = require('axios');
const cheerio = require('cheerio');

exports.config = {
    name: 'pinterest',
    author: 'Lance Cochangco',
    description: 'Search for Pinterest images',
    method: 'get',
    category: 'search',
    link: ['/pinterest?text=night place']
};

// Pinterest search function
function pinterest(query) {
    return new Promise(async (resolve, reject) => {
        axios.get(`https://id.pinterest.com/search/pins/?autologin=true&q=${query}`, {
            headers: {
                "cookie": "_auth=1; _b=\"AXOtdcLOEbxD+qMFO7SaKFUCRcmtAznLCZY9V3z9tcTqWH7bPo637K4f9xlJCfn3rl4=\"; _pinterest_sess=TWc9PSZWcnpkblM5U1pkNkZ0dzZ6NUc5WDZqZEpGd2pVY3A0Y2VJOGg0a0J0c2JFWVpQalhWeG5iTTRJTmI5R08zZVNhRUZ4SmsvMG1CbjBWUWpLWVFDcWNnNUhYL3NHT1EvN3RBMkFYVUU0T0dIRldqVVBrenVpbGo5Q1lONHRlMzBxQTBjRGFSZnFBcTdDQVgrWVJwM0JtN3VRNEQyeUpsdDYreXpYTktRVjlxb0xNanBodUR1VFN4c2JUek1DajJXbTVuLzNCUDVwMmRlZW5VZVpBeFQ5ZC9oc2RnTGpEMmg4M0Y2N2RJeVo2aGNBYllUYjRnM05VeERzZXVRUVVYNnNyMGpBNUdmQ1dmM2s2M0txUHRuZTBHVFJEMEE1SnIyY2FTTm9DUEVTeWxKb3V0SW13bkV3TldyOUdrdUZaWGpzWmdaT0JlVnhWb29xWTZOTnNVM1NQSzViMkFUTjBpRitRRVMxaUFxMEJqell1bVduTDJid2l3a012RUgxQWhZT1M3STViSVkxV0dSb1p0NTBYcXlqRU5nPT0ma25kRitQYjZJNTVPb2tyVnVxSWlleEdTTkFRPQ==; _ir=0"
            }
        }).then(({ data }) => {
            const $ = cheerio.load(data);
            const result = [];
            const finalResult = [];
            $('div > a').each((i, elem) => {
                const link = $(elem).find('img').attr('src');
                result.push(link);
            });

            result.forEach((v) => {
                if (v && v.includes('236')) {
                    finalResult.push(v.replace(/236/g, '736')); // Replace image resolution
                }
            });

            finalResult.shift(); // Remove the first result if necessary
            resolve(finalResult);
        }).catch(reject);
    });
}

// Initialize route
exports.initialize = async function ({ req, res }) {
    try {
        const text1 = req.query.text;
        if (!text1) {
            return res.json({
                status: false,
                creator: this.config.author,
                message: "[!] Please provide the 'text' query parameter"
            });
        }

        const data = await pinterest(text1);
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
            message: "An error occurred while fetching data",
            error: error.message
        });
    }
};
