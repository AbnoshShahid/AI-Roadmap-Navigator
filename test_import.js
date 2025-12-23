try {
    const aiService = require('./server/services/aiService');
    console.log('Successfully imported aiService');
} catch (error) {
    console.error('Import failed:', error);
}
