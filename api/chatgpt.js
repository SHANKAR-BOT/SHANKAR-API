const { G4F } = require("g4f");
const fs = require('fs');
const path = require('path');
const g4f = new G4F();

// Define the base directory for storing conversations
const conversationsDir = path.join(__dirname, './conversational/chatgpt');

exports.config = {
    name: 'chatgpt',
    author: 'Lance Cochangco',
    description: 'Chat with chatGPT',
    method: 'get',
    category: 'ai',
    // Updated links with userId parameter
    link: ['/chatgpt?userId=1&question=hi']
};

exports.initialize = async function ({ req, res }) {
    try {
        // Check if there's a query parameter named 'question'
        const question = req.query.question;
        const userId = req.query.userId || 'default'; // Ensure userId is included in the query parameters

        // Define the conversation file path based on user ID
        const conversationFile = path.join(conversationsDir, `${userId}.json`);

        // If no question is provided, return an error
        if (!question) {
            return res.status(400).json({ error: "add ?question=your_question_here" });
        }

        // If the user inputs "clear" or "reset", delete the conversation file
        if (['clear', 'reset'].includes(question.toLowerCase().trim())) {
            if (fs.existsSync(conversationFile)) {
                fs.unlinkSync(conversationFile); // Delete the file
            }
            return res.json({ content: "Conversation reset successfully." });
        }

        // Load existing conversation if available, otherwise create a new one
        let messages = [];
        if (fs.existsSync(conversationFile)) {
            const existingConversation = fs.readFileSync(conversationFile, 'utf-8');
            messages = JSON.parse(existingConversation);
        } else {
            // Start a new conversation if none exists
            messages.push({ role: "system", content: "You are a helpful assistant." });
        }

        // Add the user's message to the conversation
        messages.push({ role: "user", content: question });

        // Use the messages array in generating the response
        const chat = await g4f.chatCompletion(messages);

        // Add the assistant's response to the conversation
        messages.push({ role: "assistant", content: chat });

        // Auto-save the conversation to a file (auto-generates/updates the JSON)
        fs.writeFileSync(conversationFile, JSON.stringify(messages, null, 2));

        // Send the AI's response as JSON
        res.json({ content: chat });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};
