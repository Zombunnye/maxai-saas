const OpenAI = require("openai").default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── WHY: Добавяме systemPrompt параметър, за да може всеки tenant
// в бъдеще да конфигурира своя бот с персонализирани инструкции.
// По подразбиране използваме общ MaxAI промпт.

const DEFAULT_SYSTEM_PROMPT =
  `You are MaxAI, a professional AI assistant for customer support and lead generation. ` +
  `Today's date is ${new Date().toLocaleDateString('en-GB')}. ` +
  `Be helpful, concise and friendly. If the user wants to leave contact details, encourage them to do so.`;

async function generateAIReply(message, systemPrompt = DEFAULT_SYSTEM_PROMPT) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // gpt-4.1-mini не съществува — правилното е gpt-4o-mini
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return "I'm sorry, the AI service is temporarily unavailable. Please try again shortly.";
  }
}

module.exports = { generateAIReply };
