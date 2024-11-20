const knights = require('knights-canvas');
const fs = require('fs');
const path = require('path');

exports.config = {
    name: 'welcome',
    author: 'Lance Cochangco',
    description: 'Generate a welcome canvas image',
    method: 'get',
    category: 'canvas',
    link: ['/welcome?username=Lance&avatarUrl=https://i.imgur.com/xwCoQ5H.jpeg&groupname=Ajironian&bg=https://i.ibb.co/4YBNyvP/images-76.jpg&memberCount=25'],
};

exports.initialize = async function ({ req, res }) {
    try {
        // Retrieve query parameters from the request
        const { username, avatarUrl, groupname, bg, memberCount } = req.query;

        // Ensure all necessary parameters are provided
        if (!username || !avatarUrl || !groupname || !memberCount) {
            return res.status(400).json({ error: "add ?username=your_username&avatarUrl=your_avatar_url&groupname=your_group_name&memberCount=your_member_count " });
        }

        // Generate the welcome image
        const image = await new knights.Welcome2()
            .setAvatar(avatarUrl)       // Avatar URL from the query
            .setUsername(username)      // Username from the query
            .setBg(bg) // Background image (static or can be dynamic)
            .setGroupname(groupname)    // Group name from the query
            .setMember(memberCount)     // Member count from the query
            .toAttachment();

        const imageBuffer = image.toBuffer();

        // Define the file path to temporarily store the image
        const cacheDir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const filePath = path.join(cacheDir, `welcome_${Date.now()}.png`);

        // Write the image to a temporary file
        await fs.promises.writeFile(filePath, imageBuffer);

        // Send the image file back as a response
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                res.status(500).json({ error: "Failed to generate image" });
            }
        });

        // Delete the file after it has been sent
        res.on('finish', () => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

    } catch (error) {
        console.error("Error generating welcome image:", error);
        res.status(500).json({ error: "Failed to generate welcome image" });
    }
};
