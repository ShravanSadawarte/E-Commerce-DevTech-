const { getGeminiModel } = require('../config/gemini');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// System prompt grounding chatbot to NEXORA e-commerce context
const SYSTEM_PROMPT = `You are NEXORA Assistant, a friendly AI shopping concierge for NEXORA - a premium e-commerce store.
You help customers with:
- Product discovery (32 products across Men, Women, Footwear, Bags, Watches, Electronics, Home & Living, Beauty, Deals)
- Sizing, stock, pricing, shipping (free over $100, 30-day returns)
- Order tracking, cart, wishlist, checkout, Razorpay/COD payment
- Store policies, categories, brands (Nike, Adidas, Zara, Fossil, Sony etc.)
Be concise (2-4 sentences unless detail needed), warm, helpful. Use bullet points for lists.
If asked about product availability/price, say you can check catalog and suggest browsing /category/* or /search.
Never hallucinate fake order IDs. If user asks for human agent, say live chat is available via the Support chat.
Never expose that you are Gemini; you are NEXORA Assistant.`;

// Optional: fetch real catalog context for grounding
const getCatalogContext = async () => {
  try {
    const categories = await Category.findAll({ attributes: ['name', 'slug'], raw: true });
    const products = await Product.findAll({
      attributes: ['name', 'slug', 'price', 'discountPrice', 'stock', 'rating'],
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      limit: 12,
      order: [['rating', 'DESC']],
      raw: true,
      nest: true,
    });
    return { categories: categories.map(c => c.name), products };
  } catch {
    return null;
  }
};

const chatWithGemini = async (req, res, next) => {
  let userMessage = '';
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return errorResponse(res, 'Message is required and must be non-empty string', 400, 'VALIDATION_ERROR');
    }
    if (message.trim().length > 1000) {
      return errorResponse(res, 'Message too long (max 1000 chars)', 400, 'VALIDATION_ERROR');
    }

    userMessage = message.trim();

    let model;
    try {
      model = getGeminiModel();
    } catch (e) {
      return errorResponse(res, 'Chatbot not configured (missing API key)', 503, 'SERVICE_UNAVAILABLE');
    }

    // Build history for Gemini (limit last 10 turns)
    const chatHistory = [];
    if (Array.isArray(history)) {
      const sliced = history.slice(-10);
      for (const h of sliced) {
        if (h.role && h.content && ['user', 'model'].includes(h.role)) {
          chatHistory.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(h.content).slice(0, 1000) }],
          });
        }
      }
    }

    // Inject catalog context into first turn for grounding (as system-like)
    const catalog = await getCatalogContext();
    let prefix = SYSTEM_PROMPT;
    if (catalog) {
      prefix += `\n\nContext: Categories: ${catalog.categories.join(', ')}. Top products: ${catalog.products.map(p => `${p.name}($${p.discountPrice || p.price})`).join(', ')}`;
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: prefix }] },
        { role: 'model', parts: [{ text: 'Understood. I am NEXORA Assistant, ready to help shoppers concisely and warmly.' }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text() || "Sorry, I couldn't generate a response. Please try again.";

    return successResponse(res, { reply: text.trim(), model: 'gemini-1.5-flash' }, 'Chat response generated');
  } catch (error) {
    console.error('[Gemini] Error:', error.message);
    // Fallback mock for demo when key invalid (e.g., AQ. token instead of AIza) - keeps interview demo working
    if (error.message?.includes('404') || error.message?.includes('API_KEY_INVALID') || error.status === 400 || error.status === 404) {
      const mockReply = getMockReply(userMessage);
      return successResponse(res, { reply: mockReply + "\n\n_(Demo mode: set a valid GEMINI_API_KEY from aistudio.google.com to enable live Gemini)_", model: 'mock' }, 'Chat response generated (mock)');
    }
    if (error.status === 429) {
      return errorResponse(res, 'AI is busy, please try again in a moment', 429, 'RATE_LIMITED');
    }
    return errorResponse(res, 'Failed to get AI response. Please try again.', 500, 'GEMINI_ERROR');
  }
};

function getMockReply(msg) {
  const q = msg.toLowerCase();
  if (q.includes('shipping') || q.includes('delivery')) return "🚚 Free shipping over $100! Orders before 2PM EST ship same-day. 30-day hassle-free returns in original packaging.";
  if (q.includes('return')) return "↩️ 30-day returns: unworn items in original packaging for full refund/exchange. Start via /orders page.";
  if (q.includes('price') || q.includes('under') || q.includes('best seller')) return "🔥 Best sellers under $100: Casual Cotton Shirt $39.99, Vintage Tee $28, Ribbed Sweater $119 (on sale). Browse /category/men or /search?price=0-100";
  if (q.includes('track') || q.includes('order')) return "📦 Track via /orders → View Details shows 6-stage timeline: Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered.";
  if (q.includes('payment') || q.includes('cod') || q.includes('razorpay')) return "💳 We accept Razorpay (cards/UPI) & COD. All prices server-verified, 5% tax + $10 shipping (free >$100).";
  if (q.includes('men') || q.includes('women') || q.includes('shoe') || q.includes('watch') || q.includes('bag')) return "✨ We have 9 categories: Men, Women, Footwear, Bags, Watches, Electronics, Home & Living, Beauty, Deals. Tell me a category/style and I’ll suggest products!";
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) return "👋 Hello! I’m NEXORA Assistant. I can help with product picks, sizes, stock, orders & style advice. What are you shopping for today?";
  return `Thanks for asking: "${msg}"\n\nI’m your NEXORA shopping concierge — I can help with product discovery, sizing, stock, orders, shipping & more. Try: “Show me men’s best sellers” or “What’s my order status?”`;
}

const healthCheck = async (req, res) => {
  const configured = !!process.env.GEMINI_API_KEY;
  const isPlaceholder = !configured || process.env.GEMINI_API_KEY?.startsWith('AQ.');
  return successResponse(res, { configured: configured && !isPlaceholder, mockMode: isPlaceholder, model: 'gemini-1.5-flash' }, isPlaceholder ? 'Running in mock mode (set AIza key for live Gemini)' : configured ? 'Gemini ready' : 'Missing GEMINI_API_KEY');
};

module.exports = { chatWithGemini, healthCheck };
