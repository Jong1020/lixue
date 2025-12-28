import React from 'react';
import { getDerivedValues, CONSTANTS } from '../utils/physicsLogic.ts';
import { Calculator } from 'lucide-react';

const SolutionPanel: React.FC = () => {
  const { blockMass, maxBuoyancy, blockDensity } = getDerivedValues();
  
  // Manual calculation for step 4 display
  const p4_pressure = CONSTANTS.waterDensity * CONSTANTS.gravity * 0.1; 
  const p4_force = p4_pressure * CONSTANTS.containerArea;

  return (
    <div className="w-full">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          解题过程详解
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question 1 */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              求物块 M 的质量
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed font-mono pl-8">
              <p>由图乙可知，当加入水的质量 m &lt; 1kg 时，传感器示数不变，为 F₁ = 5N。</p>
              <p>此时物块未受到浮力，故：</p>
              <p className="font-bold my-1 text-slate-800">G = F₁ = 5N</p>
              <p>由 G = mg 得：</p>
              <p className="text-blue-600 font-bold">m_M = G/g = 5/10 = {blockMass} kg</p>
            </div>
          </section>

          {/* Question 2 */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              求物块受到的浮力最大值
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed font-mono pl-8">
              <p>当水面淹没物块后，由图乙可知传感器示数最终稳定在 F₂ = 7N。</p>
              <p>此时 F示数 经历了先减小到0再反向增加的过程（轻杆受到压力）。</p>
              <p>F浮_max = G + F₂ = 5N + 7N = 12N</p>
              <p className="text-blue-600 font-bold">F浮_max = {maxBuoyancy} N</p>
            </div>
          </section>

          {/* Question 3 */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              求物块的密度
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed font-mono pl-8">
              <p>物块完全浸没时浮力最大：</p>
              <p>V物 = F浮_max / (ρ水 g) = 12 / (10000) = 1.2×10⁻³ m³</p>
              <p>ρ物 = m_M / V物 = 0.5 / (1.2×10⁻³)</p>
              <p className="text-blue-600 font-bold">ρ物 ≈ {blockDensity.toFixed(1)} kg/m³</p>
            </div>
          </section>

          {/* Question 4 */}
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              刚好接触水面时容器底受到的压强和压力
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed font-mono pl-8">
              <p>转折点发生在 m = 1kg 时，水深 h = 0.1m。</p>
              <p>压强 P = ρ水 g h = 1000 × 10 × 0.1 = {p4_pressure} Pa</p>
              <p>压力 F = P S = {p4_force} N</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SolutionPanel;