import React, { useState, useEffect } from 'react';
import {
  Eye,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Activity,
  Maximize2,
  Filter,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Flame,
  Grid3X3,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  fetchCnnInferenceApi,
  triggerCnnScanApi,
  updateCnnCameraConfigApi,
} from '../../api/client';
import {
  CnnInferenceResult,
  CnnCameraFeed,
  CnnLayerActivation,
} from '../../types';

interface CnnVisionModuleProps {
  onNavigateToTab?: (tab: string) => void;
}

export const CnnVisionModule: React.FC<CnnVisionModuleProps> = ({ onNavigateToTab }) => {
  const [inferenceData, setInferenceData] = useState<CnnInferenceResult | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-CNN-02');
  const [selectedViewMode, setSelectedViewMode] = useState<'bboxes' | 'heatmap' | 'feature_maps'>('bboxes');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('YOLOv8-CrowdNet (CNN)');
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(5);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCnnData = async () => {
    setLoading(true);
    try {
      const res = await fetchCnnInferenceApi();
      if (res && res.data) {
        setInferenceData(res.data);
      }
    } catch (err) {
      console.warn('CNN inference fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCnnData();
  }, []);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setActionSuccessMsg(null);
    try {
      const res = await triggerCnnScanApi(selectedArchitecture);
      if (res && res.data) {
        setInferenceData(res.data);
        setActionSuccessMsg(`CNN Forward Pass completed in ${res.data.inferenceLatencyMs}ms across all optical channels.`);
      } else {
        await loadCnnData();
        setActionSuccessMsg('CNN optical neural inference pass completed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleArchitectureChange = async (arch: string) => {
    setSelectedArchitecture(arch);
    await handleTriggerScan();
  };

  const activeCamera = inferenceData?.cameras.find((c) => c.id === selectedCameraId) || inferenceData?.cameras[0] || null;
  const activeLayer = inferenceData?.layerActivations.find((l) => l.layerIndex === selectedLayerIndex) || inferenceData?.layerActivations[0] || null;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Title & Neural Engine Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Convolutional Neural Network (CNN) Vision Engine</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
            CNN Optical Headcounting & Spatial Density Inference
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Deep-learning multi-scale feature pyramid (Conv2D & Dilated Receptive Kernels) for real-time crowd estimation, tailgating detection, and IAQ correlation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Architecture Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2 font-mono">Backbone:</span>
            <select
              value={selectedArchitecture}
              onChange={(e) => handleArchitectureChange(e.target.value)}
              className="bg-white font-bold text-slate-800 rounded-lg px-2 py-1 border border-slate-200 text-xs cursor-pointer"
            >
              <option value="YOLOv8-CrowdNet (CNN)">YOLOv8-CrowdNet (CNN)</option>
              <option value="CSRNet Density Estimator">CSRNet Dilated Conv (CNN)</option>
              <option value="ResNet-50-FPN">ResNet-50-FPN (Deep CNN)</option>
              <option value="MobileNetV3-Edge">MobileNetV3-Edge (Lightweight)</option>
            </select>
          </div>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Inferencing...' : 'Run Forward Pass'}</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Real-time CNN Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Total Visual Headcount</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-indigo-700">{inferenceData?.totalVisualHeadcount ?? 444}</span>
            <span className="text-[10px] text-slate-500 font-mono">detected</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold font-mono">Across 4 Optical Nodes</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">RFID Badge Discrepancy</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-rose-600">+{inferenceData?.untrackedOccupantsDelta ?? 23}</span>
            <span className="text-[10px] text-slate-500 font-mono">guests/untracked</span>
          </div>
          <div className="text-[10px] text-rose-700 font-bold font-mono">Badge: {inferenceData?.totalBadgeHeadcount ?? 421}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Mean Inference Latency</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{inferenceData?.inferenceLatencyMs ?? 15.1}</span>
            <span className="text-xs text-slate-500 font-mono">ms / frame</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">{inferenceData?.fpsThroughput ?? 38.6} FPS TensorRT Edge</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Confidence Score (mAP)</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-emerald-600">{inferenceData?.avgConfidence ?? 98.9}%</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">IoU Threshold: 0.65</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">ConvNet Topology</div>
          <div className="text-xs font-bold text-slate-900 truncate">6-Layer Feature Pyramid</div>
          <div className="text-[10px] text-indigo-600 font-mono font-bold">Dilated Spatial Kernels</div>
        </div>
      </div>

      {/* Main Vision Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Feeds & Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* Camera Selector Tabs */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 shadow-2xs overflow-x-auto gap-2">
            <div className="flex items-center space-x-1.5">
              {inferenceData?.cameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCameraId(cam.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedCameraId === cam.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cam.name.split('-')[0].trim()}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    cam.densityStatus === 'overcrowded'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {cam.detectedHeadcount}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setSelectedViewMode('bboxes')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  selectedViewMode === 'bboxes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bounding Boxes
              </button>
              <button
                onClick={() => setSelectedViewMode('heatmap')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  selectedViewMode === 'heatmap'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Density Heatmap
              </button>
              <button
                onClick={() => setSelectedViewMode('feature_maps')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  selectedViewMode === 'feature_maps'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Feature Maps
              </button>
            </div>
          </div>

          {/* Simulated Vision Video Canvas / Viewport */}
          {activeCamera && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md text-white relative">
              {/* Top Viewport Telemetry Header */}
              <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-slate-200">{activeCamera.name}</span>
                  <span className="text-[10px] text-slate-400">({activeCamera.resolution})</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-indigo-400 font-bold">{activeCamera.modelArchitecture}</span>
                  <span className="text-slate-400">{activeCamera.frameRateFps} FPS</span>
                  <span className="text-slate-400">{activeCamera.lastInferenceMs}ms</span>
                </div>
              </div>

              {/* Viewport Canvas Frame */}
              <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden flex items-center justify-center p-4">
                {/* Simulated Room Perspective Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:24px_24px]"></div>

                {/* Simulated Room Backdrop Elements */}
                <div className="absolute inset-x-8 top-12 bottom-8 border border-slate-800/80 rounded-2xl bg-slate-900/40 backdrop-blur-xs flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>{activeCamera.zoneName}</span>
                    <span>Floor {activeCamera.floor} Camera Feed</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
                      Optical Sensor Zone: {activeCamera.zoneId}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>FOV: 110° Wide Angle</span>
                    <span>IR Illumination: Auto</span>
                  </div>
                </div>

                {/* MODE 1: BOUNDING BOXES (CNN Object Detection Output) */}
                {selectedViewMode === 'bboxes' && (
                  <div className="absolute inset-0 p-8">
                    {activeCamera.boundingBoxes.map((bb) => {
                      const isOvercrowded = bb.status === 'overcrowded_cluster';
                      const isUntracked = bb.status === 'untracked';

                      return (
                        <div
                          key={bb.id}
                          style={{
                            left: `${bb.x}%`,
                            top: `${bb.y}%`,
                            width: `${bb.width}%`,
                            height: `${bb.height}%`,
                          }}
                          className={`absolute border-2 rounded-sm transition-all duration-300 pointer-events-auto group ${
                            isOvercrowded
                              ? 'border-rose-500 bg-rose-500/15'
                              : isUntracked
                              ? 'border-amber-400 bg-amber-400/15'
                              : 'border-emerald-400 bg-emerald-400/10'
                          }`}
                        >
                          {/* Top Confidence Tag */}
                          <div
                            className={`absolute -top-5 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold whitespace-nowrap ${
                              isOvercrowded
                                ? 'bg-rose-600 text-white'
                                : isUntracked
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-500 text-slate-950'
                            }`}
                          >
                            {isUntracked ? '⚠️ Untracked' : bb.label} {(bb.confidence * 100).toFixed(1)}%
                          </div>

                          {/* Crosshair Centroid Marker */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MODE 2: DENSITY HEATMAP (CSRNet Dilated Conv Output) */}
                {selectedViewMode === 'heatmap' && (
                  <div className="absolute inset-0 p-6 pointer-events-none">
                    {activeCamera.heatmapPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        style={{
                          left: `${pt.x}%`,
                          top: `${pt.y}%`,
                          width: '140px',
                          height: '140px',
                          transform: 'translate(-50%, -50%)',
                          background: `radial-gradient(circle, rgba(244,63,94,${pt.weight * 0.85}) 0%, rgba(245,158,11,${pt.weight * 0.5}) 40%, rgba(16,185,129,${pt.weight * 0.2}) 70%, transparent 100%)`,
                        }}
                        className="absolute rounded-full blur-lg animate-pulse"
                      />
                    ))}
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 p-2 rounded-xl text-[10px] font-mono space-y-1">
                      <div className="font-bold text-slate-300">Continuous Density Tensor:</div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-emerald-500"></span>
                        <span>0.0 - 0.4 h/m² (Low)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-amber-500"></span>
                        <span>0.5 - 0.9 h/m² (Normal)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-rose-500"></span>
                        <span>&gt; 0.9 h/m² (Overcrowded)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 3: FEATURE MAP ACTIVATIONS */}
                {selectedViewMode === 'feature_maps' && (
                  <div className="absolute inset-0 p-4 grid grid-cols-3 gap-2 overflow-y-auto">
                    {[1, 2, 3, 4, 5, 6].map((fIdx) => (
                      <div key={fIdx} className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[9px] font-mono text-indigo-300">
                          <span>Conv2D_Filter #{fIdx * 11}</span>
                          <span>3x3 Kernel</span>
                        </div>
                        <div className="h-16 w-full rounded bg-slate-950 border border-indigo-950/60 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,#4f46e5_25%,transparent_25%,transparent_50%,#4f46e5_50%,#4f46e5_75%,transparent_75%,transparent)] [background-size:8px_8px]"></div>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold z-10">ReLU Act: 0.{(fIdx * 15 + 23)}</span>
                        </div>
                        <div className="text-[8px] text-slate-500 font-mono">Feature: Edge Saliency</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Watermark & Status Pill */}
                <div className="absolute bottom-3 left-4 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-slate-400">Headcount:</span>
                  <span className={`font-bold ${
                    activeCamera.densityStatus === 'overcrowded' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {activeCamera.detectedHeadcount} Occupants
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">Density:</span>
                  <span className="text-slate-200 font-bold">{activeCamera.densityHeadsPerSqM} heads/m²</span>
                </div>
              </div>

              {/* Bottom Camera Details Bar */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Monitored Space</span>
                  <span className="text-slate-100 font-bold">{activeCamera.zoneName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Visual vs Badge Delta</span>
                  <span className={activeCamera.deltaDiscrepancy > 5 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    +{activeCamera.deltaDiscrepancy} Untracked
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Detection Confidence</span>
                  <span className="text-emerald-400 font-bold">{activeCamera.confidenceScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Feature Descriptor</span>
                  <span className="text-slate-300 text-[10px] truncate block">{activeCamera.featureMapDescription}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Layer Activations & Network Architecture */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">CNN Layer Architecture Pipeline</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                FORWARD PASS
              </span>
            </div>

            {/* Interactive Layer Pipeline Stack */}
            <div className="space-y-2">
              {inferenceData?.layerActivations.map((layer) => {
                const isSelected = layer.layerIndex === selectedLayerIndex;
                return (
                  <button
                    key={layer.layerIndex}
                    onClick={() => setSelectedLayerIndex(layer.layerIndex)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          L{layer.layerIndex}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{layer.layerName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-700 font-bold">{layer.latencyMs}ms</span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{layer.type} • {layer.kernelSize}</span>
                      <span className="text-slate-700 font-semibold">{layer.outputShape}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Layer Diagnostic Card */}
            {activeLayer && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">Layer {activeLayer.layerIndex}: {activeLayer.layerName}</span>
                  <span className="text-[10px] text-slate-400">Receptive: {activeLayer.receptiveField}</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  {activeLayer.activationMapSummary}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-500 block font-sans font-bold">Filter Count:</span>
                    <span className="text-slate-100 font-bold">{activeLayer.filterCount} Filters</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans font-bold">Tensor Shape:</span>
                    <span className="text-indigo-400 font-bold">{activeLayer.outputShape}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Modal Correlation: CNN Vision vs Badge Telemetry vs CO2 IAQ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Multi-Modal Telemetry Fusion: CNN Optical Vision vs RFID Badging vs IAQ Sensors
            </h3>
            <p className="text-xs text-slate-500">Cross-verifying optical computer vision headcounts against physical access control logs and air quality sensors.</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            FUSED DATA SYNCED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Camera Node</th>
                <th className="py-2.5 px-3">Monitored Zone</th>
                <th className="py-2.5 px-3">CNN Headcount</th>
                <th className="py-2.5 px-3">RFID Badges</th>
                <th className="py-2.5 px-3">Discrepancy (Delta)</th>
                <th className="py-2.5 px-3">Density (heads/m²)</th>
                <th className="py-2.5 px-3">Spatial Status</th>
                <th className="py-2.5 px-3 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {inferenceData?.cameras.map((cam) => {
                const isOvercrowded = cam.densityStatus === 'overcrowded';
                const hasDelta = cam.deltaDiscrepancy > 5;

                return (
                  <tr key={cam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>{cam.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-sans font-medium">{cam.zoneName}</td>
                    <td className="py-3 px-3 font-extrabold text-indigo-700">{cam.detectedHeadcount} heads</td>
                    <td className="py-3 px-3 text-slate-700">{cam.rfidBadgeCount} swipes</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        hasDelta ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cam.deltaDiscrepancy > 0 ? `+${cam.deltaDiscrepancy} Untracked` : '0 (Synced)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-bold">{cam.densityHeadsPerSqM}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOvercrowded ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cam.densityStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isOvercrowded ? (
                        <button
                          onClick={() => setActionSuccessMsg(`Purge command sent for ${cam.zoneName}. Airflow boosted (+25%).`)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Trigger Ventilation Purge
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Optimal Balancing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
