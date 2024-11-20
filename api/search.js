const DDG = require('duck-duck-scrape');

exports.config = {
    name: 'search',
    author: 'Lance Cochangco',
    description: 'Search for a topic on DuckDuckGo',
    method: 'get',
    category: 'tools',
    link: ['/search?query=who is Jose Rizal?']
};

exports.initialize = async function ({ req, res, log }) {
    try {
        const query = req.query.query;
        
        if (!query) {
            return res.status(400).json({ 
                error: "Please add ?query=your_search_query" 
            });
        }

        const searchResults = await DDG.search(query, { 
            safeSearch: DDG.SafeSearchType.STRICT 
        });

        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            return res.status(404).json({ 
                error: "No search results found" 
            });
        }

        // Get the first 5 results or less if fewer results are available
        const numResults = Math.min(5, searchResults.results.length);
        const formattedResults = [];

        for (let i = 0; i < numResults; i++) {
            const result = searchResults.results[i];
            formattedResults.push({
                title: result.title,
                description: result.description.replace(/<\/?b>/g, ""), // Remove both opening and closing b tags
                source: result.hostname,
                url: result.url
            });
        }

        res.json(formattedResults);
        
    } catch (error) {
        log.error("Error performing search:" + error);
        res.status(500).json({ 
            error: "Failed to perform search" 
        });
    }
};