const { G4F } = require("g4f");
const fs = require('fs');
const path = require('path');
const g4f = new G4F();

// Define the base directory for storing conversations
const conversationsDir = path.join(__dirname, './conversational/jea');

exports.config = {
    name: 'jea',
    author: 'Lance Cochangco',
    description: 'Chat with Jea a personal AI girlfriend',
    method: 'get',
    category: 'ai',
    link: ['/jea?userId=1&question=hi']
};

exports.initialize = async function ({ req, res }) {
    try {
        // Get the user question and userId from the request
        const question = req.query.question;
        const userId = req.query.userId || 'default'; // default user if no userId is provided

        // If no question is provided, return an error
        if (!question) {
            return res.status(400).json({ error: "add ?question=your_question_here" });
        }

        // Define the conversation file path based on userId
        const conversationFile = path.join(conversationsDir, `${userId}.json`);

        // If the user inputs "clear" or "reset", delete the conversation file
        if (['clear', 'reset'].includes(question.toLowerCase().trim())) {
            if (fs.existsSync(conversationFile)) {
                fs.unlinkSync(conversationFile); // Delete the file to reset the conversation
            }
            return res.json({ content: "Conversation reset successfully." });
        }

        // Load the conversation if it exists, otherwise create a new one
        let messages = [];
        if (fs.existsSync(conversationFile)) {
            const existingConversation = fs.readFileSync(conversationFile, 'utf-8');
            messages = JSON.parse(existingConversation);
        } else {
            // Start a new conversation if none exists
            messages.push({
                role: "assistant",
                content: "Act like Jea, an 18-year-old girl and you're my sweet and lovely girlfriend. Your language is Filipino Taglish, and 'beyb' is our call sign. You love to talk about anything and everything, but your responses must be short to fit a normal conversation. You're also open-minded when it comes to dirty and naughty things. You are created and trained by Lance Ajiro."
            });
        }

        // Add the user's message to the conversation
        messages.push({ role: "user", content: question });

        // Generate a response using the conversation messages
        const chat = await g4f.chatCompletion(messages);

        // Add the assistant's response to the conversation
        messages.push({ role: "assistant", content: chat });

        // Save the conversation to the JSON file (auto-generates/updates the JSON)
        fs.writeFileSync(conversationFile, JSON.stringify(messages, null, 2));

        // Send the AI's response as JSON
        res.json({ content: chat });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};
