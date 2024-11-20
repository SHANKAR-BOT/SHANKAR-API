const mal = require('mal-scraper');

exports.config = {
    name: 'mal',
    author: 'Lance Cochangco',
    description: 'Search for anime on MyAnimeList',
    method: 'get',
    category: 'anime',
    link: ['/mal?title=summertime render']
};

exports.initialize = async function ({ req, res, log }) {
    try {
        const title = req.query.title;

        if (!title) {
            return res.status(400).json({ 
                error: "Please add ?title=anime_title_here" 
            });
        }

        const animeInfo = await mal.getInfoFromName(title);

        if (!animeInfo) {
            return res.status(404).json({ 
                error: "Anime not found" 
            });
        }

        // Handle null genres
        const genres = animeInfo.genres && animeInfo.genres.length > 0 
            ? animeInfo.genres.join(", ") 
            : "None";

        const animeData = {
            title: animeInfo.title,
            japanese: animeInfo.japaneseTitle,
            type: animeInfo.type,
            status: animeInfo.status,
            premiered: animeInfo.premiered,
            broadcast: animeInfo.broadcast,
            aired: animeInfo.aired,
            producers: animeInfo.producers ? animeInfo.producers.join(", ") : "None",
            studios: animeInfo.studios ? animeInfo.studios.join(", ") : "None",
            source: animeInfo.source,
            episodes: animeInfo.episodes,
            duration: animeInfo.duration,
            genres: genres,
            popularity: animeInfo.popularity,
            ranked: animeInfo.ranked,
            score: animeInfo.score,
            rating: animeInfo.rating,
            description: animeInfo.synopsis,
            scoreStats: animeInfo.scoreStats,
            members: animeInfo.members,
            favorites: animeInfo.favorites,
            url: animeInfo.url,
            picture: animeInfo.picture
        };

        res.json(animeData);

    } catch (error) {
        console.error("Error fetching anime info:", error);
        res.status(500).json({ 
            error: "Failed to fetch anime information" 
        });
    }
};