use client";
import { useState, useEffect, useRef } from "react";

// ── STORAGE ────────────────────────────────────────────────────────────────────
const BIN_ID = "6a0ece7fee5a733b12f5d1bf";
const JSONBIN_KEY = "$2a$10$OJZZSYFPcc426UK4.6bAtO/0sydMTnVSl7bbNbr1Z6AI7njOcEW/6";

function getLocal(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setLocal(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

async function getVotes() {
  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, { headers: { "X-Master-Key": JSONBIN_KEY } });
    const d = await r.json(); return d.record || {};
  } catch { return {}; }
}
async function saveVotes(v) {
  try { await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY }, body: JSON.stringify(v) }); } catch {}
}
async function castVote(id, name, email, choice) {
  const v = await getVotes();
  if (!v[id]) v[id] = {};
  v[id][fp()] = { name, email, choice, ts: Date.now() };
  await saveVotes(v); return v[id];
}
async function getDilemmaVotes(id) { const v = await getVotes(); return v[id] || {}; }
function tally(votes) {
  const c = {}; Object.values(votes).forEach(v => { c[v.choice] = (c[v.choice] || 0) + 1; }); return c;
}
function fp() {
  const s = [navigator.userAgent, screen.width, screen.height, navigator.language].join("|");
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return Math.abs(h).toString(36);
}
function getSavedUser() { return getLocal("ph-user"); }
function saveUser(n, e) { setLocal("ph-user", { name: n, email: e }); }

// ── DAILY QUOTES ───────────────────────────────────────────────────────────────
const QUOTES = [
  { q: "God is dead. God remains dead. And we have killed him.", a: "Friedrich Nietzsche", s: "The Gay Science", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "The unexamined life is not worth living.", a: "Socrates", s: "Apology", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Socrate_du_Louvre.jpg/440px-Socrate_du_Louvre.jpg" },
  { q: "One must imagine Sisyphus happy.", a: "Albert Camus", s: "The Myth of Sisyphus", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg/440px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg" },
  { q: "Hell is other people.", a: "Jean-Paul Sartre", s: "No Exit", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Jean-Paul_Sartre_at_Venice_Film_Festival_1967.jpg/440px-Jean-Paul_Sartre_at_Venice_Film_Festival_1967.jpg" },
  { q: "I think therefore I am.", a: "René Descartes", s: "Discourse on the Method", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/440px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg" },
  { q: "The soul becomes dyed with the colour of its thoughts.", a: "Marcus Aurelius", s: "Meditations", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1.jpg/440px-MSR-ra-61-b-1.jpg" },
  { q: "Man is condemned to be free.", a: "Jean-Paul Sartre", s: "Existentialism is a Humanism", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Jean-Paul_Sartre_at_Venice_Film_Festival_1967.jpg/440px-Jean-Paul_Sartre_at_Venice_Film_Festival_1967.jpg" },
  { q: "That which does not kill us makes us stronger.", a: "Friedrich Nietzsche", s: "Twilight of the Idols", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "The mind is everything. What you think you become.", a: "Buddha", s: "Dhammapada", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Buddhacrop.jpg/440px-Buddhacrop.jpg" },
  { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu", s: "Tao Te Ching", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Laozi_-_Project_Gutenberg_eText_15250.jpg/440px-Laozi_-_Project_Gutenberg_eText_15250.jpg" },
  { q: "We are what we repeatedly do. Excellence is not an act, but a habit.", a: "Aristotle", s: "Nicomachean Ethics", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/440px-Aristotle_Altemps_Inv8575.jpg" },
  { q: "Knowing others is wisdom, knowing yourself is enlightenment.", a: "Lao Tzu", s: "Tao Te Ching", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Laozi_-_Project_Gutenberg_eText_15250.jpg/440px-Laozi_-_Project_Gutenberg_eText_15250.jpg" },
  { q: "Courage is knowing what not to fear.", a: "Plato", s: "The Republic", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/440px-Plato_Silanion_Musei_Capitolini_MC1377.jpg" },
  { q: "You have power over your mind, not outside events. Realize this and you will find strength.", a: "Marcus Aurelius", s: "Meditations", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1.jpg/440px-MSR-ra-61-b-1.jpg" },
  { q: "The higher we soar, the smaller we appear to those who cannot fly.", a: "Friedrich Nietzsche", s: "Thus Spoke Zarathustra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "Life is really simple, but we insist on making it complicated.", a: "Confucius", s: "Analects", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/440px-Confucius_Tang_Dynasty.jpg" },
  { q: "Whoever fights monsters should see to it that in the process he does not become a monster.", a: "Friedrich Nietzsche", s: "Beyond Good and Evil", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", a: "Ralph Waldo Emerson", s: "Self-Reliance", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ralph_Waldo_Emerson_ca1857_retouched.jpg/440px-Ralph_Waldo_Emerson_ca1857_retouched.jpg" },
  { q: "Pain is inevitable. Suffering is optional.", a: "Buddha", s: "Dhammapada", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Buddhacrop.jpg/440px-Buddhacrop.jpg" },
  { q: "And if you gaze long into an abyss, the abyss also gazes into you.", a: "Friedrich Nietzsche", s: "Beyond Good and Evil", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius", s: "Analects", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/440px-Confucius_Tang_Dynasty.jpg" },
  { q: "Man is a rope stretched between the animal and the Superman — a rope over an abyss.", a: "Friedrich Nietzsche", s: "Thus Spoke Zarathustra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "Be yourself; everyone else is already taken.", a: "Oscar Wilde", s: "Personal writings", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Oscar_Wilde_3g07095u-adjust.jpg/440px-Oscar_Wilde_3g07095u-adjust.jpg" },
  { q: "We are all in the gutter, but some of us are looking at the stars.", a: "Oscar Wilde", s: "Lady Windermere's Fan", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Oscar_Wilde_3g07095u-adjust.jpg/440px-Oscar_Wilde_3g07095u-adjust.jpg" },
  { q: "To live is the rarest thing in the world. Most people exist, that is all.", a: "Oscar Wilde", s: "The Soul of Man Under Socialism", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Oscar_Wilde_3g07095u-adjust.jpg/440px-Oscar_Wilde_3g07095u-adjust.jpg" },
  { q: "A book must be the axe for the frozen sea within us.", a: "Franz Kafka", s: "Letters to Friends", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1906_portrait.jpg/440px-Franz_Kafka%2C_1906_portrait.jpg" },
  { q: "The meaning of life is that it stops.", a: "Franz Kafka", s: "Personal writings", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1906_portrait.jpg/440px-Franz_Kafka%2C_1906_portrait.jpg" },
  { q: "I am a cage, in search of a bird.", a: "Franz Kafka", s: "Personal writings", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1906_portrait.jpg/440px-Franz_Kafka%2C_1906_portrait.jpg" },
  { q: "Emancipate yourselves from mental slavery. None but ourselves can free our minds.", a: "Bob Marley", s: "Redemption Song", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bob-Marley.jpg/440px-Bob-Marley.jpg" },
  { q: "You must be the change you wish to see in the world.", a: "Mahatma Gandhi", s: "Personal speeches", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg" },
  { q: "Darkness cannot drive out darkness; only light can do that.", a: "Martin Luther King Jr.", s: "Strength to Love", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/440px-Martin_Luther_King%2C_Jr..jpg" },
  { q: "An eye for an eye will only make the whole world blind.", a: "Mahatma Gandhi", s: "Personal writings", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg" },
  { q: "It always seems impossible until it's done.", a: "Nelson Mandela", s: "Personal speeches", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/440px-Nelson_Mandela_1994.jpg" },
  { q: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", a: "Albert Camus", s: "Notebooks", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg/440px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg" },
  { q: "It's not what happens to you but how you react to it that matters.", a: "Epictetus", s: "Enchiridion", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Epicteti_Enchiridion_Latinis_versibus_adumbratum_%28Oxford_1715%29_frontispiece.jpg/440px-Epicteti_Enchiridion_Latinis_versibus_adumbratum_%28Oxford_1715%29_frontispiece.jpg" },
  { q: "No man is free who is not master of himself.", a: "Epictetus", s: "Discourses", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Epicteti_Enchiridion_Latinis_versibus_adumbratum_%28Oxford_1715%29_frontispiece.jpg/440px-Epicteti_Enchiridion_Latinis_versibus_adumbratum_%28Oxford_1715%29_frontispiece.jpg" },
  { q: "And, when you want something, all the universe conspires in helping you to achieve it.", a: "Paulo Coelho", s: "The Alchemist", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Paulo_Coelho_2009.jpg/440px-Paulo_Coelho_2009.jpg" },
  { q: "The secret of life is to fall seven times and to get up eight times.", a: "Paulo Coelho", s: "The Alchemist", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Paulo_Coelho_2009.jpg/440px-Paulo_Coelho_2009.jpg" },
  { q: "Imagination is more important than knowledge.", a: "Albert Einstein", s: "On Science", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/440px-Albert_Einstein_Head.jpg" },
  { q: "Logic will get you from A to B. Imagination will take you everywhere.", a: "Albert Einstein", s: "Personal interviews", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/440px-Albert_Einstein_Head.jpg" },
  { q: "Happiness depends upon ourselves.", a: "Aristotle", s: "Nicomachean Ethics", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/440px-Aristotle_Altemps_Inv8575.jpg" },
  { q: "The more you know, the more you know you don't know.", a: "Aristotle", s: "Metaphysics", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/440px-Aristotle_Altemps_Inv8575.jpg" },
  { q: "Peace comes from within. Do not seek it without.", a: "Buddha", s: "Dhammapada", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Buddhacrop.jpg/440px-Buddhacrop.jpg" },
  { q: "Nature does not hurry, yet everything is accomplished.", a: "Lao Tzu", s: "Tao Te Ching", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Laozi_-_Project_Gutenberg_eText_15250.jpg/440px-Laozi_-_Project_Gutenberg_eText_15250.jpg" },
  { q: "We should consider every day lost on which we have not danced at least once.", a: "Friedrich Nietzsche", s: "Thus Spoke Zarathustra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "Without music, life would be a mistake.", a: "Friedrich Nietzsche", s: "Twilight of the Idols", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/440px-Nietzsche187a.jpg" },
  { q: "Do not go gentle into that good night.", a: "Dylan Thomas", s: "Do Not Go Gentle into That Good Night", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Dylan_Thomas.jpg/440px-Dylan_Thomas.jpg" },
  { q: "I learned that courage was not the absence of fear, but the triumph over it.", a: "Nelson Mandela", s: "Long Walk to Freedom", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/440px-Nelson_Mandela_1994.jpg" },
  { q: "Everything has beauty, but not everyone sees it.", a: "Confucius", s: "Analects", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/440px-Confucius_Tang_Dynasty.jpg" },
  { q: "I went to the woods because I wished to live deliberately.", a: "Henry David Thoreau", s: "Walden", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Henry_David_Thoreau.jpg/440px-Henry_David_Thoreau.jpg" },
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ── ACTIVITIES ─────────────────────────────────────────────────────────────────
const ACTIVITIES = [
  { id: "red-blue", title: "The Red & Blue Button", emoji: "🔴", tag: "Social Dilemma", trending: true, trendReason: "Viral on TikTok", shortDesc: "Press red to save yourself. Press blue to save everyone — but only if everyone agrees.", color: "#dc2626", bg: "linear-gradient(135deg, #7f1d1d, #dc2626)", options: [{ id: "red", label: "Red", emoji: "🔴", desc: "You survive no matter what." }, { id: "blue", label: "Blue", emoji: "🔵", desc: "Everyone survives — if majority chooses this." }], explanation: `You're in a room with strangers. Two buttons in front of you.\n\nPress RED → You personally survive, guaranteed.\n\nPress BLUE → If the MAJORITY press blue, everyone survives. But if more press red, the blue-pressers die.\n\nThis is trust vs. self-preservation. Do you bet on humanity's goodness?`, wiki: `A version of the Prisoner's Dilemma, formalized at RAND Corporation in 1950.\n\nIndividual rational thinking leads to a collectively bad outcome. If everyone presses red "just to be safe," everyone loses the benefit that blue would have given.\n\nThis appears everywhere — climate change, vaccines, tax evasion. Sartre: "Hell is other people" — but so is heaven, if you trust them.`, uiType: "buttons" },
  { id: "trolley", title: "The Trolley Problem", emoji: "🚃", tag: "Moral Philosophy", trending: true, trendReason: "5.1M YouTube views", shortDesc: "Pull a lever to divert a runaway trolley — killing 1 to save 5. Or do nothing.", color: "#1e40af", bg: "linear-gradient(135deg, #1e3a8a, #1e40af)", options: [{ id: "pull", label: "Pull the lever", emoji: "🔧", desc: "1 person dies, 5 are saved." }, { id: "nothing", label: "Do nothing", emoji: "🙅", desc: "5 people die, but you didn't cause it." }], explanation: `A trolley is heading toward 5 people. You're next to a lever.\n\nPull it → 1 person dies, 5 saved.\nDo nothing → 5 people die.\n\nSimple math says pull. But you're actively causing someone's death. Is that murder?`, wiki: `Introduced by Philippa Foot in 1967.\n\nUtilitarianism: Pull — 5 lives > 1.\nKantian Ethics: Some actions are inherently wrong regardless of outcome.\n\n~85% say pull. But push someone off a bridge — same math, different answer. Why? We distinguish between using someone as a means vs. redirecting harm.`, uiType: "lever" },
  { id: "newcomb", title: "Newcomb's Problem", emoji: "📦", tag: "Decision Theory", trending: false, trendReason: "Philosophy classic", shortDesc: "A perfect predictor has already decided what's in the boxes. Do you trust it?", color: "#b45309", bg: "linear-gradient(135deg, #78350f, #b45309)", options: [{ id: "one", label: "Take only Box B", emoji: "📦", desc: "Trust the predictor." }, { id: "two", label: "Take both boxes", emoji: "📦📦", desc: "More is always more — right?" }], explanation: `A Predictor who has NEVER been wrong shows you two boxes.\n\nBox A: Always contains ₹1,000.\nBox B: ₹10,00,000 or nothing — based on what the Predictor thinks you'll do.\n\nIf it predicted you'd take ONLY Box B → ₹10,00,000 inside.\nIf it predicted BOTH → Box B is empty.`, wiki: `Created by William Newcomb, popularized by Robert Nozick in 1969.\n\nOne-boxers: Trust the predictor. Always get ₹10,00,000.\nTwo-boxers: The boxes are already set. Taking both always gives more.\n\nBoth arguments seem valid. No consensus exists. Philosopher David Lewis: two-boxer. Derek Parfit: one-boxer.`, uiType: "boxes" },
  { id: "prisoner", title: "Prisoner's Dilemma", emoji: "🏛️", tag: "Game Theory", trending: true, trendReason: "Used in policy debates", shortDesc: "You and a stranger are arrested. Cooperate or betray for a lighter sentence?", color: "#7c3aed", bg: "linear-gradient(135deg, #4c1d95, #7c3aed)", options: [{ id: "cooperate", label: "Stay Silent", emoji: "🤝", desc: "Trust your partner." }, { id: "betray", label: "Betray", emoji: "🗣️", desc: "Sell them out for freedom." }], explanation: `Arrested in separate rooms. No communication.\n\n- Both silent → 1 year each.\n- You betray, they're silent → you go free, they get 10 years.\n- Both betray → 5 years each.\n\nMath says betray. But if both think that way, 5 years each. Silence together = just 1 year each.`, wiki: `Formalized at RAND in 1950. Foundation of modern game theory.\n\nThe "always betray" strategy is a Nash Equilibrium.\n\nIn repeated games, "Tit for Tat" wins: cooperate first, then mirror opponent's last move. Trust, but verify.`, uiType: "buttons" },
  { id: "experience-machine", title: "The Experience Machine", emoji: "🧠", tag: "Hedonism", trending: false, trendReason: "Philosophy classic", shortDesc: "Plug into a simulation of a perfect life. Everything feels real. Do you connect?", color: "#0891b2", bg: "linear-gradient(135deg, #164e63, #0891b2)", options: [{ id: "plug", label: "Plug in", emoji: "🔌", desc: "Perfect, joyful life — forever." }, { id: "stay", label: "Stay real", emoji: "🌍", desc: "Keep living reality — struggles and all." }], explanation: `Scientists built an Experience Machine:\n→ Perfect life — amazing relationships, success, purpose.\n→ Completely real-feeling.\n→ Your body floats in a tank.\n→ You never know you're simulated.\n\nYou leave reality forever. Do you plug in?`, wiki: `Proposed by Robert Nozick in 1974 to challenge hedonism.\n\nMost people say no. Nozick argues this proves we care about more than feelings — we want to actually DO things.\n\nIs Instagram already an Experience Machine? The Matrix is literally this dilemma as a film.`, uiType: "buttons" },
  { id: "veil", title: "Veil of Ignorance", emoji: "⚖️", tag: "Political Philosophy", trending: false, trendReason: "Policy debates worldwide", shortDesc: "Design a society without knowing where you'll be born in it.", color: "#059669", bg: "linear-gradient(135deg, #064e3b, #059669)", options: [{ id: "equal", label: "Equal Society", emoji: "🤝", desc: "Safety guaranteed for all." }, { id: "meritocracy", label: "Meritocracy", emoji: "🏆", desc: "Rewards for talent — but you might be at the bottom." }], explanation: `You're about to be born — but you don't know who you'll be.\n\nRich or poor. Healthy or disabled. India or Iceland.\n\nYou design the society you'll be born into. But you have no idea where you'll land.\n\nWhat do you choose?`, wiki: `John Rawls, A Theory of Justice (1971).\n\nRational people would choose equal basic liberties and allow inequalities only if they benefit the least well-off — the Difference Principle.\n\nPhilosophical foundation of welfare states and progressive taxation.`, uiType: "cards" },
  { id: "heinz", title: "Heinz's Dilemma", emoji: "💊", tag: "Moral Development", trending: false, trendReason: "Psychology research", shortDesc: "Your partner is dying. The only medicine costs more than you have. Do you steal it?", color: "#dc2626", bg: "linear-gradient(135deg, #7f1d1d, #dc2626)", options: [{ id: "steal", label: "Steal the medicine", emoji: "💊", desc: "Break the law to save a life." }, { id: "dont", label: "Don't steal", emoji: "⚖️", desc: "Respect the law." }], explanation: `A woman is dying. One drug can save her.\n\nPharmacist sells it for ₹2,00,000 — 10x cost.\nHer husband has only ₹1,00,000.\nPharmacist refuses.\n\nShould he steal it?\n\nIt's not just yes or no — it's about WHY.`, wiki: `Created by Lawrence Kohlberg to study moral development.\n\nStage 1-2: Self-interest.\nStage 3-4: Social norms.\nStage 5-6: Universal principles.\n\nMost adults never reach Stage 5-6. Carol Gilligan argued women reason from care, not abstract rules.`, uiType: "buttons" },
  { id: "pascal", title: "Pascal's Wager", emoji: "🙏", tag: "Philosophy of Religion", trending: true, trendReason: "Reddit r/philosophy debate", shortDesc: "Believe in God or not. The consequences of being wrong are very different.", color: "#d97706", bg: "linear-gradient(135deg, #78350f, #d97706)", options: [{ id: "believe", label: "Believe in God", emoji: "🙏", desc: "If God exists, you gain everything." }, { id: "disbelieve", label: "Don't believe", emoji: "🔬", desc: "Live by reason. Risk is eternal." }], explanation: `Pascal's logical bet:\n\n1. Believe + God exists → Infinite gain.\n2. Believe + No God → Small loss.\n3. Don't believe + God exists → Infinite loss.\n4. Don't believe + No God → Small gain.\n\nEven a tiny probability of God makes believing the rational bet. Is math a good reason to believe?`, wiki: `Blaise Pascal, Pensées (1670).\n\nFamous objections:\n- Many Gods Problem: Which God?\n- Authenticity Problem: Can you choose to genuinely believe?\n- A God worth worshipping wouldn't reward calculated belief.`, uiType: "buttons" },
  { id: "ship-theseus", title: "Ship of Theseus", emoji: "🚢", tag: "Identity & Metaphysics", trending: true, trendReason: "Viral after multiverse debates", shortDesc: "Every plank of a ship is replaced. Is it still the same ship?", color: "#0284c7", bg: "linear-gradient(135deg, #0c4a6e, #0284c7)", options: [{ id: "same", label: "Still the same ship", emoji: "🚢", desc: "Identity is about continuity." }, { id: "different", label: "Completely different", emoji: "🆕", desc: "Every part replaced = new ship." }], explanation: `Theseus's ship had every plank replaced over centuries.\n\nIs it still the same ship?\n\nTwist: Someone rebuilt the original from old planks. WHICH ONE is real?\n\nYour body replaces most cells every 7 years. Are you still you?`, wiki: `From Plutarch (75 AD). Discussed for 2,000 years.\n\nPsychological Continuity (Locke, Parfit): Identity = continuity of memory.\nPhysical Continuity: A fully replaced ship is a new ship.\n\nPowers debates about brain transplants, teleportation, digital consciousness.`, uiType: "buttons" },
  { id: "simulation", title: "Are We in a Simulation?", emoji: "💻", tag: "Metaphysics", trending: true, trendReason: "Elon Musk made this mainstream", shortDesc: "Is our universe a computer simulation run by a more advanced civilization?", color: "#00ff9f", bg: "linear-gradient(135deg, #0f0f1a, #1a1a3a)", options: [{ id: "sim", label: "Yes, we're simulated", emoji: "💻", desc: "The math suggests we almost certainly are." }, { id: "real", label: "No, this is real", emoji: "🌌", desc: "Consciousness suggests real existence." }], explanation: `Nick Bostrom argues ONE must be true:\n\n1. Civilizations go extinct before running simulations.\n2. Advanced civilizations don't want to simulate ancestors.\n3. We're almost certainly in a simulation right now.\n\nIf simulated minds outnumber real ones by billions, odds you're in base reality approach zero.`, wiki: `Nick Bostrom, 2003. Elon Musk: odds we're NOT simulated are "one in billions."\n\nStrong objections:\n- Computing quantum physics for a whole universe may be impossible.\n- The Hard Problem of Consciousness.\n- Who simulates the simulators?`, uiType: "buttons" },
];

// ── BOOKS ──────────────────────────────────────────────────────────────────────
const BOOKS = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", cat: "Fiction", desc: "A shepherd boy follows his dream. Simple words, deep meaning about destiny.", cover: "https://covers.openlibrary.org/b/id/8271166-L.jpg", amazon: "https://www.amazon.in/s?k=The+Alchemist+Paulo+Coelho", free: "https://archive.org/details/the-alchemist-paulo-coelho", wiki: "https://en.wikipedia.org/wiki/The_Alchemist_(novel)" },
  { id: 2, title: "The Stranger", author: "Albert Camus", cat: "Fiction", desc: "A man kills someone and feels nothing. A masterpiece about absurdism.", cover: "https://covers.openlibrary.org/b/id/8231541-L.jpg", amazon: "https://www.amazon.in/s?k=The+Stranger+Camus", free: null, wiki: "https://en.wikipedia.org/wiki/The_Stranger_(Camus_novel)" },
  { id: 3, title: "Crime and Punishment", author: "Fyodor Dostoevsky", cat: "Fiction", desc: "A student murders a pawnbroker and collapses under guilt. The greatest psychological novel.", cover: "https://covers.openlibrary.org/b/id/8761830-L.jpg", amazon: "https://www.amazon.in/s?k=Crime+and+Punishment+Dostoevsky", free: "https://www.gutenberg.org/ebooks/2554", wiki: "https://en.wikipedia.org/wiki/Crime_and_Punishment" },
  { id: 4, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", cat: "Fiction", desc: "Three brothers, a murdered father, and every question about God and morality.", cover: "https://covers.openlibrary.org/b/id/8074930-L.jpg", amazon: "https://www.amazon.in/s?k=Brothers+Karamazov+Dostoevsky", free: "https://www.gutenberg.org/ebooks/28054", wiki: "https://en.wikipedia.org/wiki/The_Brothers_Karamazov" },
  { id: 5, title: "White Nights", author: "Fyodor Dostoevsky", cat: "Fiction", desc: "A lonely dreamer falls in love during four magical nights. Short and heartbreaking.", cover: "https://covers.openlibrary.org/b/id/12849850-L.jpg", amazon: "https://www.amazon.in/s?k=White+Nights+Dostoevsky", free: "https://www.gutenberg.org/ebooks/36034", wiki: "https://en.wikipedia.org/wiki/White_Nights_(short_story)" },
  { id: 6, title: "The Trial", author: "Franz Kafka", cat: "Fiction", desc: "A man is arrested for an unknown crime. A terrifying story about bureaucracy and guilt.", cover: "https://covers.openlibrary.org/b/id/8416375-L.jpg", amazon: "https://www.amazon.in/s?k=The+Trial+Kafka", free: "https://www.gutenberg.org/ebooks/7849", wiki: "https://en.wikipedia.org/wiki/The_Trial" },
  { id: 7, title: "The Metamorphosis", author: "Franz Kafka", cat: "Fiction", desc: "A man wakes up as a giant insect. His family's reaction reveals everything about human nature.", cover: "https://covers.openlibrary.org/b/id/8514892-L.jpg", amazon: "https://www.amazon.in/s?k=The+Metamorphosis+Kafka", free: "https://www.gutenberg.org/ebooks/5200", wiki: "https://en.wikipedia.org/wiki/The_Metamorphosis" },
  { id: 8, title: "1984", author: "George Orwell", cat: "Fiction", desc: "Big Brother is watching. The most important political novel ever written.", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", amazon: "https://www.amazon.in/s?k=1984+George+Orwell", free: null, wiki: "https://en.wikipedia.org/wiki/Nineteen_Eighty-Four" },
  { id: 9, title: "Brave New World", author: "Aldous Huxley", cat: "Fiction", desc: "A world of perfect happiness — but at what cost? The scariest dystopia because everyone is happy.", cover: "https://covers.openlibrary.org/b/id/8416375-L.jpg", amazon: "https://www.amazon.in/s?k=Brave+New+World+Huxley", free: null, wiki: "https://en.wikipedia.org/wiki/Brave_New_World" },
  { id: 10, title: "Siddhartha", author: "Hermann Hesse", cat: "Fiction", desc: "A young man leaves everything to find enlightenment. A beautiful Eastern philosophy journey.", cover: "https://covers.openlibrary.org/b/id/8261285-L.jpg", amazon: "https://www.amazon.in/s?k=Siddhartha+Hermann+Hesse", free: "https://www.gutenberg.org/ebooks/2500", wiki: "https://en.wikipedia.org/wiki/Siddhartha_(novel)" },
  { id: 11, title: "The Myth of Sisyphus", author: "Albert Camus", cat: "Modern Philosophy", desc: "Why shouldn't we kill ourselves if life has no meaning? Camus answers brilliantly.", cover: "https://covers.openlibrary.org/b/id/8231900-L.jpg", amazon: "https://www.amazon.in/s?k=The+Myth+of+Sisyphus+Camus", free: null, wiki: "https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus" },
  { id: 12, title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", cat: "Modern Philosophy", desc: "Nietzsche's masterpiece on the Übermensch and eternal recurrence.", cover: "https://covers.openlibrary.org/b/id/8416853-L.jpg", amazon: "https://www.amazon.in/s?k=Thus+Spoke+Zarathustra+Nietzsche", free: "https://www.gutenberg.org/ebooks/1998", wiki: "https://en.wikipedia.org/wiki/Thus_Spoke_Zarathustra" },
  { id: 13, title: "Beyond Good and Evil", author: "Friedrich Nietzsche", cat: "Modern Philosophy", desc: "Nietzsche attacks conventional morality. Dangerous and brilliant.", cover: "https://covers.openlibrary.org/b/id/8263498-L.jpg", amazon: "https://www.amazon.in/s?k=Beyond+Good+Evil+Nietzsche", free: "https://www.gutenberg.org/ebooks/4363", wiki: "https://en.wikipedia.org/wiki/Beyond_Good_and_Evil" },
  { id: 14, title: "The Republic", author: "Plato", cat: "Ancient Philosophy", desc: "What is justice? Plato wrote this 2400 years ago and we're still arguing about it.", cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg", amazon: "https://www.amazon.in/s?k=The+Republic+Plato", free: "https://www.gutenberg.org/ebooks/1497", wiki: "https://en.wikipedia.org/wiki/The_Republic_(Plato)" },
  { id: 15, title: "Meditations", author: "Marcus Aurelius", cat: "Ancient Philosophy", desc: "Private journal of a Roman Emperor. Pure stoic wisdom — written for himself, not for publication.", cover: "https://covers.openlibrary.org/b/id/8739346-L.jpg", amazon: "https://www.amazon.in/s?k=Meditations+Marcus+Aurelius", free: "https://www.gutenberg.org/ebooks/2680", wiki: "https://en.wikipedia.org/wiki/Meditations" },
  { id: 16, title: "Tao Te Ching", author: "Lao Tzu", cat: "Eastern Philosophy", desc: "81 short chapters about existence. Written 2500 years ago, feels like this morning.", cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg", amazon: "https://www.amazon.in/s?k=Tao+Te+Ching+Lao+Tzu", free: "https://www.gutenberg.org/ebooks/216", wiki: "https://en.wikipedia.org/wiki/Tao_Te_Ching" },
  { id: 17, title: "Bhagavad Gita", author: "Vyasa", cat: "Indian Philosophy", desc: "On a battlefield, a warrior loses his nerve. Krishna's advice is all of Hindu philosophy.", cover: "https://covers.openlibrary.org/b/id/8416375-L.jpg", amazon: "https://www.amazon.in/s?k=Bhagavad+Gita", free: "https://www.gutenberg.org/ebooks/2388", wiki: "https://en.wikipedia.org/wiki/Bhagavad_Gita" },
  { id: 18, title: "Sophie's World", author: "Jostein Gaarder", cat: "Fiction", desc: "The entire history of Western philosophy told as a thriller novel. Perfect start.", cover: "https://covers.openlibrary.org/b/id/8516881-L.jpg", amazon: "https://www.amazon.in/s?k=Sophie's+World+Gaarder", free: null, wiki: "https://en.wikipedia.org/wiki/Sophie%27s_World" },
  { id: 19, title: "Man's Search for Meaning", author: "Viktor Frankl", cat: "Modern Philosophy", desc: "A psychiatrist survives the Holocaust and discovers meaning is what keeps us alive.", cover: "https://covers.openlibrary.org/b/id/8516500-L.jpg", amazon: "https://www.amazon.in/s?k=Man's+Search+for+Meaning+Frankl", free: null, wiki: "https://en.wikipedia.org/wiki/Man%27s_Search_for_Meaning" },
  { id: 20, title: "The Art of War", author: "Sun Tzu", cat: "Eastern Philosophy", desc: "Not really about war. A meditation on strategy that applies to everything in life.", cover: "https://covers.openlibrary.org/b/id/8416375-L.jpg", amazon: "https://www.amazon.in/s?k=Art+of+War+Sun+Tzu", free: "https://www.gutenberg.org/ebooks/132", wiki: "https://en.wikipedia.org/wiki/The_Art_of_War" },
  { id: 21, title: "A Theory of Justice", author: "John Rawls", cat: "Political Philosophy", desc: "The book that defined modern liberal political philosophy. Veil of ignorance.", cover: "https://covers.openlibrary.org/b/id/8231800-L.jpg", amazon: "https://www.amazon.in/s?k=Theory+of+Justice+Rawls", free: null, wiki: "https://en.wikipedia.org/wiki/A_Theory_of_Justice" },
  { id: 22, title: "Letters from a Stoic", author: "Seneca", cat: "Ancient Philosophy", desc: "Personal letters from Rome's famous Stoic. Practical wisdom on death, friendship, time.", cover: "https://covers.openlibrary.org/b/id/8739300-L.jpg", amazon: "https://www.amazon.in/s?k=Letters+from+Stoic+Seneca", free: "https://www.gutenberg.org/ebooks/18365", wiki: "https://en.wikipedia.org/wiki/Epistulae_Morales_ad_Lucilium" },
  { id: 23, title: "The Social Contract", author: "Jean-Jacques Rousseau", cat: "Political Philosophy", desc: "Man is born free, and everywhere he is in chains. Inspired the French Revolution.", cover: "https://covers.openlibrary.org/b/id/8091250-L.jpg", amazon: "https://www.amazon.in/s?k=Social+Contract+Rousseau", free: "https://www.gutenberg.org/ebooks/46333", wiki: "https://en.wikipedia.org/wiki/The_Social_Contract" },
  { id: 24, title: "The Communist Manifesto", author: "Karl Marx", cat: "Political Philosophy", desc: "The most influential political document in history, for better or worse.", cover: "https://covers.openlibrary.org/b/id/8091400-L.jpg", amazon: "https://www.amazon.in/s?k=Communist+Manifesto+Marx", free: "https://www.gutenberg.org/ebooks/61", wiki: "https://en.wikipedia.org/wiki/The_Communist_Manifesto" },
  { id: 25, title: "Annihilation of Caste", author: "B.R. Ambedkar", cat: "Indian Philosophy", desc: "The most powerful critique of caste ever written. Banned speech that changed India.", cover: "https://covers.openlibrary.org/b/id/8091500-L.jpg", amazon: "https://www.amazon.in/s?k=Annihilation+of+Caste+Ambedkar", free: "https://www.gutenberg.org/ebooks/11945", wiki: "https://en.wikipedia.org/wiki/Annihilation_of_Caste" },
  { id: 26, title: "The Plague", author: "Albert Camus", cat: "Fiction", desc: "A city quarantined by plague. About solidarity, death, and meaningless suffering.", cover: "https://covers.openlibrary.org/b/id/8231700-L.jpg", amazon: "https://www.amazon.in/s?k=The+Plague+Camus", free: null, wiki: "https://en.wikipedia.org/wiki/The_Plague" },
  { id: 27, title: "Lord of the Flies", author: "William Golding", cat: "Fiction", desc: "Boys stranded on an island. Without society's rules, what happens to human nature?", cover: "https://covers.openlibrary.org/b/id/8231300-L.jpg", amazon: "https://www.amazon.in/s?k=Lord+of+Flies+William+Golding", free: null, wiki: "https://en.wikipedia.org/wiki/Lord_of_the_Flies" },
  { id: 28, title: "The Power of Now", author: "Eckhart Tolle", cat: "Eastern Philosophy", desc: "The only moment that exists is now. A modern spiritual classic about mindfulness.", cover: "https://covers.openlibrary.org/b/id/8516600-L.jpg", amazon: "https://www.amazon.in/s?k=Power+of+Now+Eckhart+Tolle", free: null, wiki: "https://en.wikipedia.org/wiki/The_Power_of_Now" },
  { id: 29, title: "Notes from Underground", author: "Fyodor Dostoevsky", cat: "Fiction", desc: "A bitter, isolated man rants about free will. The first existentialist novel.", cover: "https://covers.openlibrary.org/b/id/8261200-L.jpg", amazon: "https://www.amazon.in/s?k=Notes+from+Underground+Dostoevsky", free: "https://www.gutenberg.org/ebooks/600", wiki: "https://en.wikipedia.org/wiki/Notes_from_Underground" },
  { id: 30, title: "The Road", author: "Cormac McCarthy", cat: "Fiction", desc: "A father and son walk through a destroyed world. The most devastating meditation on love.", cover: "https://covers.openlibrary.org/b/id/8516700-L.jpg", amazon: "https://www.amazon.in/s?k=The+Road+Cormac+McCarthy", free: null, wiki: "https://en.wikipedia.org/wiki/The_Road" },
];

const BOOK_CATS = ["All", "Fiction", "Modern Philosophy", "Ancient Philosophy", "Political Philosophy", "Eastern Philosophy", "Indian Philosophy"];

// ── NIET AI ────────────────────────────────────────────────────────────────────
async function askNiet(question, pageContext) {
  try {
    const res = await fetch("/api/niet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, pageContext }),
    });
    const data = await res.json();
    return data.text || "I couldn't think of an answer. Try again?";
  } catch { return "I'm having trouble connecting. Try again!"; }
}

async function searchYouTube(query) {
  try {
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&maxResults=12`);
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function PhiloHub() {
  const [darkMode, setDarkMode] = useState(true);
  const [page, setPage] = useState("home");
  const [activeActivity, setActiveActivity] = useState(null);
  const [savedUser, setSavedUser] = useState(getSavedUser);
  const [voteCounts, setVoteCounts] = useState({});
  const [settings, setSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

const T = {
    bg: darkMode ? "#0a0a0a" : "#f5f5f0",
    surface: darkMode ? "#141414" : "#ffffff",
    surface2: darkMode ? "#1e1e1e" : "#f0ede6",
    border: darkMode ? "#2a2a2a" : "#e0dbd0",
    text: darkMode ? "#e8e6e0" : "#1a1714",
    muted: darkMode ? "#6b6560" : "#6b6560",
    subtle: darkMode ? "#3a3530" : "#b0aaa0",
    accent: "#d4a853",
    accentDark: "#b8903e",
    nav: darkMode ? "rgba(10,10,10,0.92)" : "rgba(245,245,240,0.92)",
  };

  useEffect(() => {
    (async () => {
      const votes = await getVotes();
      const c = {};
      for (const id in votes) c[id] = tally(votes[id]);
      setVoteCounts(c);
    })();
  }, []);

  function navigate(p, extra) {
    setPage(p); if (extra) setActiveActivity(extra);
    setMenuOpen(false); setSettings(false); window.scrollTo(0, 0);
  }
  function onUserSaved(n, e) { saveUser(n, e); setSavedUser({ name: n, email: e }); }
  function updateCount(id, v) { setVoteCounts(prev => ({ ...prev, [id]: tally(v) })); }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", transition: "background 0.3s, color 0.3s" }}>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: T.nav, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <span style={{ fontSize: "1.4rem" }}>⚖️</span>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.04em", background: `linear-gradient(135deg, ${T.accent}, #e8c87a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PhiloHub</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          {[["home","Home"],["activities","Activities"],["books","Books"],["learn","Learn"],["videos","Videos"]].map(([p,l]) => (
            <button key={p} onClick={() => navigate(p)} style={{ background: page===p?`${T.accent}20`:"transparent", color: page===p?T.accent:T.muted, border: "none", borderRadius: 6, padding: "0.35rem 0.65rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", fontWeight: page===p?700:400, transition: "all 0.15s", display: window.innerWidth < 500 && !["home"].includes(p) ? "none" : "block" }}>{l}</button>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.9rem", marginLeft: "0.3rem" }}>{darkMode?"☀️":"🌙"}</button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.9rem" }}>☰</button>
        </div>
      </nav>

      {/* SIDE MENU */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setMenuOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 60, right: 0, width: 260, background: T.surface, borderLeft: `1px solid ${T.border}`, height: "calc(100vh - 60px)", padding: "1.5rem", overflowY: "auto" }}>
            {savedUser && (
              <div style={{ padding: "0.8rem", background: T.surface2, borderRadius: 10, marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{savedUser.name}</div>
                <div style={{ color: T.muted, fontSize: "0.72rem" }}>{savedUser.email}</div>
              </div>
            )}
            {[
              { icon: "🏠", label: "Home", action: () => navigate("home") },
              { icon: "⚡", label: "Activities", action: () => navigate("activities") },
              { icon: "📚", label: "Books", action: () => navigate("books") },
              { icon: "🏛️", label: "Learn", action: () => navigate("learn") },
              { icon: "🎬", label: "Videos", action: () => navigate("videos") },
              { icon: "⚙️", label: "Settings", action: () => { setSettings(true); setMenuOpen(false); } },
              { icon: "✉️", label: "Contact", action: () => { alert("thephilohub@gmail.com"); setMenuOpen(false); } },
            ].map((item, i) => (
              <div key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 0.5rem", cursor: "pointer", borderBottom: `1px solid ${T.border}`, color: T.text, fontSize: "0.92rem" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {settings && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setSettings(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, margin: "0 auto", background: T.surface, borderRadius: "20px 20px 0 0", padding: "1.5rem", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.5rem" }}>⚙️ Settings</h2>
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: "0.7rem" }}>Appearance</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: "0.9rem" }}>Dark Mode</span>
                <div onClick={() => setDarkMode(!darkMode)} style={{ width: 44, height: 24, borderRadius: 12, background: darkMode ? T.accent : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 2, left: darkMode ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </div>
            </div>
            {savedUser && (
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: "0.7rem" }}>Account</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{savedUser.name}</div>
                    <div style={{ color: T.muted, fontSize: "0.75rem" }}>{savedUser.email}</div>
                  </div>
                  <button onClick={() => { setLocal("ph-user", null); setSavedUser(null); }} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "0.4rem 0.8rem", fontSize: "0.75rem", cursor: "pointer" }}>Sign out</button>
                </div>
              </div>
            )}
            <div style={{ color: T.muted, fontSize: "0.8rem", lineHeight: 1.7 }}>
              PhiloHub — Philosophy for Everyone<br />
              <span style={{ color: T.subtle }}>thephilohub@gmail.com</span>
            </div>
            <button onClick={() => setSettings(false)} style={{ width: "100%", background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 10, padding: "0.9rem", fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, marginTop: "1.2rem" }}>Done</button>
          </div>
        </div>
      )}

{/* PAGES */}
      {page === "home" && <HomePage T={T} darkMode={darkMode} activities={ACTIVITIES} books={BOOKS} voteCounts={voteCounts} onNavigate={navigate} />}
      {page === "activities" && <ActivitiesPage T={T} activities={ACTIVITIES} voteCounts={voteCounts} onOpen={a => navigate("activity", a)} />}
      {page === "activity" && activeActivity && <ActivityPage T={T} activity={activeActivity} onBack={() => navigate("activities")} onVoted={v => updateCount(activeActivity.id, v)} allActivities={ACTIVITIES} onOpen={a => navigate("activity", a)} savedUser={savedUser} onUserSaved={onUserSaved} darkMode={darkMode} />}
      {page === "books" && <BooksPage T={T} books={BOOKS} darkMode={darkMode} />}
      {page === "learn" && <LearnPage T={T} darkMode={darkMode} />}
      {page === "videos" && <VideosPage T={T} darkMode={darkMode} />}

      {/* NIET */}
      <NietAI T={T} darkMode={darkMode} page={page} activeActivity={activeActivity} />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
        img { display:block; }
        a { text-decoration:none; }
      `}</style>
    </div>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────────
function HomePage({ T, darkMode, activities, books, voteCounts, onNavigate }) {
  const quote = getDailyQuote();
  const trending = activities.filter(a => a.trending);
  const lessonProgress = getLocal("ph-lesson-progress", { section: 1, lesson: 1 });

  return (
    <div>
      {/* HERO — Daily Dose */}
      <div style={{ position: "relative", height: "min(520px, 75vw)", overflow: "hidden" }}>
        <img src={quote.img} alt={quote.a} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "brightness(0.35)" }} onError={e => { e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a0a0a 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "2rem 1.5rem", maxWidth: 600, animation: "fadeUp 0.8s ease" }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.3em", color: T.accent, textTransform: "uppercase", marginBottom: "0.8rem", fontWeight: 600 }}>
            Today's Thought · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <p style={{ fontSize: "clamp(1.1rem,3.5vw,1.7rem)", fontStyle: "italic", lineHeight: 1.5, color: "#fff", marginBottom: "0.8rem", fontWeight: 300, letterSpacing: "-0.01em" }}>
            "{quote.q}"
          </p>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
            — <strong style={{ color: "#fff" }}>{quote.a}</strong>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>, {quote.s}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.2rem 4rem" }}>
        {/* Lesson Progress */}
        <div onClick={() => onNavigate("learn")} style={{ margin: "1.5rem 0", padding: "1rem 1.2rem", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🏛️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.65rem", color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Continue Learning</div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem" }}>Section {lessonProgress.section} · Lesson {lessonProgress.lesson}</div>
            <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((lessonProgress.lesson - 1) / 12) * 100}%`, background: `linear-gradient(to right, ${T.accent}, #e8c87a)`, borderRadius: 2 }} />
            </div>
          </div>
          <span style={{ color: T.muted, fontSize: "1.2rem" }}>›</span>
        </div>

        {/* Trending Activities */}
        <Section title="🔥 Trending Activities" action="See all" onAction={() => onNavigate("activities")} T={T}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
            {trending.map((a, i) => {
              const total = voteCounts[a.id] ? Object.values(voteCounts[a.id]).reduce((x,y)=>x+y,0) : 0;
              return (
                <div key={a.id} onClick={() => onNavigate("activity", a)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", height: 180, animation: `fadeUp 0.5s ease ${i*80}ms both` }}
                  onMouseEnter={e => { e.currentTarget.querySelector(".overlay").style.opacity = "1"; e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => { e.currentTarget.querySelector(".overlay").style.opacity = "0"; e.currentTarget.style.transform = "scale(1)"; }}
                  style={{ transition: "transform 0.2s ease", borderRadius: 14, overflow: "hidden", cursor: "pointer", height: 180, animation: `fadeUp 0.5s ease ${i*80}ms both` }}>
                  <div style={{ position: "absolute", inset: 0, background: a.bg }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", opacity: 0, transition: "opacity 0.2s" }} />
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.15)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 999, backdropFilter: "blur(8px)", letterSpacing: "0.1em" }}>🔥 {a.trendReason}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, padding: "1rem" }}>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>{a.tag}</div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", marginBottom: "0.2rem", letterSpacing: "-0.02em" }}>{a.title}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>{total > 0 ? `${total.toLocaleString()} votes` : "Be first to vote"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

{/* Featured Books */}
        <Section title="📚 Featured Books" action="See all" onAction={() => onNavigate("books")} T={T}>
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
            {books.slice(0, 8).map((b, i) => (
              <div key={b.id} style={{ minWidth: 130, flexShrink: 0, cursor: "pointer", animation: `fadeUp 0.5s ease ${i*60}ms both` }}>
                <div style={{ width: 130, height: 190, borderRadius: 8, overflow: "hidden", marginBottom: "0.6rem", background: T.surface2, position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  style={{ transition: "transform 0.2s" }}>
                  <img src={b.cover} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", marginBottom: "0.1rem", lineHeight: 1.3 }}>{b.title}</div>
                <div style={{ fontSize: "0.68rem", color: T.muted }}>{b.author}</div>
                <a href={b.amazon} target="_blank" rel="noreferrer" style={{ fontSize: "0.65rem", color: T.accent, display: "block", marginTop: "0.3rem" }}>Buy →</a>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer style={{ background: darkMode ? "#050505" : "#1a1714", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <span>⚖️</span>
          <span style={{ color: T.accent, fontWeight: 800 }}>PhiloHub</span>
        </div>
        <p style={{ color: "#4a4540", fontSize: "0.78rem" }}>Philosophy for Everyone · thephilohub@gmail.com</p>
      </footer>
    </div>
  );
}

// ── ACTIVITIES PAGE ────────────────────────────────────────────────────────────
function ActivitiesPage({ T, activities, voteCounts, onOpen }) {
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...new Set(activities.map(a => a.tag))];
  const filtered = filter === "All" ? activities : activities.filter(a => a.tag === filter);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.2rem 4rem", animation: "fadeUp 0.5s ease" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.4rem" }}>⚡ Activities</h1>
      <p style={{ color: T.muted, marginBottom: "1.5rem" }}>Vote on the greatest moral dilemmas ever posed.</p>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {tags.map(t => <button key={t} onClick={() => setFilter(t)} style={{ padding: "0.4rem 1rem", borderRadius: 999, border: `1px solid ${filter===t?T.accent:T.border}`, background: filter===t?T.accent:"transparent", color: filter===t?"#0a0a0a":T.muted, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", fontWeight: filter===t?700:400, transition: "all 0.15s" }}>{t}</button>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
        {filtered.map((a, i) => {
          const total = voteCounts[a.id] ? Object.values(voteCounts[a.id]).reduce((x,y)=>x+y,0) : 0;
          return (
            <div key={a.id} onClick={() => onOpen(a)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", height: 200, animation: `fadeUp 0.4s ease ${i*50}ms both`, transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ position: "absolute", inset: 0, background: a.bg }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
              {a.trending && <div style={{ position: "absolute", top: 12, left: 12 }}><span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.15)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 999, backdropFilter: "blur(8px)" }}>🔥 Trending</span></div>}
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "1rem" }}>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>{a.tag}</div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", marginBottom: "0.2rem", letterSpacing: "-0.02em" }}>{a.title}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)" }}>{total > 0 ? `${total} votes` : "Be first to vote"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

