const { RankCardBuilder } = require('discord-card-canvas');
const fs = require('fs');

// API config details
exports.config = {
    name: 'rank',
    author: 'Lance Cochangco',
    description: 'Generate a rank card',
    method: 'get',
    category: 'canvas',
    link: ['/rank?level=102&rank=563&xp=71032&requiredXP=95195&nickname=xLance Ajiro&status=online&avatar=https://imgur.com/xwCoQ5H.jpg']
};

// Initialize API to create rank card
exports.initialize = async function ({ req, res }) {
    try {
        const { level, rank, xp, requiredXP, nickname, status, avatar } = req.query;

        // Check if the required query parameters are present
        if (!level || !rank || !xp || !requiredXP || !nickname || !status || !avatar) {
            return res.status(400).json({ error: "add ?level=your_level&rank=your_rank&xp=your_xp&requiredXP=your_required_xp&nickname=your_nickname&status=your_status&avatar=your_avatar_url" });
        }

        // Create the rank card with the provided parameters
        const canvasRank = await new RankCardBuilder({
            currentLvl: parseInt(level),
            currentRank: parseInt(rank),
            currentXP: parseInt(xp),
            requiredXP: parseInt(requiredXP),
            backgroundColor: { background: '#070d19', bubbles: '#0ca7ff' },
            avatarImgURL: avatar,
            nicknameText: { content: nickname, font: 'Nunito', color: '#0CA7FF' },
            userStatus: status
        }).build();

        // Save the rank card image to a buffer
        const buffer = canvasRank.toBuffer();

        // Set appropriate headers and send the image as a response
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error("Error creating rank card:", error);
        res.status(500).json({ error: "Failed to create rank card" });
    }
};
