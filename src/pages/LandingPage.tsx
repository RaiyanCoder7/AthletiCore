import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Network,
  Share2,
  Shield,
  Sparkles,
  User,
  Users,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070B0E] text-neutral-100 font-sans selection:bg-[#4ADE80] selection:text-black">
      
      {/* =========================================================
          1. NAVIGATION BAR
         ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070B0E]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Brand Logo with Prominent Favicon */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 shadow-lg shadow-[#22C55E]/20 transition-all duration-300 group-hover:border-[#22C55E] group-hover:shadow-[#22C55E]/40">
              <img
                src="/favicon.svg"
                alt="Athleticore Logo"
                className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.45)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Athleti<span className="text-[#22C55E]">core</span>
            </span>
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#home" className="text-white transition hover:text-[#22C55E]">Home</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#roles" className="transition hover:text-white">For Athletes</a>
            <a href="#roles" className="transition hover:text-white">For Coaches</a>
            <a href="#roles" className="transition hover:text-white">For Managers</a>
            <a href="#about" className="transition hover:text-white">About</a>
          </nav>

          {/* Top-Right Login / Register Flow */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-white/15 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-[#22C55E]/20 transition hover:bg-[#16A34A]"
            >
              Register
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================
          2. HERO SECTION WITH STADIUM OVERLAY & HUD CARDS
         ========================================================= */}
      <section id="home" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-36">
        
        {/* Stadium Floodlight Radial Glows */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22C55E]/10 blur-[180px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">
                THE COMPLETE ATHLETE ECOSYSTEM
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[4rem] leading-[1.08]">
                Train smarter.<br />
                Perform better.<br />
                <span className="text-[#22C55E] drop-shadow-[0_0_25px_rgba(34,197,94,0.35)]">
                  Get discovered.
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-neutral-400">
                Athleticore is the all-in-one platform that helps athletes track their progress, get AI-powered insights, and connect with coaches and managers to unlock their full potential.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#22C55E]/25 transition hover:bg-[#16A34A]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>

                <a
                  href="#features"
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/[0.08]"
                >
                  Explore Athleticore
                </a>
              </div>

              {/* Feature Pill Tags */}
              <div className="flex flex-wrap items-center gap-6 pt-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#22C55E]" />
                  <span>Track Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#22C55E]" />
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#22C55E]" />
                  <span>Build Your Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-[#22C55E]" />
                  <span>Connect &amp; Grow</span>
                </div>
              </div>
            </div>

            {/* Right Side: Hero Visual with Athlete & Live Telemetry Glass Cards */}
            <div className="relative lg:col-span-6 flex items-center justify-center">
              
              {/* Central Athlete Photo */}
              <div className="relative h-[480px] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B1017] shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Athlete Training"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  loading="eager"
                  className="h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070B0E] via-transparent to-black/30" />
              </div>

              {/* Floating Glass Card 1: Fitness Score & Trends */}
              <div className="absolute -top-6 right-2 sm:-right-4 w-60 rounded-2xl border border-white/15 bg-[#0B1017]/85 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Fitness Score</span>
                  <span className="text-[10px] text-neutral-500">Today</span>
                </div>
                
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#22C55E] bg-[#22C55E]/10">
                    <span className="text-lg font-black text-white">87</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#22C55E]">Excellent</span>
                    <p className="text-[10px] text-neutral-400">Top 5% of squad</p>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-neutral-400">
                  <span className="font-semibold text-white">Performance Trends</span>
                  <div className="mt-1.5 flex justify-between">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Speed</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Strength</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Agility</span>
                  </div>
                </div>
              </div>

              {/* Floating Glass Card 2: Mobile Phone Mockup */}
              <div className="absolute -bottom-10 right-0 sm:right-6 w-64 rounded-3xl border border-white/20 bg-black/90 p-4 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-2 border-b border-white/10">
                  <span>Good morning, <strong>Alex</strong></span>
                  <span className="text-[9px] text-[#22C55E]">● LIVE</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                    <span className="text-[9px] text-neutral-400 uppercase">Fitness</span>
                    <p className="text-sm font-black text-[#22C55E]">87 ↑</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                    <span className="text-[9px] text-neutral-400 uppercase">Recovery</span>
                    <p className="text-sm font-black text-cyan-400">82 ↑</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-[#22C55E]/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Speed &amp; Agility</span>
                    <span className="text-[9px] text-neutral-400">60 min</span>
                  </div>
                  <button type="button" className="mt-2 w-full rounded-lg bg-[#22C55E] py-1 text-[10px] font-extrabold text-black">
                    Start Workout
                  </button>
                </div>
              </div>

              {/* Floating Glass Card 3: AI Insights Pill */}
              <div className="absolute bottom-6 -left-6 max-w-xs rounded-2xl border border-white/15 bg-[#0B1017]/90 p-3.5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E]">
                  <Sparkles size={14} />
                  <span>AI Insights</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-300">
                  Your stamina has improved <strong className="text-white">12% this month</strong>. Keep up the high-cadence work!
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          3. WHY ATHLETICORE (COMPETITIVE EDGE GRID)
         ========================================================= */}
      <section id="features" className="border-t border-white/10 bg-[#090D12] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                WHY ATHLETICORE
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                More than just tracking.<br />
                It's your competitive edge.
              </h2>
              <p className="text-sm leading-relaxed text-neutral-400">
                Athleticore combines real data, smart analytics, and a powerful network to help you train smarter, recover faster, and achieve more &mdash; on and off the field.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Real Performance Data</h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Track your progress with accurate training and match biometrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI-Powered Insights</h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Get tailored recommendations based on your unique physiological metrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Complete Athlete Profile</h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Showcase your skills, physical achievements, and combine potential.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  <Network size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Connect &amp; Compete</h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Find trial opportunities, get scouted, and build your professional network.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          4. BUILT FOR EVERYONE (3 EQUALIZED PERSONA CARDS)
         ========================================================= */}
      <section id="roles" className="border-t border-white/10 bg-[#070B0E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
              BUILT FOR EVERYONE IN SPORTS
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Different goals. Same platform.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
            
            {/* 1. Athlete Card */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0B1017] transition-all duration-300 hover:border-[#22C55E]/40 hover:-translate-y-1">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <img
                    src="https://images.pexels.com/photos/37996702/pexels-photo-37996702.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="For Athletes"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1017] via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-base font-bold text-white">
                    <User size={18} className="text-[#22C55E]" />
                    <span>For Athletes</span>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Track your performance</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Get AI-powered insights</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Build your athletic profile</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Reach your goals</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-6">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] transition hover:gap-2.5"
                >
                  <span>Learn More</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* 2. Coach Card */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0B1017] transition-all duration-300 hover:border-[#22C55E]/40 hover:-translate-y-1">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <img
                    src="https://images.pexels.com/photos/32101180/pexels-photo-32101180.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="For Coaches"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1017] via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-base font-bold text-white">
                    <Users size={18} className="text-[#22C55E]" />
                    <span>For Coaches</span>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Monitor your athletes</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Track team performance</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Create training programs</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Build winning teams</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-6">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] transition hover:gap-2.5"
                >
                  <span>Learn More</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* 3. Manager Card */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0B1017] transition-all duration-300 hover:border-[#22C55E]/40 hover:-translate-y-1">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <img
                    src="https://images.pexels.com/photos/31177169/pexels-photo-31177169.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="For Managers"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1017] via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-base font-bold text-white">
                    <Shield size={18} className="text-[#22C55E]" />
                    <span>For Managers</span>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Discover top talent</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Analyze real performance data</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Connect with athletes &amp; coaches</li>
                    <li className="flex items-center gap-2"><span className="text-[#22C55E]">✦</span> Make better decisions</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-6">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] transition hover:gap-2.5"
                >
                  <span>Learn More</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          5. POWERED BY AI (BRAIN TELEMETRY CALLOUT)
         ========================================================= */}
      <section className="border-t border-white/10 bg-[#090D12] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                POWERED BY AI
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Smarter data. Better decisions.
              </h2>
              <p className="text-sm leading-relaxed text-neutral-400">
                Our AI analyzes your performance, training, recovery, and goals to give you personalized insights and recommendations &mdash; so you can focus on what matters most: improving.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-xs font-bold text-black shadow-lg shadow-[#22C55E]/20 transition hover:bg-[#16A34A]"
                >
                  <span>Learn More About AI</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0B1017] p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Performance Analysis</h3>
                    <p className="text-xs text-neutral-400">
                      Your sprint speed has improved by <strong className="text-[#22C55E]">8% this month</strong>. Consider adding 2 more speed sessions per week to maintain this progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-left">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Strengths</span>
                  <span className="text-xs font-bold text-white mt-1 block">Endurance, Agility</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Areas to Improve</span>
                  <span className="text-xs font-bold text-amber-400 mt-1 block">Sprint Speed, Strength</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Recommendation</span>
                  <span className="text-xs font-bold text-[#22C55E] mt-1 block">2x Sprint sessions / week</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          6. HOW IT WORKS (4 NUMBERED STEPS)
         ========================================================= */}
      <section className="border-t border-white/10 bg-[#070B0E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Get started in 4 simple steps
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#22C55E] font-bold text-[#22C55E]">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-white">Create Your Account</p>
                <p className="text-[11px] text-neutral-400">Sign up in seconds</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#22C55E] font-bold text-[#22C55E]">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-white">Choose Your Role</p>
                <p className="text-[11px] text-neutral-400">Athlete, Coach or Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#22C55E] font-bold text-[#22C55E]">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-white">Set Up Your Profile</p>
                <p className="text-[11px] text-neutral-400">Add your details &amp; goals</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#22C55E] font-bold text-[#22C55E]">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-white">Start Your Journey</p>
                <p className="text-[11px] text-neutral-400">Track, improve, achieve</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          7. BOTTOM CALL TO ACTION
         ========================================================= */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0B1017] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">
                YOUR JOURNEY STARTS HERE
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Join Athleticore today and<br />
                unlock your full potential.
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3.5 text-xs font-extrabold text-black shadow-lg shadow-[#22C55E]/20 transition hover:bg-[#16A34A]"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Login
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          8. FOOTER WITH BRAND LOGO
         ========================================================= */}
      <footer className="border-t border-white/10 bg-[#070B0E] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
          
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 p-1 shadow-md shadow-[#22C55E]/10">
              <img
                src="/favicon.svg"
                alt="Athleticore Logo"
                className="h-full w-full object-contain filter drop-shadow-[0_0_6px_rgba(34,197,94,0.3)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-lg font-bold text-white">
              Athleti<span className="text-[#22C55E]">core</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#roles" className="hover:text-white">For Athletes</a>
            <a href="#roles" className="hover:text-white">For Coaches</a>
            <a href="#roles" className="hover:text-white">For Managers</a>
            <a href="#about" className="hover:text-white">About</a>
          </div>

          <p className="text-xs text-neutral-500">
            &copy; 2026 Athleticore. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}