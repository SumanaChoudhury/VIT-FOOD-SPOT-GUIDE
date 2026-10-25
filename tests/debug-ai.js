const { connectDB } = require('../server/config/db');
const aiService = require('../server/services/aiService');

async function test() {
  await connectDB();

  const queries = [
    'Where can I get biryani from these places?',
    'What food is available near PRP?',
    'What food is available near SJT?',
    'Where can I get coffee?',
    'What can I get under 100?',
    'Tell me about Flora',
    'Where to eat dosa?'
  ];

  for (const q of queries) {
    const res = await aiService.processUserChat(q);
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    console.log(`REPLY:\n${res.reply}`);
    console.log(`PROVIDER: ${res.provider}`);
  }
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
