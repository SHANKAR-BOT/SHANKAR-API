const { Goodbye2 } = require('knights-canvas');
const fs = require('fs');
const path = require('path');

exports.config = {
    name: 'goodbye',
    author: 'Lance Cochangco',
    description: 'Generate a goodbye image',
    category: 'canvas',
    method: 'get',
    link: ['/goodbye?pp=https://i.imgur.com/xwCoQ5H.jpeg&nama=Lance&bg=https://i.ibb.co/4YBNyvP/images-76.jpg&member=25']
};

exports.initialize = async function ({ req, res }) {
    try {
        const pp = req.query.pp;
        const nama = req.query.nama;
        const bg = req.query.bg;
        const member = req.query.member;

        if (!pp || !nama || !bg || !member) {
            return res.status(400).json({ status: false, creator: 'Lance Cochangco', message: "Missing data to execute the command" });
        }

        let goodbyeCanvas = await new Goodbye2()
            .setAvatar(pp)
            .setUsername(nama)
            .setBg(bg)
            .setMember(member)
            .toAttachment();

        const data = goodbyeCanvas.toBuffer();
        const filePath = path.join(__dirname, '/tmp/goodbye.png');
        await fs.writeFileSync(filePath, data);

        res.sendFile(filePath);
    } catch (error) {
        console.error("Error generating goodbye canvas:", error);
        res.status(500).json({ error: "Failed to generate canvas" });
    }
};
