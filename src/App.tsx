/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, RotateCcw, Zap, Timer, Star, User, Target } from "lucide-react";

type Operation = "+" | "-" | "*";

interface Problem {
  id: number;
  text: string;
  answer: number;
  options: number[];
}

const generateProblem = (difficulty: number): Problem => {
  const ops: Operation[] = ["+", "-"]; // Simplified for kids
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  const maxRange = Math.min(20 + Math.floor(difficulty * 5), 100);

  if (op === "+") {
    a = Math.floor(Math.random() * (maxRange / 2)) + 1;
    b = Math.floor(Math.random() * (maxRange / 2)) + 1;
    answer = a + b;
  } else {
    // Subtraction - ensure positive result
    a = Math.floor(Math.random() * (maxRange - 5)) + 5;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 3) {
    const spread = difficulty > 5 ? 5 : 10;
    const offset = Math.floor(Math.random() * spread) - Math.floor(spread / 2);
    const wrong = answer + (offset === 0 ? 2 : offset);
    if (wrong > 0 && wrong !== answer) options.add(wrong);
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
      <defs>
        <pattern id="atlasPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="8" fill="#fff" fillOpacity="0.2" />
          <path d="M0 0 L20 20 M20 0 L0 20" stroke="#fff" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Clothing */}
      {gender === 'boy' ? (
        <rect x="52" y="60" width="16" height="60" rx="8" fill={color} />
      ) : (
        <path d="M60 60 L35 120 L85 120 Z" fill={color} />
      )}
      
      {/* Atlas pattern overlay for girl's dress */}
      {gender === 'girl' && <path d="M60 60 L35 120 L85 120 Z" fill="url(#atlasPattern)" />}

      {/* Legs */}
      <motion.path 
        d={isPulling ? "M60 120 L35 170 M60 120 L85 170" : "M60 120 L45 170 M60 120 L75 170"}
        stroke={color} 
        strokeWidth="10" 
        strokeLinecap="round"
        animate={isPulling ? { d: isLeft ? "M60 120 L25 160 M60 120 L55 170" : "M60 120 L95 160 M60 120 L65 170" } : {}}
      />

      {/* Arms (Pulling the rope) */}
      <motion.path 
        d={isLeft ? "M60 85 L120 85" : "M60 85 L0 85"} 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="round" 
      />

      {/* Head */}
      <circle cx="60" cy="40" r="22" fill="#ffd1a9" />
      
      {/* Hat (Do'ppi) */}
      {gender === 'boy' ? (
        <g>
          <path d="M40 25 L80 25 L75 12 L45 12 Z" fill="#111" />
          {/* Do'ppi patterns */}
          <path d="M48 18 L52 18 M68 18 L72 18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M58 15 L62 15" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M42 22 Q60 10 78 22 L75 15 Q60 5 45 15 Z" fill="#ec4899" />
          <circle cx="50" cy="18" r="1.5" fill="white" />
          <circle cx="60" cy="15" r="1.5" fill="white" />
          <circle cx="70" cy="18" r="1.5" fill="white" />
        </g>
      )}
      
      {/* Eyes */}
      <circle cx="53" cy="42" r="2.5" fill="#333" />
      <circle cx="67" cy="42" r="2.5" fill="#333" />
      
      {/* Mouth */}
      <motion.path 
        d={isPulling ? "M53 52 Q60 60 67 52" : "M55 52 Q60 56 65 52"} 
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
      className={`p-10 rounded-[4rem] bg-white shadow-2xl flex flex-col items-center gap-10 relative overflow-hidden border-8 ${isBlue ? 'border-blue-400' : 'border-pink-400'}`}
    >
      <div className="flex items-center gap-4 relative">
        <Target className={`w-8 h-8 ${isBlue ? 'text-blue-500' : 'text-pink-500'}`} />
        <span className="font-black text-slate-400 uppercase tracking-widest text-lg">{teamName}</span>
      </div>

      <div className="text-8xl font-black text-slate-800 my-4 font-mono tracking-tighter drop-shadow-sm">
        {problem.text}
      </div>

      <div className="grid grid-cols-1 w-full gap-4 relative">
        {problem.options.map((option, idx) => (
          <button
            key={`${problem.id}-${idx}`}
            disabled={disabled}
            onClick={() => onAnswer(option)}
            className={`
              w-full py-6 text-4xl font-black rounded-[2.5rem] transition-all
              ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95'}
              ${isBlue ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pink-500 hover:bg-pink-600'} text-white shadow-lg
            `}
          >
            {option}
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
    <div className="min-h-screen bg-sky-300 text-slate-900 flex flex-col font-sans overflow-hidden selection:bg-yellow-400 selection:text-black relative">
      {/* Playful Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 text-8xl"
        >☁️</motion.div>
        <motion.div 
          animate={{ x: [0, -150, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 text-7xl"
        >☁️</motion.div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-50px] right-[-50px] text-9xl text-yellow-400 filter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
        >☀️</motion.div>
        {/* Grass Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-500 rounded-t-[100%] scale-x-110 translate-y-10 border-t-8 border-green-600" />
      </div>

      {/* Header HUD */}
      <header className="p-4 md:p-6 flex items-center justify-center z-20">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl border-4 border-sky-400/30 px-10 py-4 rounded-[2rem] flex items-center gap-8 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500 fill-yellow-500 w-8 h-8" />
            <span className="font-black tracking-tight text-3xl text-sky-900 uppercase">MATEMATIKA JANGI</span>
          </div>
          
          {gameStarted && (
            <div className="flex items-center gap-4 border-l-4 border-sky-100 pl-8">
              <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-mono text-2xl font-bold border-4 transition-colors ${timeLeft < 10 ? 'bg-red-100 border-red-500 text-red-600 animate-pulse' : 'bg-sky-50 border-sky-200 text-sky-700'}`}>
                <Timer className="w-6 h-6" />
                {timeLeft}s
              </div>
            </div>
          )}
        </motion.div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* Playfield Container */}
        <div className="w-full max-w-6xl aspect-[21/9] bg-green-100/40 backdrop-blur-sm rounded-[5rem] border-8 border-white/80 relative overflow-hidden flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          {/* Finish Lines */}
          <div className="absolute inset-y-0 left-[8%] w-4 bg-red-400/30 rounded-full" />
          <div className="absolute inset-y-0 right-[8%] w-4 bg-red-400/30 rounded-full" />
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-white/50 dashed" />

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
                <h2 className="text-5xl md:text-7xl font-black text-sky-900 mb-2 uppercase tracking-tight italic">QUVNOQ MATEMATIKA</h2>
                <p className="text-sky-600 font-bold mb-8 text-lg uppercase tracking-widest flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 fill-sky-600" />
                  O'yin yaratuvchisi: Xayrillayeva Gulinigor
                  <Star className="w-5 h-5 fill-sky-600" />
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6" />
                    <input 
                      type="text" 
                      value={leftName}
                      onChange={(e) => setLeftName(e.target.value)}
                      placeholder="1-bola ismi"
                      className="w-full bg-sky-50 border-4 border-blue-200 focus:border-blue-400 text-sky-900 pl-14 pr-6 py-5 rounded-[2.5rem] outline-none transition-all placeholder:text-sky-300 font-black text-xl"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500 w-6 h-6" />
                    <input 
                      type="text" 
                      value={rightName}
                      onChange={(e) => setRightName(e.target.value)}
                      placeholder="2-bola ismi"
                      className="w-full bg-pink-50 border-4 border-pink-200 focus:border-pink-400 text-pink-900 pl-14 pr-6 py-5 rounded-[2.5rem] outline-none transition-all placeholder:text-pink-300 font-black text-xl"
                    />
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="group relative w-full py-8 bg-sky-600 text-white rounded-[3rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-sky-200"
                >
                  <div className="absolute inset-0 bg-yellow-400 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 text-4xl font-black tracking-widest italic uppercase">BOSHLAYMIZ!</span>
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
