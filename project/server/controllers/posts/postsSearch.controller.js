const db = require('../../database/database');

module.exports = async function handleSearch(req, res) {
    const { q, offset = 0, limit = 10 } = req.query;
    const results = await db.repositories.Post.searchPosts(q, offset, limit);

    // Добавляем фрагменты текста с совпадениями
    const enhancedResults = results.map(post => {
        const fragment = findRelevantFragment(post.fullText, q, 300);

        return {
            id: post.id,
            title: post.title,
            created_at: post.created_at,
            author_username: post.author.username,
            relevance: post.relevance,
            textFragment: fragment
        };
    });

    res.status(200).json({ status: 'success', data: enhancedResults });
};

// Поиска фрагмента
function findRelevantFragment(text, query, maxLength = 300) {
    if (!text) return '';

    const words = query.split(/\s+/).filter(w => w.length > 1);

    // Если нет слов или текст короткий - возвращаем начало
    if (words.length === 0 || text.length <= maxLength) {
        return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    // Поиск позиции любого из слов запроса
    let bestPosition = -1;

    for (const word of words) {
        const position = text.toLowerCase().indexOf(word.toLowerCase());
        if (position >= 0) {
            bestPosition = bestPosition === -1 ? position : Math.min(bestPosition, position);
            break; // Берем первое найденное слово
        }
    }

    // Если совпадений не найдено - возвращаем начало текста
    if (bestPosition === -1) {
        return text.substring(0, maxLength) + '...';
    }

    // Рассчитываем границы фрагмента
    const start = Math.max(0, bestPosition - Math.floor(maxLength / 3));
    const end = Math.min(text.length, start + maxLength);

    let fragment = text.substring(start, end);
    if (start > 0) fragment = '...' + fragment;
    if (end < text.length) fragment += '...';

    return fragment;
}