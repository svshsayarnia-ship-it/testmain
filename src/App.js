import React from 'react';
import { useState, useMemo, useRef } from "react";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_INFO = {
  A1: {
    title: "مبتدی",
    range: "حدود ۵۰۰ تا ۱۰۰۰ واژه",
    desc: "دایره لغات شما شامل کلمات پایه و بسیار پرکاربرد روزمره است.",
    tip: "روی ۱۰۰۰ واژه‌ی پرتکرار زبان انگلیسی (مثل Oxford 3000 سطح ابتدایی) تمرکز کنید.",
  },
  A2: {
    title: "مقدماتی",
    range: "حدود ۱۰۰۰ تا ۲۰۰۰ واژه",
    desc: "می‌توانید در موقعیت‌های ساده و آشنا با واژگان کافی ارتباط برقرار کنید.",
    tip: "واژگان موضوعی (خرید، سفر، خانواده) را با جمله‌سازی تمرین کنید.",
  },
  B1: {
    title: "متوسط",
    range: "حدود ۲۰۰۰ تا ۳۰۰۰ واژه",
    desc: "دامنه واژگانتان برای گفت‌وگوهای روزمره و متون ساده کافی است.",
    tip: "با خواندن متون متوسط و یادداشت واژگان جدید، دایره لغاتتان را گسترش دهید.",
  },
  B2: {
    title: "متوسط رو به بالا",
    range: "حدود ۳۰۰۰ تا ۴۰۰۰ واژه",
    desc: "می‌توانید متون نسبتاً پیچیده را با واژگان متنوع درک کنید.",
    tip: "روی هم‌آیی‌های کلمات (collocations) و مترادف‌ها تمرکز کنید.",
  },
  C1: {
    title: "پیشرفته",
    range: "حدود ۴۰۰۰ تا ۶۰۰۰ واژه",
    desc: "دایره لغات شما شامل واژگان انتزاعی و نیمه‌تخصصی است.",
    tip: "فهرست واژگان آکادمیک (Academic Word List) را مطالعه کنید.",
  },
  C2: {
    title: "تسلط کامل",
    range: "بیش از ۶۰۰۰ واژه",
    desc: "دامنه واژگانتان نزدیک به یک فرد بومی تحصیل‌کرده است.",
    tip: "با مطالعه ادبیات و متون تخصصی، دقت و ظرافت واژگانی خود را حفظ کنید.",
  },
};

// Vocabulary bank aligned to CEFR levels (word-meaning matching)
const BANK = {
  A1: [
    { q: "happy", options: ["feeling good", "feeling tired", "feeling angry", "feeling cold"], a: 0 },
    { q: "big", options: ["large in size", "small in size", "very old", "very fast"], a: 0 },
    { q: "friend", options: ["a person you like and know well", "a type of food", "a place to sleep", "a kind of animal"], a: 0 },
    { q: "cold", options: ["having a low temperature", "having a high temperature", "being very tall", "being very heavy"], a: 0 },
    { q: "book", options: ["something you read", "something you eat", "something you wear", "something you drive"], a: 0 },
    { q: "run", options: ["to move quickly on foot", "to sit quietly", "to sleep deeply", "to speak loudly"], a: 0 },
    { q: "family", options: ["parents and children living together", "a group of strangers", "a type of job", "a kind of weather"], a: 0 },
    { q: "water", options: ["a clear liquid we drink", "a solid food", "a type of music", "a kind of clothing"], a: 0 },
    { q: "morning", options: ["the early part of the day", "the middle of the night", "the end of the week", "a type of meal"], a: 0 },
    { q: "shop", options: ["a place where you buy things", "a place where you sleep", "a place where you study", "a place where you swim"], a: 0 },
    { q: "quiet", options: ["making very little noise", "making a lot of noise", "moving very fast", "feeling very hungry"], a: 0 },
    { q: "kitchen", options: ["a room where you cook food", "a room where you sleep", "a room where you study", "a room where you park a car"], a: 0 },
  ],
  A2: [
    { q: "borrow", options: ["to take something and give it back later", "to buy something for good", "to throw something away", "to hide something"], a: 0 },
    { q: "expensive", options: ["costing a lot of money", "costing very little money", "having a nice colour", "being very light"], a: 0 },
    { q: "arrive", options: ["to reach a place", "to leave a place", "to lose something", "to build something"], a: 0 },
    { q: "difficult", options: ["not easy to do or understand", "very easy to do", "very interesting", "very colourful"], a: 0 },
    { q: "polite", options: ["having good manners", "being very loud", "being very tired", "being very fast"], a: 0 },
    { q: "guess", options: ["to give an answer without being sure", "to know something for certain", "to write something down", "to forget something"], a: 0 },
    { q: "improve", options: ["to become better", "to become worse", "to stay the same", "to disappear"], a: 0 },
    { q: "crowded", options: ["full of people", "completely empty", "very quiet", "very clean"], a: 0 },
    { q: "nervous", options: ["feeling worried or afraid", "feeling very happy", "feeling very tired", "feeling very hungry"], a: 0 },
    { q: "invite", options: ["to ask someone to come to an event", "to refuse someone's offer", "to ignore someone", "to argue with someone"], a: 0 },
    { q: "compare", options: ["to look at two things to see how they differ", "to throw two things away", "to hide two things", "to sell two things"], a: 0 },
    { q: "wonder", options: ["to want to know something", "to be completely sure of something", "to forget something quickly", "to refuse something"], a: 0 },
  ],
  B1: [
    { q: "achieve", options: ["to succeed in doing something after effort", "to fail at something", "to avoid doing something", "to copy someone else"], a: 0 },
    { q: "reliable", options: ["able to be trusted", "impossible to trust", "very expensive", "very rare"], a: 0 },
    { q: "postpone", options: ["to delay something to a later time", "to finish something early", "to cancel something forever", "to repeat something"], a: 0 },
    { q: "generous", options: ["willing to give more than expected", "unwilling to share anything", "very careful with money", "very shy"], a: 0 },
    { q: "confident", options: ["feeling sure of yourself", "feeling very nervous", "feeling very tired", "feeling very confused"], a: 0 },
    { q: "opportunity", options: ["a chance to do something", "a mistake you make", "a rule you must follow", "a place you visit"], a: 0 },
    { q: "encourage", options: ["to give someone support or confidence", "to stop someone from doing something", "to criticise someone harshly", "to ignore someone"], a: 0 },
    { q: "avoid", options: ["to stay away from something", "to search for something", "to enjoy something", "to repair something"], a: 0 },
    { q: "solution", options: ["an answer to a problem", "a cause of a problem", "a type of question", "a kind of mistake"], a: 0 },
    { q: "curious", options: ["eager to know or learn something", "not interested in anything", "feeling very tired", "feeling very angry"], a: 0 },
    { q: "responsible", options: ["having a duty to deal with something", "having no duties at all", "being completely free", "being very lazy"], a: 0 },
    { q: "similar", options: ["almost the same as something else", "completely different from something else", "much bigger than something else", "much older than something else"], a: 0 },
  ],
  B2: [
    { q: "ambiguous", options: ["having more than one possible meaning", "having only one clear meaning", "having no meaning at all", "being extremely simple"], a: 0 },
    { q: "reluctant", options: ["unwilling to do something", "very eager to do something", "unable to do anything", "certain about something"], a: 0 },
    { q: "consequence", options: ["a result of an action", "the beginning of an action", "a plan for an action", "a type of question"], a: 0 },
    { q: "substantial", options: ["large in amount or importance", "very small or unimportant", "temporary and brief", "hidden from view"], a: 0 },
    { q: "vague", options: ["not clear or precise", "extremely clear and detailed", "very loud", "very colourful"], a: 0 },
    { q: "persuade", options: ["to convince someone to do something", "to prevent someone from doing something", "to ignore someone's opinion", "to copy someone's idea"], a: 0 },
    { q: "inevitable", options: ["certain to happen, unavoidable", "very unlikely to happen", "already finished", "completely optional"], a: 0 },
    { q: "contradict", options: ["to say the opposite of what someone said", "to agree completely with someone", "to repeat what someone said", "to ignore what someone said"], a: 0 },
    { q: "diminish", options: ["to become or make smaller", "to become or make larger", "to stay exactly the same", "to disappear instantly"], a: 0 },
    { q: "coincidence", options: ["two events happening by chance at the same time", "a plan made carefully in advance", "a rule that must be followed", "a mistake made on purpose"], a: 0 },
    { q: "assumption", options: ["something believed to be true without proof", "something proven with clear evidence", "a question with no answer", "a fact everyone agrees on"], a: 0 },
    { q: "tolerate", options: ["to accept something you don't like without complaint", "to refuse something completely", "to enjoy something greatly", "to forget something quickly"], a: 0 },
  ],
  C1: [
    { q: "meticulous", options: ["extremely careful and precise about details", "careless and disorganised", "quick but sloppy", "indifferent to details"], a: 0 },
    { q: "ambivalent", options: ["having mixed feelings about something", "being completely certain about something", "feeling no emotion at all", "being extremely enthusiastic"], a: 0 },
    { q: "pragmatic", options: ["dealing with things sensibly and practically", "dealing with things emotionally", "dealing with things carelessly", "dealing with things dishonestly"], a: 0 },
    { q: "eloquent", options: ["fluent and persuasive in speech", "quiet and unable to speak well", "rude in conversation", "confused when speaking"], a: 0 },
    { q: "resilient", options: ["able to recover quickly from difficulties", "easily damaged or broken", "unable to change at all", "always giving up quickly"], a: 0 },
    { q: "candid", options: ["honest and direct, without hiding anything", "secretive and dishonest", "overly formal and distant", "confused and unclear"], a: 0 },
    { q: "plausible", options: ["seeming reasonable or probable", "clearly impossible", "completely certain", "entirely fictional"], a: 0 },
    { q: "arbitrary", options: ["based on random choice, not reason", "based on careful, logical reasoning", "agreed on by everyone", "required by law"], a: 0 },
    { q: "coherent", options: ["logical and consistent", "confusing and disconnected", "extremely short", "written in a foreign language"], a: 0 },
    { q: "notorious", options: ["famous for something bad", "famous for something good", "completely unknown", "recently discovered"], a: 0 },
    { q: "subtle", options: ["not obvious, delicate", "extremely obvious and loud", "very large in scale", "completely absent"], a: 0 },
    { q: "prevalent", options: ["widespread, common at a particular time", "extremely rare and unusual", "found in only one place", "no longer existing"], a: 0 },
  ],
  C2: [
    { q: "ephemeral", options: ["lasting for a very short time", "lasting forever", "extremely heavy", "impossible to see"], a: 0 },
    { q: "ubiquitous", options: ["present everywhere", "found in only one location", "recently invented", "very difficult to find"], a: 0 },
    { q: "esoteric", options: ["understood by only a small number of people", "understood easily by everyone", "loudly announced in public", "translated into many languages"], a: 0 },
    { q: "cacophony", options: ["a harsh mixture of loud sounds", "a pleasant, harmonious melody", "complete silence", "a single quiet note"], a: 0 },
    { q: "quintessential", options: ["representing the most perfect example of something", "being a poor imitation of something", "being entirely unrelated to something", "being the very first of its kind"], a: 0 },
    { q: "vindicate", options: ["to clear someone of blame after being proven right", "to blame someone unfairly", "to punish someone severely", "to ignore someone's claims"], a: 0 },
    { q: "surreptitious", options: ["done secretly", "done openly and publicly", "done very slowly", "done with great enthusiasm"], a: 0 },
    { q: "obsequious", options: ["excessively eager to please", "completely indifferent to others", "openly hostile and rude", "calm and reserved"], a: 0 },
    { q: "cogent", options: ["clear, logical, and convincing", "confusing and illogical", "extremely emotional", "vague and uncertain"], a: 0 },
    { q: "recalcitrant", options: ["stubbornly resistant to authority", "eager to obey and cooperate", "indifferent and passive", "easily persuaded"], a: 0 },
    { q: "sanguine", options: ["optimistic, positive", "pessimistic, gloomy", "angry and aggressive", "confused and lost"], a: 0 },
    { q: "perfunctory", options: ["done without care or interest, as a routine", "done with great enthusiasm and care", "done for the very first time", "done in a highly creative way"], a: 0 },
  ],
};

const TOTAL_QUESTIONS = 16;

function shuffleOptions(data) {
  const idxs = [0, 1, 2, 3];
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  return {
    q: data.q,
    options: idxs.map((i) => data.options[i]),
    a: idxs.indexOf(data.a),
  };
}

function pickQuestion(levelIdx, used) {
  const order = [levelIdx, levelIdx - 1, levelIdx + 1, levelIdx - 2, levelIdx + 2, levelIdx - 3, levelIdx + 3];
  for (const idx of order) {
    if (idx < 0 || idx > 5) continue;
    const level = LEVELS[idx];
    const pool = BANK[level].filter((_, i) => !used.has(`${level}-${i}`));
    if (pool.length > 0) {
      const i = BANK[level].indexOf(pool[Math.floor(Math.random() * pool.length)]);
      return { level, index: i, data: shuffleOptions(BANK[level][i]) };
    }
  }
  return null;
}

export default function App() {
  const [stage, setStage] = useState("start"); // start | test | result
  const [levelIdx, setLevelIdx] = useState(2); // start at B1
  const [used, setUsed] = useState(new Set());
  const [current, setCurrent] = useState(null);
  const [asked, setAsked] = useState(0);
  const [history, setHistory] = useState([]); // {levelIdx, correct}
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef(null);

  const startTest = () => {
    const first = pickQuestion(2, new Set());
    setUsed(new Set([`${first.level}-${first.index}`]));
    setCurrent(first);
    setLevelIdx(2);
    setAsked(1);
    setHistory([]);
    setSelected(null);
    setLocked(false);
    setStage("test");
  };

  const finalLevel = useMemo(() => {
    if (history.length === 0) return "B1";
    const recent = history.slice(-8);
    const avg = recent.reduce((s, h) => s + h.levelIdx, 0) / recent.length;
    return LEVELS[Math.round(Math.min(5, Math.max(0, avg)))];
  }, [history]);

  const scorePct = useMemo(() => {
    if (history.length === 0) return 0;
    const correct = history.filter((h) => h.correct).length;
    return Math.round((correct / history.length) * 100);
  }, [history]);

  const answer = (optIdx) => {
    if (locked) return;
    setLocked(true);
    setSelected(optIdx);
    const correct = optIdx === current.data.a;
    const curLevelIdx = LEVELS.indexOf(current.level);
    const newHistory = [...history, { levelIdx: curLevelIdx, correct }];
    setHistory(newHistory);

    const nextLevelIdx = Math.min(5, Math.max(0, curLevelIdx + (correct ? 1 : -1)));

    timeoutRef.current = setTimeout(() => {
      if (asked >= TOTAL_QUESTIONS) {
        setStage("result");
        return;
      }
      const next = pickQuestion(nextLevelIdx, used);
      if (!next) {
        setStage("result");
        return;
      }
      setUsed((prev) => new Set(prev).add(`${next.level}-${next.index}`));
      setCurrent(next);
      setLevelIdx(nextLevelIdx);
      setAsked((n) => n + 1);
      setSelected(null);
      setLocked(false);
    }, 800);
  };

  const restart = () => {
    clearTimeout(timeoutRef.current);
    setStage("start");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: "#EFF3EE",
        fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        @keyframes stampIn {
          0% { transform: scale(1.4) rotate(-8deg); opacity: 0; }
          60% { transform: scale(0.95) rotate(-8deg); opacity: 1; }
          100% { transform: scale(1) rotate(-8deg); opacity: 1; }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fadeUp { animation: fadeUp 0.35s ease both; }
        .stampAnim { animation: stampIn 0.6s cubic-bezier(.2,.9,.3,1.2) both; }
      `}</style>

      <div className="w-full max-w-md">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FBFCFA",
            border: "1px solid #D7E0D4",
            boxShadow: "0 20px 50px -20px rgba(30,58,42,0.3)",
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5" style={{ background: "#1F3A2A", color: "#EFF3EE" }}>
            <p className="text-xs tracking-widest opacity-70 mb-1" style={{ letterSpacing: "0.15em" }}>
              VOCABULARY SIZE TEST
            </p>
            <h1 className="text-xl font-bold">آزمون گسترده دایره لغات انگلیسی</h1>
            <p className="text-sm mt-1 opacity-80">هم‌راستا با سطح‌بندی CEFR و فهرست‌های واژگانی استاندارد (Oxford 3000/5000)</p>
          </div>

          {/* Stepper */}
          {stage !== "start" && (
            <div className="flex gap-1 px-6 pt-4">
              {LEVELS.map((lvl, i) => {
                const active = stage === "test" && i === levelIdx;
                const visited = history.some((h) => h.levelIdx === i);
                return (
                  <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full h-1.5 rounded-full transition-all"
                      style={{ background: active ? "#7A9B6E" : visited ? "#C3D2BC" : "#E4EAE1" }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: active ? "#5C7A52" : "#9AA593", fontWeight: active ? 700 : 500, direction: "ltr" }}
                    >
                      {lvl}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-6">
            {stage === "start" && (
              <div className="fadeUp">
                <p className="text-sm leading-7" style={{ color: "#3D4A3A" }}>
                  این آزمون دامنه‌ی دایره لغات شما را با <span style={{ fontWeight: 700 }}>{TOTAL_QUESTIONS} سؤال</span> از
                  ۶ سطح CEFR (A1 تا C2) می‌سنجد. واژگان از پرکاربردترین تا کم‌کاربردترین کلمات چیده شده‌اند و دشواری
                  سؤالات بر اساس پاسخ‌های شما تنظیم می‌شود.
                </p>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: "#66735F" }}>
                  <li>📚 پوشش ۷۲ واژه از سطح ابتدایی تا سطح آکادمیک/ادبی</li>
                  <li>⏱ حدود ۶ تا ۸ دقیقه زمان می‌برد</li>
                  <li>📊 در پایان، سطح، بازه‌ی تقریبی حجم واژگان و درصد پاسخ صحیح نمایش داده می‌شود</li>
                </ul>
                <button
                  onClick={startTest}
                  className="w-full mt-6 py-3 rounded-xl font-bold transition-transform active:scale-95"
                  style={{ background: "#7A9B6E", color: "#FBFCFA" }}
                >
                  شروع آزمون
                </button>
              </div>
            )}

            {stage === "test" && current && (
              <div key={asked} className="fadeUp">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs" style={{ color: "#9AA593" }}>
                    سؤال {asked} از {TOTAL_QUESTIONS}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#E4EAE1", color: "#5C7A52", direction: "ltr" }}
                  >
                    {current.level}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: "#9AA593" }}>این واژه به چه معناست؟</p>
                <p
                  className="text-2xl font-bold mb-5"
                  style={{ color: "#1F3A2A", direction: "ltr", textAlign: "left" }}
                >
                  {current.data.q}
                </p>
                <div className="space-y-2">
                  {current.data.options.map((opt, i) => {
                    let bg = "#EFF3EE";
                    let border = "#DEE6DB";
                    let color = "#1F3A2A";
                    if (selected !== null) {
                      if (i === current.data.a) {
                        bg = "#E4EEE3";
                        border = "#4C7A57";
                        color = "#3A5C43";
                      } else if (i === selected) {
                        bg = "#F3E2DC";
                        border = "#B5533B";
                        color = "#8C3D2A";
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => answer(i)}
                        disabled={locked}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: bg,
                          border: `1.5px solid ${border}`,
                          color,
                          direction: "ltr",
                          textAlign: "left",
                          cursor: locked ? "default" : "pointer",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {stage === "result" && (
              <div className="fadeUp flex flex-col items-center text-center">
                <div
                  className="stampAnim w-28 h-28 rounded-full flex items-center justify-center mb-4"
                  style={{ border: "4px solid #7A9B6E", color: "#7A9B6E" }}
                >
                  <span className="text-4xl font-extrabold" style={{ direction: "ltr" }}>
                    {finalLevel}
                  </span>
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#1F3A2A" }}>
                  سطح دایره لغات شما: {LEVEL_INFO[finalLevel].title}
                </h2>
                <p className="text-sm mt-1" style={{ color: "#5C7A52", fontWeight: 600 }}>
                  {LEVEL_INFO[finalLevel].range}
                </p>
                <p className="text-sm leading-7 mt-3" style={{ color: "#3D4A3A" }}>
                  {LEVEL_INFO[finalLevel].desc}
                </p>
                <div className="w-full mt-4 flex gap-2">
                  <div className="flex-1 rounded-xl p-3" style={{ background: "#EFF3EE" }}>
                    <p className="text-xs" style={{ color: "#9AA593" }}>پاسخ صحیح</p>
                    <p className="text-lg font-bold" style={{ color: "#1F3A2A" }}>{scorePct}٪</p>
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ background: "#EFF3EE" }}>
                    <p className="text-xs" style={{ color: "#9AA593" }}>تعداد سؤالات</p>
                    <p className="text-lg font-bold" style={{ color: "#1F3A2A" }}>{history.length}</p>
                  </div>
                </div>
                <div
                  className="w-full mt-4 p-4 rounded-xl text-sm text-right leading-7"
                  style={{ background: "#EFF3EE", color: "#66735F" }}
                >
                  <span style={{ fontWeight: 700, color: "#5C7A52" }}>پیشنهاد: </span>
                  {LEVEL_INFO[finalLevel].tip}
                </div>
                <button
                  onClick={restart}
                  className="w-full mt-6 py-3 rounded-xl font-bold transition-transform active:scale-95"
                  style={{ background: "#1F3A2A", color: "#EFF3EE" }}
                >
                  شروع دوباره
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs mt-3" style={{ color: "#9AA593" }}>
          این آزمون یک برآورد تقریبی از دامنه واژگان است، نه یک آزمون رسمی و استاندارد جهانی
        </p>
      </div>
    </div>
  );
}
