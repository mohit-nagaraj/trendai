export default function isRelevantToFinalRoundAI(trendName:string) {
    const relevantKeywords = [
        'job', 'career', 'interview', 'resume', 'hiring', 'tech', 'coding',
        'programming', 'software', 'developer', 'engineer', 'AI', 'machine learning',
        'data science', 'product manager', 'startup', 'remote work', 'work from home',
        'career change', 'job search', 'linkedin', 'networking', 'salary', 'promotion'
    ];

    return relevantKeywords.some(keyword =>
        trendName.toLowerCase().includes(keyword.toLowerCase())
    );
}