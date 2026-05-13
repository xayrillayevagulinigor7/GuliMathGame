/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, RotateCcw, Zap, Timer, Star, User } from "lucide-react";

type Operation = "+" | "-" | "*";

interface Problem {
  id: number;
  text: string;
  answer: number;
  options: number[];
}

const generateProblem = (difficulty: number): Problem => {
  const ops: Operation[] = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * (difficulty > 5 ? 3 : 2))];
  let a: number, b: number, answer: number;

  if (op === "+") {
    a = Math.floor(Math.random() * (10 + difficulty * 2)) + 1;
    b = Math.floor(Math.random() * (10 + difficulty * 2)) + 1;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * (15 + difficulty * 2)) + 5;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * (5 + Math.floor(difficulty / 2))) + 2;
    b = Math.floor(Math.random() * (5 + Math.floor(difficulty / 2))) + 2;
    answer = a * b;
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + (offset === 0 ? 3 : offset);
    if (wrong > 0) options.add(wrong);
  }

  return {
    id: Date.now() + Math.random(),
    text: `${a} ${op} ${b}`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

const TEAM_LEFT = "left";
const TEAM_RIGHT = "right";
const WIN_THRESHOLD = 120;

function Character({ color, isPulling, isLeft, gender }: { color: string, isPulling: boolean, isLeft: boolean, gender: 'boy' | 'girl' }) {
  const rotation = isPulling ? (isLeft ? -20 : 20) : (isLeft ? -5 : 5);
  
  return (
    <motion.svg 
      width="120" 
      height="180" 
      viewBox="0 0 120 180" 
      className="drop-shadow-2xl"
      animate={{ rotate: rotation }}
    >
      {/* Body */}
      <path 
        d="M60 60 L60 120" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* Legs */}
      <motion.path 
        d={isPulling ? "M60 120 L30 170 M60 120 L90 170" : "M60 120 L40 170 M60 120 L80 170"}
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round"
        animate={isPulling ? { d: isLeft ? "M60 120 L20 160 M60 120 L50 170" : "M60 120 L100 160 M60 120 L70 170" } : {}}
      />

      {/* Arms (Pulling the rope) */}
      <motion.path 
        d={isLeft ? "M60 80 L120 80" : "M60 80 L0 80"} 
        stroke={color} 
        strokeWidth="10" 
        strokeLinecap="round" 
        animate={isPulling ? { strokeWidth: 14 } : {}}
      />

      {/* Head */}
      <circle cx="60" cy="40" r="25" fill="#ffd1a9" />
      
      {/* Face/Hair */}
      {gender === 'boy' ? (
        <path d="M35 40 Q60 10 85 40" fill={color} />
      ) : (
        <path d="M35 45 Q60 5 85 45 L90 60 Q60 50 30 60 Z" fill={color} />
      )}
      
      {/* Eyes */}
      <circle cx="50" cy="38" r="3" fill="#333" />
      <circle cx="70" cy="38" r="3" fill="#333" />
      
      {/* Mouth */}
      <motion.path 
        d={isPulling ? "M50 50 Q60 60 70 50" : "M50 50 Q60 55 70 50"} 
        stroke="#333" 
        strokeWidth="2" 
        fill="none" 
      />
    </motion.svg>
  );
}

function TeamPanel({ 
  problem, 
  onAnswer, 
  isShaking, 
  disabled, 
  accentColor,
  teamName
}: { 
  problem: Problem; 
  onAnswer: (val: number) => void;
  isShaking: boolean;
  disabled: boolean;
  accentColor: "blue" | "pink";
  teamName: string;
}) {
  const isBlue = accentColor === "blue";

  return (
    <motion.div 
      animate={isShaking ? { x: [-15, 15, -15, 15, 0], scale: [1, 1.05, 1] } : {}}
      className={`p-10 rounded-[3.5rem] bg-slate-900/50 border-4 border-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-10 relative overflow-hidden group`}
    >
      {/* Background Glow */}
      <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${isBlue ? 'bg-blue-600' : 'bg-pink-600'}`} />
      
      <div className="flex items-center gap-4 relative">
        <div className={`w-3 h-3 rounded-full ${isBlue ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-pink-500 shadow-[0_0_10px_#ec4899]'} animate-pulse`} />
        <span className="font-black text-white/50 uppercase tracking-[0.4em] text-sm">{teamName}</span>
      </div>

      <div className="text-7xl font-black text-white my-4 font-mono tracking-tighter tabular-nums drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        {problem.text}
      </div>

      <div className="grid grid-cols-1 w-full gap-5 relative">
        {problem.options.map((option, idx) => (
          <button
            key={`${problem.id}-${idx}`}
            disabled={disabled}
            onClick={() => onAnswer(option)}
            className={`
              relative w-full py-6 text-3xl font-black rounded-[2rem] transition-all overflow-hidden
              ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-[1.03] hover:-translate-y-1 active:scale-95'}
              bg-slate-800 border-2 border-white/5 hover:border-white/20 text-white shadow-xl
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${isBlue ? 'from-blue-600 to-blue-400' : 'from-pink-600 to-pink-400'} opacity-0 group-hover:opacity-20 transition-opacity`} />
            <span className="relative z-10">{option}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [leftName, setLeftName] = useState("Alpha");
  const [rightName, setRightName] = useState("Bravo");
  const [ropePos, setRopePos] = useState(0); // -120 to 120
  const [leftProblem, setLeftProblem] = useState<Problem>(() => generateProblem(1));
  const [rightProblem, setRightProblem] = useState<Problem>(() => generateProblem(1));
  const [winner, setWinner] = useState<string | null>(null);
  const [shakeSide, setShakeSide] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  
  const checkWinner = useCallback((pos: number) => {
    if (pos <= -WIN_THRESHOLD) setWinner(TEAM_LEFT);
    else if (pos >= WIN_THRESHOLD) setWinner(TEAM_RIGHT);
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: number;
    if (gameStarted && !winner && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !winner && gameStarted) {
      if (Math.abs(ropePos) < 20) setWinner("DRAW");
      else if (ropePos < 0) setWinner(TEAM_LEFT);
      else setWinner(TEAM_RIGHT);
    }
    return () => clearInterval(timer);
  }, [gameStarted, winner, timeLeft, ropePos]);

  const addParticles = (side: string) => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: side === TEAM_LEFT ? -100 : 100,
      y: (Math.random() - 0.5) * 60,
      color: side === TEAM_LEFT ? "#60a5fa" : "#f472b6"
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  const handleAnswer = (side: string, selected: number) => {
    if (winner || !gameStarted) return;

    const problem = side === TEAM_LEFT ? leftProblem : rightProblem;
    const isCorrect = selected === problem.answer;
    const moveAmount = 30;

    if (isCorrect) {
      setRopePos((prev) => {
        const nextPos = side === TEAM_LEFT ? prev - moveAmount : prev + moveAmount;
        checkWinner(nextPos);
        return nextPos;
      });
      addParticles(side);
      setDifficulty(prev => prev + 0.15);
    } else {
      setRopePos((prev) => {
        const nextPos = side === TEAM_LEFT ? prev + moveAmount : prev - moveAmount;
        checkWinner(nextPos);
        return nextPos;
      });
      setShakeSide(side);
      setTimeout(() => setShakeSide(null), 500);
    }

    if (side === TEAM_LEFT) setLeftProblem(generateProblem(difficulty));
    else setRightProblem(generateProblem(difficulty));
  };

  const startGame = () => {
    if (!leftName.trim() || !rightName.trim()) return;
    setGameStarted(true);
    setWinner(null);
    setRopePos(0);
    setTimeLeft(60);
    setDifficulty(1);
    setLeftProblem(generateProblem(1));
    setRightProblem(generateProblem(1));
  };

  const resetGame = () => {
    setGameStarted(false);
    setRopePos(0);
    setLeftProblem(generateProblem(1));
    setRightProblem(generateProblem(1));
    setWinner(null);
    setTimeLeft(60);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-yellow-400 selection:text-black">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-64 h-64 bg-pink-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Header HUD */}
      <header className="p-6 md:p-10 flex items-center justify-center z-20">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-8 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400 fill-yellow-400 w-6 h-6" />
            <span className="font-black tracking-tighter text-2xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MATH STRIKE</span>
          </div>
          
          {gameStarted && (
            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl font-mono text-xl font-bold border-2 transition-colors ${timeLeft < 10 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/20'}`}>
                <Timer className="w-5 h-5" />
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          )}
        </motion.div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* Playfield Container */}
        <div className="w-full max-w-6xl aspect-[21/9] bg-slate-900 rounded-[4rem] border-4 border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          
          <div className="absolute inset-y-0 left-[10%] w-[2px] bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-30 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <div className="absolute inset-y-0 right-[10%] w-[2px] bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-30 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 dashed" />

          {/* Particle Effects */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 1.5, x: p.x, y: p.y }}
                animate={{ opacity: 0, scale: 0, x: p.x + (Math.random() - 0.5) * 300, y: p.y + (Math.random() - 0.5) * 300 }}
                className="absolute w-2 h-2 rounded-full z-10"
                style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
              />
            ))}
          </AnimatePresence>

          {/* The Rope System */}
          <motion.div 
            className="absolute flex items-center"
            animate={{ x: `${ropePos * 1.8}px` }}
            transition={{ type: "spring", stiffness: 90, damping: 10 }}
          >
            {/* Left Character */}
            <motion.div 
              className="relative z-20"
              animate={{ x: (ropePos < -10 && gameStarted) ? [0, -10, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              <Character 
                color="#3b82f6" 
                isPulling={ropePos < -10 && gameStarted} 
                isLeft={true} 
                gender="boy"
              />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-blue-400 shadow-lg shadow-blue-500/30 whitespace-nowrap">{leftName}</div>
            </motion.div>

            {/* The Rope */}
            <div className="w-[800px] h-4 bg-[#d4b494] rounded-full shadow-2xl relative border-y border-[#a68a6d] flex items-center justify-center">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(60deg, #000, #000 15px, transparent 15px, transparent 30px)' }} />
               <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] z-10"
               >
                 <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
               </motion.div>
            </div>

            {/* Right Character */}
            <motion.div 
              className="relative z-20"
              animate={{ x: (ropePos > 10 && gameStarted) ? [0, 10, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              <Character 
                color="#ec4899" 
                isPulling={ropePos > 10 && gameStarted} 
                isLeft={false} 
                gender="girl"
              />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1 bg-pink-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-pink-400 shadow-lg shadow-pink-500/30 whitespace-nowrap">{rightName}</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Start Overlay */}
        <AnimatePresence>
          {!gameStarted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-[#0f172a]/40 backdrop-blur-md"
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900/90 backdrop-blur-2xl p-10 md:p-16 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-center max-w-xl w-full border border-white/10"
              >
                <div className="flex justify-center gap-8 md:gap-12 text-7xl md:text-9xl mb-8">
                  <motion.span animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>👦</motion.span>
                  <motion.span animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>👧</motion.span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-tight italic bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">MATH STRIKE</h2>
                <p className="text-yellow-400 font-bold mb-8 text-sm uppercase tracking-widest opacity-80 flex items-center justify-center gap-2">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  O'yin yaratuvchisi: Xayrillayeva Gulinigor
                  <Star className="w-3 h-3 fill-yellow-400" />
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={leftName}
                      onChange={(e) => setLeftName(e.target.value)}
                      placeholder="1-o'yinchi ismi"
                      className="w-full bg-slate-800 border-2 border-blue-500/30 focus:border-blue-500 text-white pl-12 pr-4 py-4 rounded-3xl outline-none transition-all placeholder:text-slate-600 font-bold"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={rightName}
                      onChange={(e) => setRightName(e.target.value)}
                      placeholder="2-o'yinchi ismi"
                      className="w-full bg-slate-800 border-2 border-pink-500/30 focus:border-pink-500 text-white pl-12 pr-4 py-4 rounded-3xl outline-none transition-all placeholder:text-slate-600 font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="group relative w-full py-8 bg-white text-slate-900 rounded-[2.5rem] overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-yellow-400 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 text-3xl font-black tracking-widest italic uppercase">JANGNI BOSHLASH!</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl px-4 text-center">
          <TeamPanel 
            problem={leftProblem}
            onAnswer={(val) => handleAnswer(TEAM_LEFT, val)}
            isShaking={shakeSide === TEAM_LEFT}
            disabled={!!winner || !gameStarted}
            accentColor="blue"
            teamName={leftName}
          />
          <TeamPanel 
            problem={rightProblem}
            onAnswer={(val) => handleAnswer(TEAM_RIGHT, val)}
            isShaking={shakeSide === TEAM_RIGHT}
            disabled={!!winner || !gameStarted}
            accentColor="pink"
            teamName={rightName}
          />
        </div>
      </main>

      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-slate-900 rounded-[5rem] p-16 max-w-md w-full text-center shadow-[0_0_120px_rgba(234,179,8,0.3)] border-4 border-yellow-400/20"
            >
              <div className="w-40 h-40 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-10 border-8 border-yellow-400/20">
                <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
              </div>
              <h2 className="text-5xl font-black text-white mb-6 italic tracking-tighter uppercase whitespace-pre-wrap">
                {winner === "DRAW" ? "DURANG!" : (winner === TEAM_LEFT ? leftName : rightName) + " ZAFAR QUCHDI!"}
              </h2>
              <p className="text-slate-400 mb-12 text-xl font-medium">Siz haqiqiy matematik daho ekansiz!</p>
              <button 
                onClick={resetGame}
                className="w-full py-6 px-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-black text-2xl rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-yellow-400/20"
              >
                <RotateCcw className="w-7 h-7" />
                YANA JANG QILAMIZ!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
