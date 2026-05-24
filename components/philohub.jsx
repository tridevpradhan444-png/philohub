"use client";
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
