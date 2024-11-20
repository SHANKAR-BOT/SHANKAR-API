const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

exports.config = {
    name: 'uptime',
    author: 'Lance Cochangco',
    description: 'Get uptime canvas',
    method: 'get',
    category: 'canvas',
    link: ['/uptime?instag=lance.cochangco&ghub=ajirodesu&fb=Lance%20Cochangco&hours=1&minutes=23&seconds=45&botname=Wataru']
};

exports.initialize = async function ({ req, res }) {
    try {
        const { instag, ghub, fb, hours, minutes, seconds, botname } = req.query;

        if (!instag || !ghub || !fb || !hours || !minutes || !seconds || !botname) {
            return res.status(400).json({ error: "add ?instag=your_instagram_username&ghub=your_github_username&fb=your_facebook_username&hours=1&minutes=23&seconds=45&botname=your_bot_name" });
        }

        const cacheDir = path.join(__dirname, 'tmp');
        await fs.ensureDir(cacheDir);

        const fonts = [
            { url: 'https://github.com/quyenkaneki/data/blob/main/UTM-Avo.ttf?raw=true', path: path.join(cacheDir, 'UTM-Avo.ttf') },
            { url: 'https://github.com/quyenkaneki/data/blob/main/phenomicon.ttf?raw=true', path: path.join(cacheDir, 'phenomicon.ttf') },
            { url: 'https://github.com/quyenkaneki/data/blob/main/CaviarDreams.ttf?raw=true', path: path.join(cacheDir, 'CaviarDreams.ttf') }
        ];

        for (const font of fonts) {
            if (!fs.existsSync(font.path)) {
                const fontData = (await axios.get(font.url, { responseType: 'arraybuffer' })).data;
                await fs.writeFile(font.path, Buffer.from(fontData, 'utf-8'));
            }
        }

        const backgroundUrl = 'https://imgur.com/x5JpRYu.png';
        const background = await loadImage(backgroundUrl);

        const animeData = (await axios.get('https://raw.githubusercontent.com/quyenkaneki/data/main/dataimganime.json')).data;
        const randomAnime = animeData[Math.floor(Math.random() * animeData.length)];
        const animeImage = await loadImage(randomAnime.imgAnime);

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = randomAnime.colorBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(animeImage, -200, -200, 1200, 1200);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        registerFont(path.join(cacheDir, 'phenomicon.ttf'), { family: 'phenomicon' });
        registerFont(path.join(cacheDir, 'UTM-Avo.ttf'), { family: 'UTM' });
        registerFont(path.join(cacheDir, 'CaviarDreams.ttf'), { family: 'time' });

        ctx.textAlign = 'start';
        ctx.strokeStyle = randomAnime.colorBg;
        ctx.filter = 'brightness(90%) contrast(110%)';

        ctx.font = '130px phenomicon';
        ctx.fillStyle = randomAnime.colorBg;
        ctx.fillText(botname, 835, 340);

        ctx.font = '70px UTM';
        ctx.fillStyle = '#000000';
        ctx.fillText(`${hours} : ${minutes} : ${seconds}`, 980, 440);

        ctx.font = '55px time';
        ctx.fillText(instag, 930, 540);
        ctx.fillText(ghub, 930, 610);
        ctx.fillText(fb, 930, 690);

        const imageBuffer = canvas.toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', imageBuffer.length);

        res.end(imageBuffer);

    } catch (error) {
        console.error("Error generating uptime canvas:", error);
        res.status(500).json({ error: "Failed to generate uptime canvas" });
    }
};