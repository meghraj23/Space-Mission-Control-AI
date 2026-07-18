import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Mic, Volume2, Trash2, Cpu, MessageSquare, ShieldCheck, Play } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // 1. Initialize speech recognition browser APIs
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // 2. Fetch Chat History on mount
  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        // Welcome message if history empty
        setMessages([
          {
            sender: 'ai',
            text: `### Onboard Flight Control AI Systems Online

Onboard diagnostic matrices, orbital mechanics solvers, and weather prediction vectors are active. Ask me to:
* **"Diagnose rocket engine"** to scan thermal anomalies.
* **"Is weather GO for launch?"** to query geomagnetic forecasts.
* **"Plan a mission to Mars"** to outline orbit parameters.
* **"Troubleshoot Hubble orbit"** to calculate delta-V boosts.`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 3. Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');

    // Append user message locally
    const userMsg = { sender: 'user', text: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: messageText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.data.data.message, timestamp: new Date() }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error establishing connection link with AI core modules.', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete('http://localhost:5000/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // TTS helper (Reads text out loud)
  const handleSpeak = (text) => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech synthesis
    const plainText = text
      .replace(/#+\s/g, '')
      .replace(/>\s\[!\w+\]/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '');

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => setSpeaking(false);
    utterance.onstart = () => setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // Speech Recognition listener
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Convert markdown alerts/headers into simple custom HTML rendering for React
  const renderMessageContent = (text) => {
    // Simple custom compiler for codeblocks/alerts/headers
    const lines = text.split('\n');
    let inAlert = false;
    let alertType = '';
    let compiled = [];

    lines.forEach((line, idx) => {
      // Headers
      if (line.startsWith('###')) {
        compiled.push(<h3 key={idx} className="text-sm font-bold font-orbitron text-accentCyan mt-3 mb-2">{line.replace('###', '').trim()}</h3>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        compiled.push(<h4 key={idx} className="text-xs font-bold font-orbitron text-white mt-2">{line.replace(/\*\*/g, '').trim()}</h4>);
      }
      // GitHub alerts
      else if (line.includes('> [!NOTE]')) {
        inAlert = true; alertType = 'note';
      } else if (line.includes('> [!WARNING]')) {
        inAlert = true; alertType = 'warning';
      } else if (line.includes('> [!TIP]')) {
        inAlert = true; alertType = 'tip';
      } else if (inAlert && line.startsWith('>')) {
        const textOnly = line.replace('>', '').trim();
        const colorClass = alertType === 'warning' ? 'text-accentDanger bg-accentDanger/10 border-accentDanger' : (alertType === 'tip' ? 'text-accentPurple bg-accentPurple/10 border-accentPurple' : 'text-accentCyan bg-accentCyan/10 border-accentCyan');
        compiled.push(
          <div key={idx} className={`p-3 border-l-4 rounded-r-lg font-mono text-[10px] mt-2 mb-2 leading-relaxed ${colorClass}`}>
            {textOnly}
          </div>
        );
        inAlert = false; // reset
      }
      // Lists/Bullet points
      else if (line.startsWith('*') || line.startsWith('-')) {
        compiled.push(
          <li key={idx} className="ml-4 list-disc text-xs text-gray-300 font-mono py-0.5">
            {line.substring(1).trim()}
          </li>
        );
      }
      // Code logs
      else if (line.startsWith('>') && !inAlert) {
        compiled.push(
          <blockquote key={idx} className="border-l-2 border-accentCyan/50 pl-3 py-1 my-2 text-[10px] text-accentCyan font-mono bg-spaceBg/25 italic">
            {line.substring(1).trim()}
          </blockquote>
        );
      }
      // Standard content
      else if (line.trim() !== '') {
        // Highlight inline markdown **text**
        const formattedLine = line.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{chunk}</strong> : chunk);
        compiled.push(<p key={idx} className="text-xs text-gray-300 leading-relaxed font-mono py-1">{formattedLine}</p>);
      }
    });

    return <div className="flex flex-col gap-0.5">{compiled}</div>;
  };

  const presetChips = [
    { label: 'Diagnose Engine Anomaly', prompt: 'diagnose Raptor engine manifold temperature fluctuation' },
    { label: 'Check Launch Weather', prompt: 'is the solar weather forecast GO for launch T-0?' },
    { label: 'Mars Flight Blueprint', prompt: 'generate flight blueprint payload allocation to Mars Jezero' },
    { label: 'Troubleshoot Hubble Orbit', prompt: 'suggest Hohmann orbit correction booster delta-V for Hubble' },
  ];

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 h-[calc(100vh-80px)] overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            FLIGHT ASSISTANT AI
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">COGNITIVE MISSION INTERPOLATOR &bull; INTEGRATED TTS/STT</p>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-2 border border-white/5 hover:border-accentDanger/40 hover:bg-accentDanger/10 rounded text-gray-400 hover:text-accentDanger transition-all"
          title="Clear Chat History"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Left Side: Conversational feed */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-spaceCard/20 border border-white/5 rounded-xl p-4 md:p-6 backdrop-blur-md">
          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-full border border-accentCyan/30 bg-spaceCard/80 flex items-center justify-center text-accentCyan shrink-0">
                    <Cpu className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-xl p-4 relative group ${
                  msg.sender === 'user'
                    ? 'bg-accentPurple/15 border border-accentPurple/30 text-white rounded-tr-none'
                    : 'bg-spaceCard/60 border border-white/5 text-gray-300 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="text-xs font-mono leading-relaxed">{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}

                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-accentCyan"
                      title="Listen"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full border border-accentPurple/30 bg-spaceCard/80 flex items-center justify-center text-accentPurple shrink-0 font-bold font-mono text-xs">
                    OP
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 items-center">
                <div className="h-8 w-8 rounded-full border border-accentCyan/30 bg-spaceCard/80 flex items-center justify-center text-accentCyan animate-pulse">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Form input controls */}
          <div className="flex gap-3 border-t border-white/5 pt-4 shrink-0">
            <button
              onClick={toggleListening}
              className={`p-3 border rounded-xl transition-all ${
                listening
                  ? 'border-accentDanger bg-accentDanger/10 text-accentDanger animate-pulse shadow-glow-danger'
                  : 'border-white/5 bg-spaceBg/60 text-gray-400 hover:border-accentCyan/40 hover:text-accentCyan'
              }`}
              title="Voice Input"
            >
              <Mic className="h-5 w-5" />
            </button>

            <input
              type="text"
              placeholder={listening ? 'Onboard sensors listening...' : 'Communicate orbital vector orders...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 rounded-xl px-4 text-xs font-mono text-white outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="btn-cyber-primary p-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Command chips */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:overflow-y-auto">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Preset AI Scans</h3>
          <div className="flex flex-col gap-3">
            {presetChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                className="w-full text-left p-3.5 border border-white/5 hover:border-accentCyan/30 bg-spaceCard/40 hover:bg-spaceCard/70 rounded-xl transition-all text-xs font-mono text-gray-400 hover:text-accentCyan flex items-center justify-between gap-3 group"
              >
                <span>{chip.label}</span>
                <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <GlassCard className="flex flex-col gap-3 border-l-4 border-l-accentCyan mt-auto">
            <div className="flex items-center gap-2 text-accentCyan text-xs font-bold font-orbitron">
              <ShieldCheck className="h-4 w-4" />
              <span>CORE INTERPOLATION</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              Flight assistant queries compile down to secondary booster adjustments, life support evaluations, and thermal mapping analysis.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default AiAssistant;
