import React from 'react';
import { SimulationState, PhysicsConstants } from '../types.ts';
import { CONSTANTS, getDerivedValues } from '../utils/physicsLogic.ts';

interface Props {
  state: SimulationState;
}

const SimulationCanvas: React.FC<Props> = ({ state }) => {
  const { visualBlockHeight } = getDerivedValues();
  
  // SVG Coordinate mapping
  // World coordinates: 1 meter = 800 pixels (Scale factor adjusted to fit max water level)
  // Origin (0,0) is bottom left of container visually.
  const CANVAS_HEIGHT = 500;
  const CANVAS_WIDTH = 400;
  
  // Dimensions in SVG units
  const scaleMetersToPx = (m: number) => m * 800;
  // Force Scale: 12px per Newton (Reference: G=5N -> 60px)
  const PX_PER_N = 12;

  const contWidthPx = 200; // Visual width
  const contHeightPx = 400; // Increased height to prevent water overflow (0.5m capacity visually)
  const bottomY = 450; // Moved down to accommodate taller container
  const centerX = CANVAS_WIDTH / 2;

  // Block
  const blockWidthPx = 100; // Visual choice
  const blockHeightPx = scaleMetersToPx(visualBlockHeight);
  
  // The block bottom is fixed at 10cm (0.1m) height from bottom
  const blockBottomWorldM = 0.1;
  const blockBottomPx = bottomY - scaleMetersToPx(blockBottomWorldM);
  const blockTopPx = blockBottomPx - blockHeightPx;
  const blockCenterY = blockTopPx + blockHeightPx / 2; // Center of Mass Y

  // Water
  const waterHeightPx = scaleMetersToPx(state.waterHeight);
  const waterTopY = bottomY - waterHeightPx;

  // Fixed End & Sensor Position
  const fixedY = 25; 
  const sensorHeight = 30;
  const sensorBoxTop = fixedY;
  const sensorBoxBottom = fixedY + sensorHeight;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border rounded-xl shadow-inner overflow-hidden relative">
      <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
        <defs>
          <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M0,20 l20,-20 M-5,5 l10,-10 M15,25 l10,-10" stroke="#93c5fd" strokeWidth="1" opacity="0.5"/>
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowheadBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Support structure */}
        <line x1={centerX - 100} y1={fixedY} x2={centerX + 100} y2={fixedY} stroke="#333" strokeWidth="4" strokeLinecap="round" />
        <line x1={centerX - 100} y1={fixedY} x2={centerX - 80} y2={fixedY - 20} stroke="#333" strokeWidth="2" />
        <text x={centerX - 140} y={fixedY + 5} className="text-xs fill-gray-600">固定端</text>

        {/* Sensor Box */}
        <rect x={centerX - 20} y={sensorBoxTop} width={40} height={sensorHeight} fill="#ddd" stroke="#666" rx="2" />
        <rect x={centerX - 15} y={sensorBoxTop + 5} width={30} height={20} fill="white" stroke="#999" />
        <text x={centerX} y={sensorBoxTop + 18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="red">
          {state.sensorForce.toFixed(2)}N
        </text>

        {/* Rod */}
        <line x1={centerX} y1={sensorBoxBottom} x2={centerX} y2={blockTopPx} stroke="#555" strokeWidth="3" />

        {/* Container */}
        <line x1={centerX - contWidthPx/2} y1={bottomY} x2={centerX + contWidthPx/2} y2={bottomY} stroke="black" strokeWidth="4" />
        <line x1={centerX - contWidthPx/2} y1={bottomY} x2={centerX - contWidthPx/2} y2={bottomY - contHeightPx} stroke="black" strokeWidth="4" />
        <line x1={centerX + contWidthPx/2} y1={bottomY} x2={centerX + contWidthPx/2} y2={bottomY - contHeightPx} stroke="black" strokeWidth="4" />

        {/* Water */}
        <mask id="waterMask">
             <rect x={centerX - contWidthPx/2 + 2} y={waterTopY} width={contWidthPx - 4} height={waterHeightPx} fill="white" />
        </mask>
        
        {/* Render water with transparency */}
        <rect 
            x={centerX - contWidthPx/2 + 2} 
            y={waterTopY} 
            width={contWidthPx - 4} 
            height={waterHeightPx} 
            fill="#3b82f6" 
            fillOpacity="0.3"
        />
         <rect 
            x={centerX - contWidthPx/2 + 2} 
            y={waterTopY} 
            width={contWidthPx - 4} 
            height={waterHeightPx} 
            fill="url(#waterPattern)" 
        />

        {/* Block M */}
        <g>
          <rect 
            x={centerX - blockWidthPx/2} 
            y={blockTopPx} 
            width={blockWidthPx} 
            height={blockHeightPx} 
            fill="#cbd5e1" 
            stroke="#475569" 
            strokeWidth="2"
          />
          <text x={centerX} y={blockCenterY} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#475569" opacity="0.5">M</text>
        </g>
        
        {/* Center of Mass Dot */}
        <circle cx={centerX} cy={blockCenterY} r="4" fill="black" stroke="white" strokeWidth="1" />

        {/* Force Vectors */}
        
        {/* Gravity (Down) */}
        <line 
          x1={centerX} 
          y1={blockCenterY} 
          x2={centerX} 
          y2={blockCenterY + (CONSTANTS.blockWeight * PX_PER_N)} 
          stroke="#ef4444" 
          strokeWidth="3" 
          markerEnd="url(#arrowhead)" 
        />
        <text 
          x={centerX + 12} 
          y={blockCenterY + (CONSTANTS.blockWeight * PX_PER_N)} 
          fill="#ef4444" 
          fontSize="14" 
          fontWeight="bold"
          dominantBaseline="middle"
        >
          G
        </text>

        {/* Buoyancy (Up) */}
        {state.buoyancy > 0 && (
          <>
            <line 
                x1={centerX} 
                y1={blockCenterY} 
                x2={centerX} 
                y2={blockCenterY - (state.buoyancy * PX_PER_N)} 
                stroke="#3b82f6" 
                strokeWidth="3" 
                markerEnd="url(#arrowheadBlue)" 
            />
            <text 
                x={centerX + 12} 
                y={blockCenterY - (state.buoyancy * PX_PER_N)} 
                fill="#3b82f6" 
                fontSize="14" 
                fontWeight="bold"
                dominantBaseline="middle"
            >
                F浮
            </text>
          </>
        )}

      </svg>
    </div>
  );
};

export default SimulationCanvas;