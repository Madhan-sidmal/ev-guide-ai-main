import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const features = [
  { icon: '⚡', title: 'AI Range Prediction', desc: 'ML-powered battery consumption prediction based on route, weather, and driving patterns.' },
  { icon: '🗺️', title: 'Smart Route Planning', desc: 'Optimized routes considering charging stations, elevation, and traffic conditions.' },
  { icon: '🌦️', title: 'Weather Impact Analysis', desc: 'Real-time weather data integration to predict its effect on your battery.' },
  { icon: '🔋', title: 'Charging Station Finder', desc: 'Find and navigate to the nearest available charging stations along your route.' },
  { icon: '📊', title: 'Battery Analytics', desc: 'Detailed insights into your battery health, consumption patterns, and efficiency.' },
  { icon: '🌍', title: 'Carbon Savings Tracker', desc: 'Track your environmental impact and carbon emissions saved by driving electric.' },
];

const steps = [
  { step: '01', title: 'Enter Your Route', desc: 'Input your source and destination locations.' },
  { step: '02', title: 'Set Battery & EV Model', desc: 'Select your vehicle and current charge level.' },
  { step: '03', title: 'Get AI Prediction', desc: 'Our ML model predicts consumption and suggests optimal routes.' },
  { step: '04', title: 'Drive with Confidence', desc: 'Follow the optimized route with real-time updates.' },
];

const testimonials = [
  { name: 'Arjun Mehta', role: 'Tesla Model 3 Owner', text: 'This app completely changed how I plan long-distance EV trips. The accuracy is incredible.' },
  { name: 'Priya Sharma', role: 'Tata Nexon EV Owner', text: 'The charging station suggestions along the route saved me from range anxiety multiple times.' },
  { name: 'Rahul Verma', role: 'Fleet Manager', text: 'We use this for our entire EV fleet. The analytics dashboard is a game-changer for operations.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI-Powered EV Intelligence
              </span>
            </motion.div>
            <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Plan Smarter EV Trips{' '}
              <span className="gradient-text">with AI</span>
            </motion.h1>
            <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Predict battery consumption, find charging stations, and optimize your routes 
              with machine learning — all in real-time.
            </motion.p>
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5">
                Start Planning →
              </Link>
              <Link to="/signup" className="font-medium text-muted-foreground hover:text-foreground transition-colors px-6 py-3.5">
                Create Free Account
              </Link>
            </motion.div>
          </div>

          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="card-elevated p-2 animate-pulse-glow">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 via-muted to-secondary/10 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🚗⚡</span>
                  <p className="text-muted-foreground text-sm font-medium">Interactive 3D Simulation</p>
                  <Link to="/dashboard" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
                    Try it now →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Intelligent Features
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to drive electric with confidence.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card-elevated p-6 hover:border-primary/20 transition-all"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl lg:text-4xl font-bold mb-4">How It Works</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl lg:text-4xl font-bold text-center mb-16"
          >
            Loved by EV Drivers
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="card-elevated p-6"
              >
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.span variants={fadeUp} custom={0} className="text-5xl block mb-6">🌱</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Drive Green, Drive Smart
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-xl mx-auto mb-4">
              Every optimized trip reduces energy waste. Track your carbon savings and contribute to a sustainable future.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex justify-center gap-8 mt-8">
              {[
                { value: '12M+', label: 'KM Optimized' },
                { value: '3.2K', label: 'Tons CO₂ Saved' },
                { value: '50K+', label: 'EV Drivers' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl p-12 text-center"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Plan Your Next Trip?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Join thousands of EV drivers who plan smarter, drive farther, and save more.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/signup" className="inline-block bg-background text-foreground font-semibold rounded-xl px-8 py-3.5 transition-all hover:shadow-lg">
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-display font-bold text-foreground">EV Range AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 EV Range AI. Driving the future, sustainably.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
