import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Zap, Wrench, RefreshCw, CheckCircle2, Users, ShieldCheck } from 'lucide-react';
import { AgentChatMessage } from '../../types';
import { queryAiAgentApi, createWorkOrderApi } from '../../api/client';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkOrderCreated?: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onWorkOrderCreated,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      agentType: 'general',
      text: 'Hello! I am your FacilityOps Autonomous Agent powered by Gemini 3.6 Flash. I continuously analyze HVAC telemetry, electrical peak loads, room occupancy densities, and perimeter security. How can I assist you?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [agentType, setAgentType] = useState<'energy' | 'maintenance' | 'occupancy' | 'security' | 'general'>('general');
  const [loading, setLoading] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await queryAiAgentApi(userText, agentType);
      const agentMsg: AgentChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        agentType: agentType,
        text: res.response || res.message || 'Analysis complete.',
        actionRecommendation: res.recommendation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'agent',
          text: 'Encountered an issue querying the AI service. Running in offline diagnostic mode.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (msgId: string, rec: any) => {
    if (rec.type === 'create_workorder') {
      await createWorkOrderApi({
        title: rec.payload?.title || 'AI Dispatched Work Order',
        equipmentId: rec.payload?.equipmentId || 'COOLING-TOWER-01',
        equipmentName: rec.payload?.equipmentName || 'Cooling Tower 1',
        priority: 'urgent',
        description: 'Auto-dispatched via Gemini Agent Diagnostic Command Center.',
      });
      setActionDone(msgId);
      if (onWorkOrderCreated) onWorkOrderCreated();
    } else {
      setActionDone(msgId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity font-sans">
      <div className="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 rounded-lg text-white shadow-xs">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                Gemini Agent Console
                <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 rounded font-mono font-bold">
                  3.6 Flash
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Autonomous Facility Operations Intelligence</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Specialty Selector */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setAgentType('general')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
              agentType === 'general'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setAgentType('energy')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              agentType === 'energy'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3 h-3" />
            Energy (M1)
          </button>
          <button
            onClick={() => setAgentType('maintenance')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              agentType === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3 h-3" />
            Maint (M2)
          </button>
          <button
            onClick={() => setAgentType('occupancy')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              agentType === 'occupancy'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3 h-3" />
            Occupancy (M3)
          </button>
          <button
            onClick={() => setAgentType('security')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              agentType === 'security'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Security (M3)
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs font-medium'
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-cyan-700 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="uppercase tracking-wider font-mono">
                      {msg.agentType ? `${msg.agentType} Agent` : 'Gemini 3.6 Flash Agent'}
                    </span>
                  </div>
                )}
                <div>{msg.text}</div>

                {/* Agent Recommended Actions */}
                {msg.actionRecommendation && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Recommended Autonomous Action
                    </div>
                    {actionDone === msg.id ? (
                      <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Action Executed & Synced with Backend</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExecuteAction(msg.id, msg.actionRecommendation)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        {msg.actionRecommendation.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-700 bg-white p-2.5 rounded-lg border border-slate-200 w-max animate-pulse font-bold shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Gemini Agent evaluating BMS telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask agent e.g., Assess Chiller 1 COP or predict energy peak..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 text-cyan-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
