exports.calculateOverallSentiment = (paragraphs) => {
   
    if (!paragraphs || paragraphs.length === 0) {
      return 'neutral';
    }
  
    const totalSentiment = paragraphs.reduce((sum, paragraph) => sum + paragraph.sentiment, 0);
    const averageSentiment = totalSentiment / paragraphs.length;
  
    if (averageSentiment > 0) {
      return 'positive';
    } else if (averageSentiment < 0) {
      return 'negative';
    } else {
      return 'neutral';
    }
};
