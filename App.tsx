import React, { useState, useEffect } from 'react';
import { SimulationState } from './types.ts';
import { calculateState, getDerivedValues } from './utils/physicsLogic.ts';
import SimulationCanvas from './components/SimulationCanvas.tsx';
import SolutionPanel from './components/SolutionPanel.tsx';
import { Play, Pause, RefreshCw, Info, BookOpen } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label
} from 'recharts';

const ProblemStatement: React.FC = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
    <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-blue-600" />
      题目描述
    </h2>
    <p className="text-slate-700 leading-relaxed text-base">
      如图所示，将一圆柱体物块 M 通过硬杆固定在力传感器下方，初始时物块下方悬空，下方放置一圆柱形容器。现向容器中缓慢注水，直到水面淹没物块。传感器示数 F 随加入水的质量 m 变化的关系如图所示。（已知 g=10N/kg，水的密度 ρ=1.0×10³kg/m³）
    </p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        <span>A点：水面刚接触物块底面 (m=1.0kg, F=5N)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>B点：浮力等于重力 (F=0N)</span>
      </div>
       <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        <span>C点：物块完全浸没 (F=7N)</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [waterMass, setWaterMass] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simState, setSimState] = useState<SimulationState>(calculateState(0));
  
  // Get calculated key points
  const { keyPoints } = getDerivedValues();
  
  // Calculate the simulation domain
  const MAX_MASS = 3.5;
  const STEP = 0.01;

  useEffect(() => {
    setSimState(calculateState(waterMass));
  }, [waterMass]);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setWaterMass((prev) => {
          if (prev >= MAX_MASS) {
            setIsPlaying(false);
            return prev;
          }
          return Math.min(prev + 0.02, MAX_MASS);
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setWaterMass(0);
  };

  // Helper to check if current mass is near a key point (for highlighting)
  const isNear = (target: number) => Math.abs(waterMass - target) < 0.1;

  // Pre-calculate data for the chart
  const chartData = [];
  for (let m = 0; m <= MAX_MASS; m += 0.1) {
    const s = calculateState(m);
    chartData.push({ m: parseFloat(m.toFixed(2)), F: parseFloat(s.sensorForce.toFixed(2)) });
  }

  // Calculate percentage positions for labels
  const getPercent = (val: number) => (val / MAX_MASS) * 100;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
             <Info className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">浮力与力传感器问题</h1>
            <p className="text-sm text-slate-500">Physics Buoyancy Problem Visualization</p>
          </div>
        </div>
        <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
          题号 24 (9分)
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Problem Statement Section */}
        <ProblemStatement />
        
        {/* Top Section: Visualization (Left) and Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Left Column: Visualization & Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative flex flex-col h-[600px]">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border shadow-sm text-xs font-mono space-y-1">
                <div>水质量 m: <span className="font-bold text-blue-600">{waterMass.toFixed(2)} kg</span></div>
                <div>传感器示数 F: <span className="font-bold text-red-600">{simState.sensorForce.toFixed(2)} N</span></div>
                <div>浮力 F_buoy: <span className="font-bold text-green-600">{simState.buoyancy.toFixed(2)} N</span></div>
              </div>
              
              <div className="flex-1 w-full h-full overflow-hidden">
                <SimulationCanvas state={simState} />
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-3 rounded-full text-white transition-colors shadow-lg flex items-center justify-center ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                <button 
                  onClick={handleReset}
                  className="p-3 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={20} />
                </button>

                <div className="flex-1 px-2 relative">
                   <input 
                    type="range" 
                    min="0" 
                    max={MAX_MASS} 
                    step={STEP} 
                    value={waterMass}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setWaterMass(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 relative z-10"
                  />
                  
                  {/* Labels Container */}
                  <div className="relative w-full h-6 text-xs text-slate-400 mt-2 font-mono select-none">
                    <span className="absolute left-0 top-0">0kg</span>
                    <span 
                      className={`absolute top-0 -translate-x-1/2 transition-all duration-200 ${isNear(keyPoints.mTouch) ? 'text-blue-600 font-bold scale-110' : ''}`}
                      style={{ left: `${getPercent(keyPoints.mTouch)}%` }}
                    >
                      接触
                    </span>
                    <span 
                      className={`absolute top-0 -translate-x-1/2 transition-all duration-200 ${isNear(keyPoints.mFloat) ? 'text-amber-600 font-bold scale-110' : ''}`}
                      style={{ left: `${getPercent(keyPoints.mFloat)}%` }}
                    >
                      漂浮
                    </span>
                    <span 
                      className={`absolute top-0 -translate-x-1/2 transition-all duration-200 ${isNear(keyPoints.mSubmerged) ? 'text-red-600 font-bold scale-110' : ''}`}
                      style={{ left: `${getPercent(keyPoints.mSubmerged)}%` }}
                    >
                      浸没
                    </span>
                    <span className="absolute right-0 top-0">{MAX_MASS}kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chart (5 cols) */}
          <div className="lg:col-span-5">
            <div className="h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
               <h3 className="text-sm font-semibold text-slate-500 mb-2 pl-2">传感器示数 F 随 加水质量 m 变化图 <span className="text-xs font-normal text-slate-400">(点击图表可跳转)</span></h3>
               <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart 
                      data={chartData} 
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      onClick={(e) => {
                        if (e && e.activeLabel !== undefined && e.activeLabel !== null) {
                          setIsPlaying(false);
                          setWaterMass(Number(e.activeLabel));
                        }
                      }}
                      className="cursor-pointer"
                    >
                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="m" 
                        type="number" 
                        domain={[0, MAX_MASS]} 
                        label={{ value: 'm (kg)', position: 'insideBottomRight', offset: -10, fontSize: 12 }} 
                        tick={{fontSize: 12}}
                     />
                     <YAxis 
                        domain={[0, 8]} 
                        label={{ value: 'F (N)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                        tick={{fontSize: 12}}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b' }}
                     />
                     <Line type="monotone" dataKey="F" stroke="#334155" strokeWidth={2} dot={false} isAnimationActive={false} />
                     
                     <ReferenceDot x={waterMass} y={simState.sensorForce} r={6} fill="#ef4444" stroke="white" strokeWidth={2} />
                     
                     <ReferenceDot 
                        x={keyPoints.mTouch} 
                        y={5} 
                        r={isNear(keyPoints.mTouch) ? 8 : 4} 
                        fill="#3b82f6" 
                        stroke="white"
                        fillOpacity={isNear(keyPoints.mTouch) ? 1 : 0.6}
                      >
                       <Label value="A:接触" position="top" offset={10} fontSize={10} fill="#3b82f6" />
                     </ReferenceDot>

                     <ReferenceDot 
                        x={keyPoints.mFloat} 
                        y={0} 
                        r={isNear(keyPoints.mFloat) ? 8 : 4} 
                        fill="#f59e0b" 
                        stroke="white"
                        fillOpacity={isNear(keyPoints.mFloat) ? 1 : 0.6}
                     >
                       <Label value="B:漂浮" position="top" offset={10} fontSize={10} fill="#f59e0b" />
                     </ReferenceDot>

                     <ReferenceDot 
                        x={keyPoints.mSubmerged} 
                        y={7} 
                        r={isNear(keyPoints.mSubmerged) ? 8 : 4} 
                        fill="#ef4444" 
                        stroke="white"
                        fillOpacity={isNear(keyPoints.mSubmerged) ? 1 : 0.6}
                     >
                       <Label value="C:浸没" position="bottom" offset={10} fontSize={10} fill="#ef4444" />
                     </ReferenceDot>
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Solution (Full Width) */}
        <div className="w-full">
           <SolutionPanel />
        </div>
      </main>
    </div>
  );
};

export default App;