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

The argument is probabilistic, not mystical. If simulated consciousness is possible, and civilizations eventually simulate their past, simulated minds would outnumber r