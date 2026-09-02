import React, { useState } from 'react';
import { X, Sliders, Zap, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateModal: React.FC<SimulateModalProps> = ({ isOpen, onClose }) => {
  const [ambientTemp, setAmbientTemp] = useState(34);
  const [occupancyLevel, setOccupancyLevel] = useState(85);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);

  if (!isOpen) return null;

  const handleRunSim = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
              <Sliders className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">BMS Telemetry Simulator</h2>
              <p className="text-[11px] text-slate-500 font-medium">Inject Load Profiles & Heatwave Scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-slate-700 font-sans font-bold">Ambient Outdoor Temperature:</span>
              <span className="text-amber-700 font-bold">{ambientTemp}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="45"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-slate-700 font-sans font-bold">Building Occupancy Load:</span>
              <span className="text-cyan-700 font-bold">{occupancyLevel}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={occupancyLevel}
              onChange={(e) => setOccupancyLevel(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
          </div>

          {/* Impact preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
            <div className="text-slate-500 font-sans font-bold">Predicted Impact:</div>
            <div className="text-amber-800 font-bold">
              Estimated Peak kW Demand: <span>{Math.round(840 * (ambientTemp / 30) * (occupancyLevel / 80))} kW</span>
            </div>
            <div className="text-emerald-800 font-bold">
              Chiller COP Efficiency Shift: <span>{(4.1 * (30 / ambientTemp)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              setAmbientTemp(34);
              setOccupancyLevel(85);
              setSimComplete(false);
            }}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 text-xs cursor-pointer font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleRunSim}
              disabled={isSimulating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-all text-xs cursor-pointer flex items-center space-x-2"
            >
              {simComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Telemetry Live!</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-cyan-300" />
                  <span>{isSimulating ? 'Injecting Telemetry...' : 'Inject Simulation Scenario'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
