import { useState, useEffect, useRef } from "react";

// ── STORAGE ────────────────────────────────────────────────────────────────────
const VOTE_KEY = "philohub-votes-v1";
async function getVotes() {
  try { const r = await window.storage.get(VOTE_KEY, true); return r ? JSON.parse(r.value) : {}; } catch { return {}; }
}
async function castVote(dilemmaId, name, email, choice) {
  const v = await getVotes();
  if (!v[dilemmaId]) v[dilemmaId] = {};
  const fp = getFingerprint();
  v[dilemmaId][fp] = { name, email, choice, ts: Date.now() };
  await window.storage.set(VOTE_KEY, JSON.stringify(v), true);
  return v[dilemmaId];
}
async function getDilemmaVotes(id) {
  const v = await getVotes(); return v[id] || {};
}
function tally(votes) {
  const counts = {};
  Object.values(votes).forEach(v => { counts[v.choice] = (counts[v.choice] || 0) + 1; });
  return counts;
}
function getFingerprint() {
  const s = [navigator.userAgent, screen.width, screen.height, navigator.language].join("|");
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

// ── DILEMMAS DATA ──────────────────────────────────────────────────────────────
const DILEMMAS = [
  {
    id: "red-blue",
    title: "The Red & Blue Button",
    emoji: "🔴",
    tag: "Social Dilemma",
    trending: true,
    trendReason: "Viral on TikTok — 2.4M views",
    shortDesc: "Press red to save yourself. Press blue to save everyone — but only if everyone agrees.",
    theme: { bg: "#fff8f8", accent: "#e53e3e", secondary: "#3182ce", card: "#fff" },
    options: [
      { id: "red", label: "Red", emoji: "🔴", desc: "You survive no matter what." },
      { id: "blue", label: "Blue", emoji: "🔵", desc: "Everyone survives — if majority chooses this." },
    ],
    explanation: `You're in a room with strangers. Two buttons in front of you.

Press RED → You personally survive, guaranteed. No matter what anyone else does.

Press BLUE → If the MAJORITY of people press blue, everyone survives. But if more people press red than blue, the blue-pressers die.

This is the core of the social dilemma: trust vs. self-preservation. Do you bet on humanity's goodness? Or do you protect yourself?`,
    wiki: `This dilemma is a version of the Prisoner's Dilemma, one of the most studied problems in game theory. It was formalized by mathematicians at RAND Corporation in 1950.

The core tension: individual rational thinking leads to a collectively bad outcome. If everyone thinks "I'll press red just to be safe," everyone loses the collective benefit that blue would have given.

This appears everywhere in real life — climate change, vaccine hesitancy, tax evasion. Everyone benefits if people cooperate, but each individual has an incentive to defect.

Philosopher Jean-Paul Sartre captured it: "Hell is other people" — but so is heaven, if you trust them.`,
    uiType: "buttons",
  },
  {
    id: "trolley",
    title: "The Trolley Problem",
    emoji: "🚃",
    tag: "Moral Philosophy",
    trending: true,
    trendReason: "Trending on YouTube — 5.1M views",
    shortDesc: "Pull a lever to divert a runaway trolley — killing 1 to save 5. Or do nothing.",
    theme: { bg: "#f7f9fc", accent: "#2d3748", secondary: "#e53e3e", card: "#fff" },
    options: [
      { id: "pull", label: "Pull the lever", emoji: "🔧", desc: "Divert the trolley — 1 person dies, 5 are saved." },
      { id: "nothing", label: "Do nothing", emoji: "🙅", desc: "5 people die, but you didn't cause it directly." },
    ],
    explanation: `A trolley is speeding down a track toward 5 people who are tied up and can't move. You're standing next to a lever.

If you PULL the lever → the trolley diverts to a side track where only 1 person is tied up. That person dies. 5 are saved.

If you DO NOTHING → the trolley kills all 5.

Simple math says pull the lever. But here's the twist — you're choosing to actively cause someone's death. Is that murder? Or is doing nothing just as bad?`,
    wiki: `The Trolley Problem was introduced by philosopher Philippa Foot in 1967 and later developed by Judith Jarvis Thomson.

It exposes the tension between two ethical frameworks:

Utilitarianism (Jeremy Bentham, John Stuart Mill): The right action maximizes total well-being. Pull the lever — 5 lives > 1 life.

Deontological Ethics (Immanuel Kant): Some actions are inherently wrong regardless of outcome. Actively killing someone violates their rights, even to save others.

Studies show ~85% of people say pull the lever. But change it to pushing someone off a bridge to stop the trolley — same math, different answer. Why? Because we distinguish between using someone as a means vs. redirecting harm.`,
    uiType: "lever",
  },
  {
    id: "newcomb",
    title: "Newcomb's Problem",
    emoji: "📦",
    tag: "Decision Theory",
    trending: false,
    trendReason: "Philosophy classic",
    shortDesc: "A perfect predictor has already decided what's in the boxes. Do you trust it?",
    theme: { bg: "#fffdf5", accent: "#b7791f", secondary: "#744210", card: "#fff" },
    options: [
      { id: "one", label: "Take only Box B", emoji: "📦", desc: "Trust the predictor. Take the mystery box only." },
      { id: "two", label: "Take both boxes", emoji: "📦📦", desc: "Take both. More is always more — right?" },
    ],
    explanation: `A being called the Predictor — who has NEVER been wrong — presents you with two boxes.

Box A: Always contains ₹1,000. Transparent. You can see it.
Box B: Either contains ₹10,00,000 or nothing. You can't see inside.

The rule: The Predictor already looked into your mind and made its choice BEFORE you walked in.

If it predicted you'd take ONLY Box B → it put ₹10,00,000 inside.
If it predicted you'd take BOTH boxes → Box B is empty.

The Predictor is never wrong. So what do you do?`,
    wiki: `Newcomb's Problem was created by physicist William Newcomb and popularized by philosopher Robert Nozick in 1969.

It divides even the greatest philosophers and mathematicians into two camps:

One-boxers say: The predictor is never wrong. Taking only Box B always results in getting ₹10,00,000. The evidence is overwhelming — trust the predictor.

Two-boxers say: The boxes are already set. Taking both boxes always gives you more than taking one. You can't change what's inside by your choice NOW. This is called the dominance principle.

The paradox: Both arguments seem logically valid. It splits rationalists down the middle. Philosopher David Lewis was a two-boxer. Philosopher Derek Parfit was a one-boxer.

There is no consensus to this day.`,
    uiType: "boxes",
  },
  {
    id: "prisoner",
    title: "Prisoner's Dilemma",
    emoji: "🏛️",
    tag: "Game Theory",
    trending: true,
    trendReason: "Trending — used in economic policy debates",
    shortDesc: "You and a stranger are arrested. Cooperate with each other, or betray for a lighter sentence?",
    theme: { bg: "#f8f9ff", accent: "#553c9a", secondary: "#b794f4", card: "#fff" },
    options: [
      { id: "cooperate", label: "Stay Silent", emoji: "🤝", desc: "Trust your partner. Both get light sentences." },
      { id: "betray", label: "Betray", emoji: "🗣️", desc: "Sell them out. You go free — if they didn't betray you too." },
    ],
    explanation: `You and a partner in crime are arrested and put in separate rooms. You cannot communicate.

The deal:
- If BOTH stay silent → both get 1 year in jail.
- If YOU betray, they stay silent → you go free, they get 10 years.
- If THEY betray, you stay silent → they go free, you get 10 years.
- If BOTH betray → both get 5 years.

The math says betray — no matter what your partner does, betraying is better for YOU personally. But if both think that way, you both get 5 years. Staying silent together gives you just 1 year each.`,
    wiki: `The Prisoner's Dilemma was formalized by Merrill Flood and Melvin Dresher at RAND in 1950, with the story framing added by Albert Tucker.

It's the foundation of modern game theory and explains dozens of real-world problems: nuclear arms races, price wars between companies, doping in sports, and international climate agreements.

The "always betray" strategy is called a Nash Equilibrium — named after mathematician John Nash (of A Beautiful Mind). Neither player can improve by changing strategy alone.

But in REPEATED games, cooperation emerges. Robert Axelrod's famous tournament showed the winning strategy was "Tit for Tat" — cooperate first, then mirror your opponent's last move. Trust, but verify.`,
    uiType: "buttons",
  },
  {
    id: "experience-machine",
    title: "The Experience Machine",
    emoji: "🧠",
    tag: "Hedonism",
    trending: false,
    trendReason: "Philosophy classic",
    shortDesc: "Plug into a simulation of a perfect life. Everything feels real. Do you connect?",
    theme: { bg: "#f5f0ff", accent: "#6b46c1", secondary: "#9f7aea", card: "#fff" },
    options: [
      { id: "plug", label: "Plug in", emoji: "🔌", desc: "Experience a perfect, joyful life — forever." },
      { id: "stay", label: "Stay real", emoji: "🌍", desc: "Keep living reality — struggles and all." },
    ],
    explanation: `Scientists have built an Experience Machine. If you plug in:

→ You'll live a perfect life. Amazing relationships, success, happiness, purpose. Every experience feels completely real.
→ You'll never know you're in a simulation.
→ Your real body floats in a tank. But you feel nothing of that.

The catch: You leave reality behind forever. Whatever you do in there doesn't actually happen. You just experience it.

Do you plug in for a perfect simulated life? Or stay in messy, real, uncertain reality?`,
    wiki: `The Experience Machine was proposed by philosopher Robert Nozick in his 1974 book Anarchy, State, and Utopia.

Nozick created it to challenge hedonism — the view that pleasure and happiness are all that matter.

Most people say they wouldn't plug in. Nozick argued this proves we care about more than just feelings. We want to actually DO things, BE a certain kind of person, and be in contact with a deeper reality.

This thought experiment predicted the entire debate around virtual reality and social media — are we already plugging into curated simulations of life? Is Instagram an Experience Machine?

The Matrix (1999) is essentially this dilemma as a film. Cypher's choice — betraying his team to go back into the Matrix — is the plug-in choice.`,
    uiType: "buttons",
  },
  {
    id: "veil",
    title: "Veil of Ignorance",
    emoji: "⚖️",
    tag: "Political Philosophy",
    trending: false,
    trendReason: "Used in policy debates worldwide",
    shortDesc: "Design a society without knowing where you'll be born in it. Rich or poor, powerful or weak.",
    theme: { bg: "#f0fff4", accent: "#276749", secondary: "#48bb78", card: "#fff" },
    options: [
      { id: "equal", label: "Equal Society", emoji: "🤝", desc: "Everyone gets the same — guaranteed safety for all." },
      { id: "meritocracy", label: "Meritocracy", emoji: "🏆", desc: "Rewards for talent and effort — but you might be at the bottom." },
    ],
    explanation: `Imagine you're about to be born — but you don't know WHO you'll be.

You could be born rich or poor. Healthy or disabled. In India or Iceland. Smart or average. Man or woman.

You get to DESIGN the society you'll be born into. But you have no idea where you'll land in it.

What kind of society do you choose?

Do you create one with strong safety nets and equality — in case you're born poor? Or a competitive meritocracy with huge rewards — betting you'll be talented enough to thrive?`,
    wiki: `The Veil of Ignorance was proposed by philosopher John Rawls in A Theory of Justice (1971) — one of the most influential political philosophy books of the 20th century.

Rawls argued that justice should be designed from this "original position" — behind a veil where you don't know your place in society. He believed rational people would choose:

1. Equal basic liberties for all.
2. Inequalities only if they benefit the least well-off members.

This is called the Difference Principle. It's the philosophical foundation for welfare states, progressive taxation, and universal healthcare.

Critics like Robert Nozick (libertarian) argued people have the right to keep what they earn, regardless of luck. Rawls vs. Nozick is the great debate of 20th century political philosophy.`,
    uiType: "cards",
  },
  {
    id: "heinz",
    title: "Heinz's Dilemma",
    emoji: "💊",
    tag: "Moral Development",
    trending: false,
    trendReason: "Used in psychology research",
    shortDesc: "Your partner is dying. The only medicine costs more than you have. Do you steal it?",
    theme: { bg: "#fff5f5", accent: "#c53030", secondary: "#fc8181", card: "#fff" },
    options: [
      { id: "steal", label: "Steal the medicine", emoji: "💊", desc: "Break the law to save a life." },
      { id: "dont", label: "Don't steal", emoji: "⚖️", desc: "Respect the law — even at this cost." },
    ],
    explanation: `A woman is dying from a rare disease. One drug could save her.

The pharmacist who discovered it is selling it for ₹2,00,000 — 10x what it costs to make.

Her husband Heinz can only raise ₹1,00,000. He begs the pharmacist to sell cheaper or let him pay later. The pharmacist refuses.

Should Heinz break into the pharmacy and steal the drug?

It's not just about yes or no — it's about WHY you answer the way you do. Is saving a life always more important than the law? Does love change the moral calculation?`,
    wiki: `Heinz's Dilemma was created by psychologist Lawrence Kohlberg in the 1950s to study moral development.

Kohlberg wasn't interested in your yes or no — he wanted to know your REASONING. He identified 6 stages of moral development:

Stage 1-2 (Pre-conventional): "He shouldn't steal — he'll go to jail." Self-interest.
Stage 3-4 (Conventional): "Good husbands do everything for their wives" or "Laws exist for a reason." Social norms.
Stage 5-6 (Post-conventional): "Human life has value beyond any law." Universal principles.

Kohlberg argued most adults never reach Stage 5-6. His student Carol Gilligan critiqued him — arguing women reason from care and relationships, not abstract rules. This sparked the "ethics of care" movement.`,
    uiType: "buttons",
  },
  {
    id: "pascal",
    title: "Pascal's Wager",
    emoji: "🙏",
    tag: "Philosophy of Religion",
    trending: true,
    trendReason: "Debated heavily on Reddit r/philosophy",
    shortDesc: "Believe in God or not. The consequences of being wrong are very different.",
    theme: { bg: "#fefcf3", accent: "#744210", secondary: "#d69e2e", card: "#fff" },
    options: [
      { id: "believe", label: "Believe in God", emoji: "🙏", desc: "If God exists, you gain everything. If not, you lose little." },
      { id: "disbelieve", label: "Don't believe", emoji: "🔬", desc: "Live by reason. If God exists, the consequences could be eternal." },
    ],
    explanation: `French mathematician Blaise Pascal made a logical bet about God's existence.

The four possibilities:
1. You believe + God exists → Infinite gain (heaven).
2. You believe + God doesn't exist → Small loss (time spent on religion).
3. You don't believe + God exists → Infinite loss (hell or damnation).
4. You don't believe + God doesn't exist → Small gain (lived freely).

Pascal's logic: Even if the probability of God existing is tiny, the infinite reward/punishment makes believing the rational bet.

It's not about faith — it's pure expected value mathematics. Is that a good reason to believe?`,
    wiki: `Pascal's Wager was formulated by Blaise Pascal in Pensées (1670). Pascal was both a devout Catholic and a mathematical genius who invented probability theory — making this wager uniquely his.

Famous objections:

The Many Gods Problem (Diderot): Which God do you bet on? Choosing the wrong religion might be just as bad as not believing.

The Authenticity Problem: Can you genuinely believe something just because it's strategically smart? Can you "choose" faith?

The Moral Hazard: A God worth worshipping probably wouldn't reward calculated belief over genuine conviction.

William James responded with "The Will to Believe" (1897) — arguing that in genuine uncertainty, we have the right to choose beliefs that help us live and act.`,
    uiType: "buttons",
  },
  {
    id: "ship-theseus",
    title: "Ship of Theseus",
    emoji: "🚢",
    tag: "Identity & Metaphysics",
    trending: true,
    trendReason: "Went viral after WandaVision & multiverse debates",
    shortDesc: "Every plank of a ship is replaced over time. Is it still the same ship?",
    theme: { bg: "#f0f8ff", accent: "#2b6cb0", secondary: "#63b3ed", card: "#fff" },
    options: [
      { id: "same", label: "Still the same ship", emoji: "🚢", desc: "Identity is about continuity, not material." },
      { id: "different", label: "A completely different ship", emoji: "🆕", desc: "If every part is replaced, it's something new." },
    ],
    explanation: `The ancient Greeks told this story:

Theseus had a famous ship. Over centuries, every plank rotted and was replaced — one by one. Eventually, not a single original piece remained.

Is it still the Ship of Theseus?

Now the twist: Someone collected all the old planks and rebuilt the original ship. WHICH ONE is the real Ship of Theseus now?

This isn't just about ships. Every 7 years, most of your body's cells are replaced. Are you the same person you were at age 5?`,
    wiki: `The Ship of Theseus paradox originates in Plutarch's Life of Theseus (75 AD) and has been discussed by philosophers for nearly 2,000 years.

It's fundamentally about personal identity and what makes something "the same thing" over time.

Thomas Hobbes added the twist about rebuilding from original parts in Leviathan (1651).

Key philosophical positions:

Psychological Continuity (Locke, Parfit): What makes you YOU is the continuity of memory and psychology, not your physical substance.

Physical Continuity: Identity requires material continuity. A fully replaced ship is a new ship.

Four-Dimensionalism: Objects are extended through time as well as space. "The ship" is the entire spacetime worm — early and late stages are just parts of one thing.

This dilemma powers debates about: brain transplants, teleportation, digital consciousness, and whether you can ever "go home again."`,
    uiType: "buttons",
  },
  {
    id: "simulation",
    title: "Are We in a Simulation?",
    emoji: "💻",
    tag: "Metaphysics",
    trending: true,
    trendReason: "Elon Musk & Neil deGrasse Tyson made this mainstream",
    shortDesc: "Is our universe a computer simulation run by a more advanced civilization?",
    theme: { bg: "#0f0f1a", accent: "#00ff9f", secondary: "#7928ca", card: "#1a1a2e", textColor: "#e0e0e0" },
    options: [
      { id: "sim", label: "Yes, we're simulated", emoji: "💻", desc: "The math suggests we almost certainly are." },
      { id: "real", label: "No, this is base reality", emoji: "🌌", desc: "Consciousness and physics suggest real existence." },
    ],
    explanation: `Philosopher Nick Bostrom argues at least ONE of these must be true:

1. Almost all civilizations go extinct before becoming technologically advanced enough to run simulations.

2. Advanced civilizations have NO interest in running simulations of their ancestors.

3. We are almost certainly living in a computer simulation right now.

If a civilization can run millions of simulated realities, simulated minds vastly outnumber "real" minds. The probability that YOU are in the base reality approaches zero.

Are you a simulation thinking it's real?`,
    wiki: `Nick Bostrom published "Are You Living in a Computer Simulation?" in 2003, launching a massive resurgence of this idea.

The argument is probabilistic, not mystical. If simulated consciousness is possible, and civilizations eventually simulate their past, simulated minds would outnumber real ones by billions to one.

Physicist Max Tegmark embraces it. Elon Musk says the odds we're NOT in a simulation are "one in billions."

But there are strong objections:

The Computational Cost Problem: Simulating quantum-level physics for an entire universe requires resources possibly beyond any physical limit.

The Consciousness Problem: We don't know if consciousness can be simulated. Philosopher David Chalmers calls this the Hard Problem of Consciousness.

The Regress Problem: If we're simulated, who simulates the simulators?

Interestingly, this dilemma is essentially Pascal's Wager for the digital age.`,
    uiType: "buttons",
  },
];

const TRENDING = DILEMMAS.filter(d => d.trending);

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function PhiloHub() {
  const [page, setPage] = useState("home"); // home | library | dilemma
  const [activeDilemma, setActiveDilemma] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});

  useEffect(() => {
    // Load all vote counts on start
    (async () => {
      const votes = await getVotes();
      const counts = {};
      for (const id in votes) counts[id] = tally(votes[id]);
      setVoteCounts(counts);
    })();
  }, []);

  function openDilemma(d) {
    setActiveDilemma(d);
    setPage("dilemma");
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  function updateCount(id, newVotes) {
    setVoteCounts(prev => ({ ...prev, [id]: tally(newVotes) }));
  }

  const totalVotes = Object.values(voteCounts).reduce((a, c) => a + Object.values(c).reduce((x, y) => x + y, 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" }}>
      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(250,250,248,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e4dc",
        padding: "0 1.5rem", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ fontSize: "1.4rem" }}>⚖️</span>
          <span style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>PhiloHub</span>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <NavBtn active={page === "home"} onClick={() => { setPage("home"); setMenuOpen(false); }}>Home</NavBtn>
          <NavBtn active={page === "library"} onClick={() => { setPage("library"); setMenuOpen(false); }}>All Dilemmas</NavBtn>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: "pointer", padding: "0.5rem", display: "flex", flexDirection: "column", gap: 5, marginLeft: "0.5rem" }}
          >
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 2, background: "#333", borderRadius: 2,
                transform: menuOpen ? (i===0?"rotate(45deg) translate(5px,5px)":i===2?"rotate(-45deg) translate(5px,-5px)":"scaleX(0)") : "none",
                transition: "all 0.2s ease",
              }} />
            ))}
          </div>
        </div>
      </nav>

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 60, right: 0, width: 280, zIndex: 99,
          background: "#fff", borderLeft: "1px solid #e8e4dc", borderBottom: "1px solid #e8e4dc",
          boxShadow: "-4px 4px 20px rgba(0,0,0,0.08)",
          padding: "1.5rem",
        }}>
          <p style={{ color: "#999", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>Explore</p>
          {[
            { icon: "🎮", label: "All Dilemmas", action: () => { setPage("library"); setMenuOpen(false); } },
            { icon: "🔥", label: "Trending Now", action: () => { setPage("home"); setMenuOpen(false); } },
            { icon: "📚", label: "Books & References", action: () => alert("Coming soon! We're curating the best philosophy books.") },
            { icon: "✉️", label: "Contact", action: () => alert("philohub@gmail.com") },
            { icon: "ℹ️", label: "About PhiloHub", action: () => alert("PhiloHub makes philosophy interactive, accessible, and fun. Vote on the greatest dilemmas humanity has ever posed.") },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: "0.8rem",
              padding: "0.75rem 0.5rem", cursor: "pointer",
              borderBottom: "1px solid #f0ece4",
              color: "#333", fontSize: "0.95rem",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f5f0"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <p style={{ color: "#ccc", fontSize: "0.65rem", marginTop: "1.5rem", textAlign: "center" }}>
            {totalVotes.toLocaleString()} votes cast across all dilemmas
          </p>
        </div>
      )}

      {/* PAGES */}
      {page === "home" && <HomePage dilemmas={DILEMMAS} trending={TRENDING} voteCounts={voteCounts} onOpen={openDilemma} />}
      {page === "library" && <LibraryPage dilemmas={DILEMMAS} voteCounts={voteCounts} onOpen={openDilemma} />}
      {page === "dilemma" && activeDilemma && (
        <DilemmaPage
          dilemma={activeDilemma}
          onBack={() => setPage("home")}
          onVoted={(votes) => updateCount(activeDilemma.id, votes)}
          allDilemmas={DILEMMAS}
          onOpen={openDilemma}
        />
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar { width:6px; background:#fafaf8; }
        ::-webkit-scrollbar-thumb { background:#e0dbd0; border-radius:3px; }
      `}</style>
    </div>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────────
function HomePage({ dilemmas, trending, voteCounts, onOpen }) {
  return (
    <div>
      {/* HERO */}
      <div style={{
        padding: "5rem 1.5rem 4rem",
        maxWidth: 700, margin: "0 auto", textAlign: "center",
        animation: "fadeUp 0.7s ease forwards",
      }}>
        <div style={{ display: "inline-block", background: "#f0ece4", borderRadius: 999, padding: "0.3rem 1rem", fontSize: "0.75rem", color: "#666", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
          🔥 {trending.length} dilemmas trending right now
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.8rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1.2rem" }}>
          Philosophy isn't boring.<br />
          <span style={{ color: "#888" }}>It's just never been this fun.</span>
        </h1>
        <p style={{ color: "#666", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Vote on the greatest moral dilemmas humanity has ever posed. See how the world thinks. Discover what your choices say about you.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <PrimaryBtn onClick={() => onOpen(dilemmas[0])}>Try the Red & Blue Dilemma →</PrimaryBtn>
          <SecondaryBtn onClick={() => {}}>Browse All Dilemmas</SecondaryBtn>
        </div>
      </div>

      {/* TRENDING */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <SectionHeader emoji="🔥" title="Trending Now" sub="What the world is debating" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
          {trending.map((d, i) => (
            <DilemmaCard key={d.id} d={d} votes={voteCounts[d.id]} onClick={() => onOpen(d)} delay={i * 80} featured={i === 0} />
          ))}
        </div>
      </div>

      {/* ALL */}
      <div style={{ background: "#f7f5f0", padding: "3rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader emoji="⚡" title="All Dilemmas" sub="Every question. Every vote." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
            {dilemmas.map((d, i) => (
              <SmallCard key={d.id} d={d} votes={voteCounts[d.id]} onClick={() => onOpen(d)} delay={i * 50} />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1a1a1a", color: "#666", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚖️</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>PhiloHub</span>
        </div>
        <p style={{ fontSize: "0.8rem", lineHeight: 1.8, maxWidth: 400, margin: "0 auto 1rem" }}>
          Making philosophy interactive, accessible, and genuinely fun.
          Every dilemma. Every vote. Every perspective.
        </p>
        <p style={{ fontSize: "0.7rem", color: "#444" }}>
          Contact: philohub@gmail.com · Built with curiosity ·{" "}
          <span style={{ color: "#666" }}>No right answers here.</span>
        </p>
      </footer>
    </div>
  );
}

// ── LIBRARY PAGE ───────────────────────────────────────────────────────────────
function LibraryPage({ dilemmas, voteCounts, onOpen }) {
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...new Set(dilemmas.map(d => d.tag))];
  const filtered = filter === "All" ? dilemmas : dilemmas.filter(d => d.tag === filter);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem 4rem", animation: "fadeUp 0.5s ease" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>All Dilemmas</h2>
      <p style={{ color: "#888", marginBottom: "2rem" }}>{dilemmas.length} philosophical questions. Which will you answer?</p>

      {/* Tag filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "0.35rem 0.9rem", borderRadius: 999, border: "1px solid",
            borderColor: filter === t ? "#1a1a1a" : "#ddd",
            background: filter === t ? "#1a1a1a" : "transparent",
            color: filter === t ? "#fff" : "#666",
            fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
        {filtered.map((d, i) => (
          <DilemmaCard key={d.id} d={d} votes={voteCounts[d.id]} onClick={() => onOpen(d)} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

// ── DILEMMA PAGE ───────────────────────────────────────────────────────────────
function DilemmaPage({ dilemma: d, onBack, onVoted, allDilemmas, onOpen }) {
  const [phase, setPhase] = useState("intro"); // intro|form|confirm|result
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formErr, setFormErr] = useState("");
  const [pending, setPending] = useState(null);
  const [choice, setChoice] = useState(null);
  const [votes, setVotes] = useState({});
  const [myPrevVote, setMyPrevVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = d.theme.textColor;

  useEffect(() => {
    (async () => {
      const v = await getDilemmaVotes(d.id);
      setVotes(v);
      const fp = getFingerprint();
      if (v[fp]) { setMyPrevVote(v[fp]); setChoice(v[fp].choice); setPhase("result"); }
      else setPhase("intro");
      setLoading(false);
    })();
  }, [d.id]);

  async function handleVote() {
    setLoading(true);
    const newVotes = await castVote(d.id, name.trim(), email.trim().toLowerCase(), pending);
    setVotes(newVotes); setChoice(pending); onVoted(newVotes); setPhase("result");
    setLoading(false);
  }

  function handleForm() {
    if (!name.trim()) { setFormErr("Please enter your name."); return; }
    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) { setFormErr("Please enter a valid Gmail address."); return; }
    setFormErr(""); setPhase("confirm");
  }

  const tallied = tally(votes);
  const total = Object.values(tallied).reduce((a, b) => a + b, 0);
  const others = allDilemmas.filter(x => x.id !== d.id).sort(() => Math.random() - 0.5).slice(0, 3);

  const bg = d.theme.bg;
  const accent = d.theme.accent;
  const textCol = d.theme.textColor || "#1a1a1a";
  const cardBg = d.theme.card;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: "100vh", color: textCol, animation: "fadeIn 0.4s ease" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* Back */}
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "0.85rem", marginBottom: "2rem", fontFamily: "inherit", padding: 0 }}>
          ← Back to PhiloHub
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ background: accent, color: "#fff", borderRadius: 999, padding: "0.25rem 0.8rem", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "1rem", display: "inline-block" }}>
            {d.tag}
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {d.emoji} {d.title}
          </h1>
          <p style={{ color: isDark ? "#aaa" : "#666", fontSize: "1rem", lineHeight: 1.7 }}>{d.shortDesc}</p>
        </div>

        {/* Explanation */}
        <div style={{ background: cardBg, border: `1px solid ${isDark ? "#2a2a3a" : "#e8e4dc"}`, borderRadius: 12, padding: "1.8rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "1rem" }}>The Scenario</h3>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.9, color: isDark ? "#ccc" : "#333", whiteSpace: "pre-line" }}>
            {d.explanation}
          </div>
        </div>

        {/* VOTING SECTION */}
        {phase === "intro" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: isDark ? "#fff" : "#1a1a1a" }}>
              What would you choose?
            </h3>

            {d.uiType === "boxes" ? (
              <BoxChoice d={d} onPick={opt => { setPending(opt.id); setPhase("form"); }} isDark={isDark} />
            ) : d.uiType === "lever" ? (
              <LeverChoice d={d} onPick={opt => { setPending(opt.id); setPhase("form"); }} isDark={isDark} />
            ) : d.uiType === "cards" ? (
              <CardChoice d={d} onPick={opt => { setPending(opt.id); setPhase("form"); }} isDark={isDark} accent={accent} />
            ) : (
              <ButtonChoice d={d} onPick={opt => { setPending(opt.id); setPhase("form"); }} isDark={isDark} />
            )}
          </div>
        )}

        {phase === "form" && (
          <div style={{ background: cardBg, border: `1px solid ${isDark ? "#2a2a3a" : "#e8e4dc"}`, borderRadius: 12, padding: "1.8rem", animation: "fadeUp 0.4s ease" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.4rem" }}>Almost there</h3>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Tell us who you are before we lock in your choice.</p>

            <FormField label="Your Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
            <FormField label="Gmail Address" value={email} onChange={setEmail} placeholder="you@gmail.com" type="email" />

            {formErr && <p style={{ color: "#e53e3e", fontSize: "0.8rem", marginBottom: "1rem" }}>⚠ {formErr}</p>}

            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <PrimaryBtn onClick={handleForm} accent={accent}>Continue with {d.options.find(o=>o.id===pending)?.label} {d.options.find(o=>o.id===pending)?.emoji}</PrimaryBtn>
              <SecondaryBtn onClick={() => setPhase("intro")}>← Change choice</SecondaryBtn>
            </div>
          </div>
        )}

        {phase === "confirm" && (
          <div style={{ background: cardBg, border: `2px solid ${accent}`, borderRadius: 12, padding: "2rem", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>{d.options.find(o=>o.id===pending)?.emoji}</div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              You're choosing: <span style={{ color: accent }}>{d.options.find(o=>o.id===pending)?.label}</span>
            </h3>
            <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{d.options.find(o=>o.id===pending)?.desc}</p>
            <p style={{ color: "#bbb", fontSize: "0.78rem", marginBottom: "2rem" }}>This is permanent. One vote per device, ever.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <PrimaryBtn onClick={handleVote} accent={accent}>{loading ? "Locking in..." : "Yes, lock in my choice"}</PrimaryBtn>
              <SecondaryBtn onClick={() => setPhase("intro")}>Go back</SecondaryBtn>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {myPrevVote && (
              <div style={{ background: isDark ? "#1a1a2e" : "#f0ece4", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#888" }}>
                You already voted as <strong>{myPrevVote.name}</strong> — showing your previous result.
              </div>
            )}

            <div style={{ background: cardBg, border: `1px solid ${isDark ? "#2a2a3a" : "#e8e4dc"}`, borderRadius: 12, padding: "1.8rem", marginBottom: "1.5rem" }}>
              <p style={{ color: accent, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Your choice</p>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.3rem", color: isDark ? "#fff" : "#1a1a1a" }}>
                {d.options.find(o=>o.id===choice)?.emoji} {d.options.find(o=>o.id===choice)?.label}
              </h2>
              <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2rem" }}>{d.options.find(o=>o.id===choice)?.desc}</p>

              <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", marginBottom: "1.2rem" }}>
                Global Results · {total} votes
              </h4>

              {d.options.map(opt => {
                const count = tallied[opt.id] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const isChosen = opt.id === choice;
                return (
                  <div key={opt.id} style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: isChosen ? 600 : 400, color: isChosen ? accent : (isDark ? "#aaa" : "#555") }}>
                        {opt.emoji} {opt.label} {isChosen && "← your vote"}
                      </span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: isDark ? "#ccc" : "#333" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: isDark ? "#1a1a2e" : "#f0ece4", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: isChosen ? accent : "#ccc", borderRadius: 999, transition: "width 1.2s ease" }} />
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "0.2rem" }}>{count} votes</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WIKI */}
        <div style={{ marginTop: "3rem", background: cardBg, border: `1px solid ${isDark ? "#2a2a3a" : "#e8e4dc"}`, borderRadius: 12, padding: "1.8rem" }}>
          <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "1.2rem" }}>
            📖 The Philosophy Behind It
          </h3>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.9, color: isDark ? "#bbb" : "#444", whiteSpace: "pre-line" }}>
            {d.wiki}
          </div>
        </div>

        {/* MORE DILEMMAS */}
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.2rem", color: isDark ? "#fff" : "#1a1a1a" }}>
            More dilemmas to explore
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.8rem" }}>
            {others.map(o => (
              <div key={o.id} onClick={() => onOpen(o)} style={{
                background: cardBg, border: `1px solid ${isDark ? "#2a2a3a" : "#e8e4dc"}`,
                borderRadius: 10, padding: "1rem", cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{o.emoji}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isDark ? "#ddd" : "#1a1a1a" }}>{o.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#999", marginTop: "0.2rem" }}>{o.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHOICE UIs ─────────────────────────────────────────────────────────────────
function ButtonChoice({ d, onPick, isDark }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {d.options.map(opt => (
        <button key={opt.id} onClick={() => onPick(opt)}
          onMouseEnter={() => setHov(opt.id)} onMouseLeave={() => setHov(null)}
          style={{
            flex: 1, minWidth: 180, padding: "1.4rem 1rem",
            border: `2px solid ${hov === opt.id ? d.theme.accent : (isDark ? "#2a2a3a" : "#e8e4dc")}`,
            borderRadius: 12, background: hov === opt.id ? `${d.theme.accent}10` : (isDark ? d.theme.card : "#fff"),
            cursor: "pointer", textAlign: "center", fontFamily: "inherit",
            transition: "all 0.15s ease",
            transform: hov === opt.id ? "translateY(-3px)" : "none",
            boxShadow: hov === opt.id ? "0 8px 24px rgba(0,0,0,0.1)" : "none",
          }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{opt.emoji}</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.3rem", color: isDark ? "#fff" : "#1a1a1a" }}>{opt.label}</div>
          <div style={{ fontSize: "0.8rem", color: "#888", lineHeight: 1.5 }}>{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}

function BoxChoice({ d, onPick, isDark }) {
  const [hov, setHov] = useState(null);
  const [open, setOpen] = useState(null);
  return (
    <div>
      <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Box A always has ₹1,000 (visible). Box B is a mystery — its contents depend on what the Predictor thinks you'll do.
      </p>
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {/* Box A - transparent */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 120, height: 120, border: "2px dashed #ccc", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(183,121,31,0.05)", fontSize: "0.85rem", color: "#b7791f", fontWeight: 600,
          }}>₹1,000<br/><span style={{fontSize:"0.65rem",color:"#aaa"}}>always here</span></div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#888" }}>Box A (Transparent)</div>
        </div>
        {/* Box B - mystery */}
        <div style={{ textAlign: "center" }}>
          <div
            onMouseEnter={() => setHov("B")} onMouseLeave={() => setHov(null)}
            style={{
              width: 120, height: 120, border: "2px solid #b7791f", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: hov === "B" ? "rgba(183,121,31,0.08)" : "#fffdf5",
              cursor: "pointer", transition: "all 0.2s", fontSize: "2rem",
            }}>
            {hov === "B" ? "❓" : "📦"}
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#888" }}>Box B (Mystery)</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {d.options.map(opt => (
          <button key={opt.id} onClick={() => onPick(opt)} style={{
            flex: 1, minWidth: 180, padding: "1.2rem", border: "2px solid #e8e4dc",
            borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit",
            textAlign: "center", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#b7791f"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e4dc"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{opt.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{opt.label}</div>
            <div style={{ fontSize: "0.78rem", color: "#888" }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LeverChoice({ d, onPick, isDark }) {
  const [hov, setHov] = useState(null);
  const [pulled, setPulled] = useState(false);
  return (
    <div>
      {/* Trolley visual */}
      <div style={{ background: "#f7f9fc", border: "1px solid #e0e8f0", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "1rem", letterSpacing: "0.1em" }}>THE TRACK</div>
        <div style={{ position: "relative", height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Main track */}
          <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "#ccc", top: "50%" }} />
          {/* Side track */}
          <div style={{ position: "absolute", left: "40%", width: "30%", height: 3, background: pulled ? "#e53e3e" : "#ccc", top: "20%", transform: "rotate(-15deg)", transition: "background 0.3s" }} />
          {/* 5 people */}
          <div style={{ position: "absolute", right: "5%", display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: "1rem" }}>🧍</span>)}
          </div>
          {/* 1 person */}
          <div style={{ position: "absolute", right: "30%", top: "5%" }}>
            <span style={{ fontSize: "1rem" }}>🧍</span>
          </div>
          {/* Trolley */}
          <span style={{ fontSize: "1.5rem", position: "absolute", left: "10%" }}>🚃</span>
          {/* Lever */}
          <div
            onClick={() => setPulled(!pulled)}
            style={{
              position: "absolute", left: "38%", cursor: "pointer", fontSize: "1.5rem",
              transform: pulled ? "rotate(-30deg)" : "rotate(0)",
              transition: "transform 0.3s", userSelect: "none",
            }}>🔧</div>
        </div>
        <p style={{ fontSize: "0.72rem", color: "#999", marginTop: "0.5rem" }}>Click the 🔧 to see the lever move</p>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {d.options.map(opt => (
          <button key={opt.id} onClick={() => onPick(opt)} style={{
            flex: 1, minWidth: 180, padding: "1.2rem", border: "2px solid #e0e8f0",
            borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d3748"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e8f0"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{opt.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{opt.label}</div>
            <div style={{ fontSize: "0.78rem", color: "#888" }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CardChoice({ d, onPick, isDark, accent }) {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {d.options.map(opt => (
        <div key={opt.id} onClick={() => onPick(opt)} style={{
          flex: 1, minWidth: 200, padding: "1.5rem", border: "2px solid #e8e4dc",
          borderRadius: 12, background: "#fff", cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e4dc"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>{opt.emoji}</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{opt.label}</div>
          <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.6 }}>{opt.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────────
function DilemmaCard({ d, votes, onClick, delay = 0, featured = false }) {
  const total = votes ? Object.values(votes).reduce((a,b) => a+b, 0) : 0;
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #e8e4dc", borderRadius: 14,
      padding: featured ? "1.8rem" : "1.4rem", cursor: "pointer",
      transition: "all 0.18s ease",
      animation: `fadeUp 0.5s ease ${delay}ms both`,
      gridColumn: featured ? "span 1" : "span 1",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.09)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
        <span style={{ fontSize: featured ? "2.5rem" : "2rem" }}>{d.emoji}</span>
        {d.trending && <span style={{ background: "#fff5f5", color: "#e53e3e", fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: 999, fontWeight: 600 }}>🔥 Trending</span>}
      </div>
      <div style={{ fontSize: "0.65rem", color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{d.tag}</div>
      <h3 style={{ fontSize: featured ? "1.15rem" : "1rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>{d.title}</h3>
      <p style={{ color: "#777", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>{d.shortDesc}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", color: "#bbb" }}>{total > 0 ? `${total.toLocaleString()} votes` : "Be first to vote"}</span>
        {d.trendReason && <span style={{ fontSize: "0.68rem", color: "#aaa" }}>{d.trendReason}</span>}
      </div>
    </div>
  );
}

function SmallCard({ d, votes, onClick, delay = 0 }) {
  const total = votes ? Object.values(votes).reduce((a,b) => a+b, 0) : 0;
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #e8e4dc", borderRadius: 10,
      padding: "1.1rem", cursor: "pointer", transition: "all 0.15s",
      animation: `fadeUp 0.4s ease ${delay}ms both`,
      display: "flex", gap: "0.8rem", alignItems: "flex-start",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.07)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ fontSize: "1.6rem" }}>{d.emoji}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem" }}>{d.title}</div>
        <div style={{ fontSize: "0.7rem", color: "#999" }}>{d.tag} · {total > 0 ? `${total} votes` : "Vote now"}</div>
      </div>
    </div>
  );
}

function SectionHeader({ emoji, title, sub }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.2rem" }}>
        {emoji} {title}
      </h2>
      <p style={{ color: "#999", fontSize: "0.85rem" }}>{sub}</p>
    </div>
  );
}

function PrimaryBtn({ onClick, children, accent = "#1a1a1a" }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? accent : "#1a1a1a", color: "#fff",
      border: "none", borderRadius: 8, padding: "0.75rem 1.5rem",
      fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.15s", transform: hov ? "translateY(-1px)" : "none",
      boxShadow: hov ? "0 4px 14px rgba(0,0,0,0.2)" : "none",
    }}>{children}</button>
  );
}

function SecondaryBtn({ onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: "transparent", color: hov ? "#1a1a1a" : "#888",
      border: "1px solid #ddd", borderRadius: 8, padding: "0.75rem 1.5rem",
      fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

function NavBtn({ onClick, children, active }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: active ? "#1a1a1a" : "#888",
      border: "none", fontSize: "0.88rem", cursor: "pointer",
      fontFamily: "inherit", padding: "0.4rem 0.7rem",
      fontWeight: active ? 600 : 400,
    }}>{children}</button>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{ display: "block", fontSize: "0.72rem", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", border: "1px solid #e0dbd0", borderRadius: 6,
        padding: "0.65rem 0.8rem", fontSize: "0.95rem", fontFamily: "inherit",
        outline: "none", background: "#fafaf8", color: "#1a1a1a",
        transition: "border-color 0.15s",
      }}
        onFocus={e => e.target.style.borderColor = "#1a1a1a"}
        onBlur={e => e.target.style.borderColor = "#e0dbd0"}
      />
    </div>
  );
}