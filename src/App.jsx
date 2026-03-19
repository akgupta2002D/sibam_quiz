import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Play, Home, Shuffle } from "lucide-react";
import questions07 from "./data/question07.json";
import questions09 from "./data/question09.json";
// Replace these with your real JSON imports.
// Example:
// import questions07 from "./data/questions07.json";
// import questions01to06 from "./data/questions01to06.json";



const questionSets = {
  questions07: {
    id: "questions07",
    title: "BLE English: Q7–10",
    subtitle: "Grammar practice",
    data: questions07
  },
  questions09: {
    id: "questions09",
    title: "BLE English: Q9",
    subtitle: "Articles, conjunctions, verb forms",
    data: questions09
  }
};

function randomInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    // Avoid modulo bias by rejecting out-of-range values.
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let x = 0;
    do {
      cryptoObj.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeQuestions(rawQuestions) {
  return rawQuestions.map((q) => ({
    ...q,
    options: shuffleArray(
      q.options && q.options.length > 0
        ? q.options
        : shuffleArray([q.answer, ...buildDistractors(q.answer)]).slice(0, 4)
    )
  }));
}

function buildDistractors(answer) {
  const generic = [
    "None of these",
    "I don't know",
    "Not sure",
    "Skip"
  ];
  return generic.filter((item) => item !== answer);
}

function getRandomizedExam(setData) {
  return shuffleArray(normalizeQuestions(setData));
}

function Dashboard({ onStart }) {
  const sets = Object.values(questionSets);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/30 px-4 py-1 text-sm text-red-200 shadow-lg shadow-red-950/20">
            <Shuffle size={14} />
            New random order every exam
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            BLE Quiz Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400 md:text-lg">
            Pick a test set, start the exam, and answer every question one by one until the set is finished.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sets.map((set, index) => (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-2xl shadow-black/40"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-block rounded-full bg-green-950/60 px-3 py-1 text-xs font-medium text-green-300 ring-1 ring-green-900/70">
                    {set.data.length} questions
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-100">{set.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{set.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => onStart(set.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-[0.99]"
              >
                <Play size={18} />
                Start exam
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Results({ result, onRetry, onHome }) {
  const percentage = Math.round((result.score / result.total) * 100);
  const passed = percentage >= 60;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-black/40"
        >
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${passed ? "bg-green-950/70 text-green-300 ring-1 ring-green-800" : "bg-red-950/70 text-red-300 ring-1 ring-red-800"}`}>
            {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {passed ? "Nice work" : "Keep practicing"}
          </div>

          <h2 className="mt-5 text-3xl font-bold">Exam complete</h2>
          <p className="mt-2 text-zinc-400">{result.title}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Score" value={`${result.score}/${result.total}`} tone="green" />
            <StatCard label="Percent" value={`${percentage}%`} tone={passed ? "green" : "red"} />
            <StatCard label="Wrong" value={`${result.total - result.score}`} tone="red" />
          </div>

          <div className="mt-8 space-y-4">
            {result.review.map((item) => (
              <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-zinc-100">{item.question}</p>
                  {item.correct ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={18} />
                  ) : (
                    <XCircle className="mt-0.5 shrink-0 text-red-400" size={18} />
                  )}
                </div>
                <p className="mt-3 text-sm text-zinc-400">Your answer: <span className="text-zinc-200">{item.selected || "No answer"}</span></p>
                {!item.correct && (
                  <p className="mt-1 text-sm text-green-300">Correct answer: {item.answer}</p>
                )}
                <p className="mt-3 rounded-xl border border-zinc-800 bg-black/30 p-3 text-sm text-zinc-300">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              <RotateCcw size={18} />
              New random exam
            </button>
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              <Home size={18} />
              Back to dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "green" }) {
  const toneClass = tone === "green"
    ? "border-green-900/70 bg-green-950/30 text-green-300"
    : "border-red-900/70 bg-red-950/30 text-red-300";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Quiz({ setId, onFinish, onHome }) {
  const currentSet = questionSets[setId];
  const [exam, setExam] = useState(() => getRandomizedExam(currentSet.data));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [review, setReview] = useState([]);
  const [score, setScore] = useState(0);

  const currentQuestion = exam[currentIndex];
  const progress = Math.round(((currentIndex + 1) / exam.length) * 100);

  const handleSubmit = () => {
    if (!selected) return;

    const correct = selected === currentQuestion.answer;
    if (correct) setScore((prev) => prev + 1);

    setReview((prev) => [
      ...prev,
      {
        id: currentQuestion.id,
        question: currentQuestion.question,
        selected,
        answer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
        correct
      }
    ]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex === exam.length - 1) {
      onFinish({
        setId,
        title: currentSet.title,
        total: exam.length,
        score,
        review
      });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelected(null);
    setShowFeedback(false);
  };

  const handleRetry = () => {
    setExam(getRandomizedExam(currentSet.data));
    setCurrentIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setReview([]);
    setScore(0);
  };

  const safeReview = useMemo(() => {
    if (!showFeedback) return review;
    return review;
  }, [review, showFeedback]);

  const latestEntry = safeReview[safeReview.length - 1];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">{currentSet.title}</p>
            <h1 className="mt-2 text-3xl font-bold">Question {currentIndex + 1} of {exam.length}</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              New random exam
            </button>
            <button
              onClick={onHome}
              className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-950/50"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="mb-8 h-3 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-green-500"
          />
        </div>

        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl shadow-black/40"
        >
          <p className="text-xl font-semibold leading-8 text-zinc-100">{currentQuestion.question}</p>

          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selected === option;
              const isCorrect = showFeedback && option === currentQuestion.answer;
              const isWrongSelection = showFeedback && isSelected && option !== currentQuestion.answer;

              return (
                <button
                  key={option}
                  disabled={showFeedback}
                  onClick={() => setSelected(option)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    isCorrect
                      ? "border-green-700 bg-green-950/40 text-green-200"
                      : isWrongSelection
                      ? "border-red-700 bg-red-950/40 text-red-200"
                      : isSelected
                      ? "border-red-600 bg-red-900/30 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && latestEntry && latestEntry.id === currentQuestion.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 overflow-hidden rounded-2xl border p-4 ${
                  latestEntry.correct
                    ? "border-green-900/70 bg-green-950/20"
                    : "border-red-900/70 bg-red-950/20"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {latestEntry.correct ? <CheckCircle2 className="text-green-400" size={18} /> : <XCircle className="text-red-400" size={18} />}
                  {latestEntry.correct ? "Correct" : "Not quite"}
                </div>
                {!latestEntry.correct && (
                  <p className="mt-2 text-sm text-green-300">Correct answer: {latestEntry.answer}</p>
                )}
                <p className="mt-3 text-sm leading-6 text-zinc-300">{latestEntry.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!showFeedback ? (
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className="rounded-2xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-2xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
              >
                {currentIndex === exam.length - 1 ? "See results" : "Next question"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [activeSetId, setActiveSetId] = useState(null);
  const [result, setResult] = useState(null);

  const startExam = (setId) => {
    setActiveSetId(setId);
    setResult(null);
    setScreen("quiz");
  };

  const finishExam = (examResult) => {
    setResult(examResult);
    setScreen("results");
  };

  const retryExam = () => {
    setScreen("quiz");
    setResult(null);
  };

  const goHome = () => {
    setScreen("dashboard");
    setActiveSetId(null);
    setResult(null);
  };

  if (screen === "quiz" && activeSetId) {
    return <Quiz setId={activeSetId} onFinish={finishExam} onHome={goHome} />;
  }

  if (screen === "results" && result) {
    return <Results result={result} onRetry={() => startExam(result.setId)} onHome={goHome} />;
  }

  return <Dashboard onStart={startExam} />;
}
