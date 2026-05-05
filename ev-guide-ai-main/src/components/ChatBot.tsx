import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

/* ── EV Knowledge Engine ────────────────────────────────────── */
const evKnowledge: Record<string, { patterns: string[]; response: string }> = {
  greeting: {
    patterns: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'help'],
    response: "Hey! I'm your EV Assistant 🚗⚡ I can help with:\n• Range & battery tips\n• Charging advice\n• Route planning\n• Your vehicle stats\n\nJust ask me anything!",
  },
  range: {
    patterns: ['range', 'how far', 'distance', 'reach', 'make it'],
    response: "🔋 **Range Tips:**\n• Drive in **Eco mode** to gain 5-15% extra range\n• Maintain tire pressure at recommended PSI\n• Pre-condition your cabin while plugged in\n• Avoid speeds above 100 km/h — efficiency drops 15-25%\n• Use regenerative braking aggressively in city traffic",
  },
  charging: {
    patterns: ['charge', 'charging', 'charger', 'plug', 'station', 'fast charge', 'how long'],
    response: "⚡ **Charging Guide:**\n• **CCS2** — fastest (50-150 kW), 20-80% in 30-45 min\n• **Type 2** — AC charging (7-22 kW), full charge in 4-8 hrs\n• **Home charging** — overnight with a 3.3 kW socket\n\n💡 Keep battery between **20-80%** for max lifespan. Avoid charging to 100% daily.",
  },
  battery: {
    patterns: ['battery', 'health', 'degrade', 'degradation', 'lifespan', 'replace'],
    response: "🔋 **Battery Health Tips:**\n• Avoid frequent fast charging — AC is gentler\n• Don't let battery drop below 10% regularly\n• Park in shade during extreme heat (>40°C)\n• Most EV batteries last **8-10 years** or 150,000+ km\n• Degradation of 2-3% per year is normal\n\nOur learning engine tracks your battery health over trips!",
  },
  weather: {
    patterns: ['weather', 'rain', 'cold', 'hot', 'winter', 'summer', 'temperature'],
    response: "🌦️ **Weather Impact on EVs:**\n• **Cold (<10°C):** Range drops 10-25% due to battery heating\n• **Hot (>35°C):** Range drops 5-10% from AC usage\n• **Rain:** Minimal direct impact, but slower speeds help\n• **Headwind:** Can reduce range by 5-8%\n\nOur route planner factors weather into battery predictions!",
  },
  efficiency: {
    patterns: ['efficiency', 'wh/km', 'consumption', 'optimize', 'save', 'eco'],
    response: "🌿 **Efficiency Optimization:**\n• **Eco mode:** Limits motor output for 5% better efficiency\n• **Regenerative braking:** Recover 10-15% energy in city\n• **Constant speed:** Highway at 80 km/h is the sweet spot\n• **Weight:** Every 100 kg extra costs ~1% range\n• **AC/Heating:** Pre-condition while plugged in\n\nYour vehicle's learned efficiency improves with every trip!",
  },
  cost: {
    patterns: ['cost', 'price', 'expensive', 'cheap', 'money', 'save money', 'per km'],
    response: "💰 **EV Running Costs:**\n• Electricity: ₹1-2 per km (vs ₹6-8 for petrol)\n• Home charging: ~₹8/kWh = ₹150 for a full charge\n• Public DC fast charging: ₹15-25/kWh\n• Maintenance: 40% less than ICE (no oil, fewer brakes)\n• Annual savings: ₹50,000-80,000 vs petrol cars",
  },
  carbon: {
    patterns: ['carbon', 'co2', 'emission', 'environment', 'green', 'pollution'],
    response: "🌍 **Carbon Savings:**\n• EVs produce **zero tailpipe emissions**\n• Even with coal-heavy grids, EVs are 30-50% cleaner\n• Average EV saves ~1.5 tonnes CO₂/year vs petrol\n• India's grid is getting greener → EVs get cleaner over time\n\nYour profile tracks your total CO₂ savings from every trip!",
  },
  tata: {
    patterns: ['tata', 'nexon', 'tigor', 'tata ev'],
    response: "🚗 **Tata EVs in our catalog:**\n• **Nexon EV Max** — 40.5 kWh, 437 km range, 93 Wh/km\n• **Nexon EV** — 30.2 kWh, 312 km range, 97 Wh/km\n• **Tigor EV** — 26 kWh, 315 km range, 83 Wh/km\n\nTata has the highest-selling EVs in India!",
  },
  tesla: {
    patterns: ['tesla', 'model 3', 'model y'],
    response: "🚗 **Tesla in our catalog:**\n• **Model 3 Long Range** — 75 kWh, 580 km range, 129 Wh/km\n• **Model Y** — 75 kWh, 533 km range, 141 Wh/km\n\nTesla offers the highest range but costs more per km due to heavier weight.",
  },
  compare: {
    patterns: ['compare', 'best ev', 'which car', 'recommend', 'suggest', 'buy'],
    response: "📊 **Quick Comparison (from our catalog):**\n\n| Best Range | Tesla Model 3 (580 km) |\n| Most Efficient | Tata Tigor (83 Wh/km) |\n| Best Value | Tata Nexon EV (312 km) |\n| Best All-Round | MG ZS EV (461 km) |\n| Biggest Battery | BYD e6 (71.7 kWh) |\n\nAdd your vehicle in Profile → we'll learn its real-world efficiency!",
  },
  learning: {
    patterns: ['learn', 'intelligence', 'ai', 'adapt', 'predict', 'smart', 'improve'],
    response: "🧠 **How our Learning Engine works:**\n1. You plan a trip → we **predict** battery usage\n2. After the trip → you report **actual** usage\n3. Engine calculates: `error = actual - predicted`\n4. Correction: `efficiency += error × 0.1`\n5. Your vehicle model **adapts** over time\n\nAfter 10+ trips, predictions become personalized to YOUR car and driving style!",
  },
  route: {
    patterns: ['route', 'plan', 'trip', 'navigate', 'direction', 'fastest'],
    response: "🗺️ **Route Planning Tips:**\n• We analyze up to **3 alternate routes** per trip\n• Each route shows: distance, duration, battery usage, charging stations\n• The simulator lets you **preview the entire journey** before driving\n• Charging stations are shown along each route with availability\n\nGo to Dashboard → enter source & destination → click Predict Range!",
  },
  simulator: {
    patterns: ['simulat', '3d', 'preview', 'play', 'animation'],
    response: "🎮 **Trip Simulator:**\n• Press ▶ to watch your car drive the planned route\n• Battery drains in real-time as the car moves\n• Green/red dots on the slider show charging stations\n• Scrub to any point to see battery level at that distance\n• Warning appears when battery drops below 20%\n\nIt's in the Dashboard, above the battery card!",
  },
};

const findResponse = (input: string, store: ReturnType<typeof useAppStore.getState>): string => {
  const lower = input.toLowerCase().trim();

  // Check for personal data queries
  if (lower.includes('my vehicle') || lower.includes('my car')) {
    const trips = store.tripHistory;
    if (trips.length > 0) {
      const lastTrip = trips[trips.length - 1];
      return `🚗 **Your Recent Activity:**\n• Last trip: ${lastTrip.source.address.split(',')[0]} → ${lastTrip.destination.address.split(',')[0]}\n• Distance: ${lastTrip.distance} km\n• Battery used: ${lastTrip.batteryUsed}%\n• EV Model: ${lastTrip.evModel}\n• CO₂ saved: ${lastTrip.carbonSaved.toFixed(1)} kg\n\nVisit your **Profile** to manage vehicles and see learned efficiency!`;
    }
    return "You haven't taken any trips yet! Go to **Dashboard** → plan a route → and your vehicle data will start building. Add your vehicle in **Profile** first.";
  }

  if (lower.includes('my trip') || lower.includes('my history') || lower.includes('my stats')) {
    const trips = store.tripHistory;
    if (trips.length === 0) return "No trips recorded yet. Plan your first trip in the **Dashboard**!";
    const totalDist = trips.reduce((a, t) => a + t.distance, 0);
    const totalCO2 = trips.reduce((a, t) => a + t.carbonSaved, 0);
    return `📊 **Your Stats:**\n• Total trips: ${trips.length}\n• Total distance: ${totalDist.toFixed(1)} km\n• Total CO₂ saved: ${totalCO2.toFixed(1)} kg\n• Most used model: ${trips[0]?.evModel || 'N/A'}\n\nKeep driving electric! 🌍⚡`;
  }

  if (lower.includes('battery') && lower.includes('current') || lower.includes('my battery')) {
    return `🔋 Your current battery is set to **${store.batteryPercentage}%**.\n\nYou can adjust it using the slider in the Dashboard route form.`;
  }

  // Match knowledge base
  for (const [, entry] of Object.entries(evKnowledge)) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.response;
    }
  }

  // Fallback
  return "I'm not sure about that, but I can help with:\n• **Range tips** — \"How to increase range?\"\n• **Charging** — \"How long to charge?\"\n• **Battery health** — \"Battery degradation\"\n• **Compare EVs** — \"Which EV is best?\"\n• **Your stats** — \"My trips\" or \"My vehicle\"\n• **Learning engine** — \"How does AI work?\"\n\nTry asking one of these! 😊";
};

/* ── Quick Suggestions ──────────────────────────────────────── */
const quickSuggestions = [
  '🔋 Range tips',
  '⚡ Charging guide',
  '🧠 How does AI work?',
  '📊 My stats',
  '🚗 Compare EVs',
  '💰 Running costs',
];

/* ── Chat Widget Component ──────────────────────────────────── */
export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Hi! I'm your **EV Assistant** ⚡🚗\n\nAsk me about range, charging, battery health, or your trip stats!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const store = useAppStore.getState();
      const response = findResponse(text, store);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  // Simple markdown-ish rendering
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="text-xs bg-black/10 px-1 rounded">$1</code>');

      if (line.startsWith('• ')) {
        processed = `<span class="text-primary">•</span> ${processed.slice(2)}`;
      }
      if (line.startsWith('| ')) {
        const parts = line.split('|').filter(Boolean).map(s => s.trim());
        if (parts.length === 2) {
          processed = `<span class="text-muted-foreground">${parts[0]}</span> → <strong>${parts[1]}</strong>`;
        }
      }

      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    });
  };

  return (
    <>
      {/* ── Floating Button ────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{
          background: isOpen ? '#ef4444' : 'linear-gradient(135deg, #10B981, #059669)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white text-xl">{isOpen ? '✕' : '💬'}</span>
      </motion.button>

      {/* Unread badge */}
      {!isOpen && messages.length <= 1 && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="fixed bottom-[4.5rem] right-6 z-50 bg-primary text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
        >
          Ask me about EVs! ⚡
        </motion.div>
      )}

      {/* ── Chat Window ────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h4 className="text-sm font-display font-bold">EV Assistant</h4>
                <p className="text-xs text-muted-foreground">Powered by EV Intelligence</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    {renderText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickSuggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-xs bg-muted hover:bg-muted/80 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about EVs, range, charging..."
                  className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
                <button type="submit" disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
