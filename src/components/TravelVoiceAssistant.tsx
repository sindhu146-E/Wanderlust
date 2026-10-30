import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Compass,
  Sparkles,
  MapPin,
} from 'lucide-react';
import type { ConversationTurn } from '../lib/supabase';
import { generateTravelResponse } from '../lib/voiceEngine';
import { useSpeechRecognition, useSpeechSynthesis } from '../lib/useSpeech';
import { supabase } from '../lib/supabase';

const SUGGESTED_PROMPTS = [
  'I want a beach vacation',
  'How much is the Iceland trip?',
  'What is the itinerary for Kyoto?',
  'Recommend an adventure destination',
  'When is the best time to visit Bali?',
  'Tell me about Patagonia',
];

export function TravelVoiceAssistant({
  onDestinationMatch,
}: {
  onDestinationMatch?: (slug: string) => void;
}) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const sessionId = useRef(
    `sess_${Math.random().toString(36).slice(2, 10)}`,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const synth = useSpeechSynthesis();
  const recognition = useSpeechRecognition((text) => {
    handleUserInput(text);
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, thinking]);

  const accent = '#10b981';

  function pushTurn(turn: ConversationTurn) {
    setTurns((prev) => [...prev, turn]);
  }

  async function persistConversation(
    userText: string,
    assistantText: string,
    intent: string,
  ) {
    try {
      await supabase.from('voice_conversations').insert({
        transcript: [
          ...turns,
          { role: 'user', text: userText, ts: Date.now() },
          { role: 'assistant', text: assistantText, ts: Date.now() + 1 },
        ],
        user_input: userText,
        assistant_response: assistantText,
        intent,
        session_id: sessionId.current,
      });
    } catch {
      // best-effort
    }
  }

  function handleUserInput(text: string) {
    if (!text.trim()) return;
    pushTurn({ role: 'user', text, ts: Date.now() });
    setInput('');
    setThinking(true);

    const delay = 500 + Math.random() * 600;
    setTimeout(() => {
      const result = generateTravelResponse(text);
      pushTurn({
        role: 'assistant',
        text: result.response,
        ts: Date.now(),
      });
      setThinking(false);
      if (!muted) synth.speak(result.response);
      void persistConversation(text, result.response, result.intent);
      if (result.matchedDestination && onDestinationMatch) {
        onDestinationMatch(result.matchedDestination);
      }
    }, delay);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleUserInput(input);
  }

  function toggleListen() {
    if (!recognition.supported) return;
    if (recognition.listening) recognition.stop();
    else recognition.start();
  }

  function reset() {
    setTurns([]);
    synth.cancel();
    setThinking(false);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
          >
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Travel Assistant</p>
            <p className="text-xs text-ink-400">Powered by voice AI</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-brand-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
          Online
        </span>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="h-[380px] space-y-4 overflow-y-auto scrollbar-thin px-4 py-5 sm:px-6"
      >
        {turns.length === 0 && !thinking && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${accent}1a`, color: accent }}
            >
              <Compass className="h-7 w-7" />
            </div>
            <p className="mb-1 text-sm font-semibold text-white">
              Hi! I'm your travel assistant
            </p>
            <p className="max-w-xs text-sm text-ink-400">
              Tap the mic and ask me about destinations, prices,
              itineraries, or the best time to travel. Or try a suggestion
              below.
            </p>
          </div>
        )}

        {turns.map((t, i) => (
          <Message key={i} turn={t} accent={accent} />
        ))}

        {thinking && <ThinkingBubble accent={accent} />}
      </div>

      {/* Suggested prompts */}
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-6">
          {SUGGESTED_PROMPTS.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => handleUserInput(q)}
              className="chip transition-all hover:border-brand-500/50 hover:text-white"
            >
              <Sparkles className="h-3 w-3 text-brand-400" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-ink-800 bg-ink-900/80 px-4 py-3 sm:px-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListen}
            disabled={!recognition.supported}
            title={
              recognition.supported
                ? 'Voice input'
                : 'Voice input not supported in this browser'
            }
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all ${
              recognition.listening
                ? 'bg-coral-500 text-white'
                : recognition.supported
                  ? 'text-ink-200 hover:bg-ink-800'
                  : 'cursor-not-allowed text-ink-600'
            }`}
          >
            {recognition.listening && (
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-coral-500/40" />
            )}
            {recognition.listening ? (
              <MicOff className="relative h-5 w-5" />
            ) : (
              <Mic className="relative h-5 w-5" />
            )}
          </button>

          <div className="relative flex-1">
            <input
              value={
                recognition.listening
                  ? recognition.interim || 'Listening…'
                  : input
              }
              onChange={(e) => setInput(e.target.value)}
              disabled={recognition.listening}
              placeholder={
                recognition.listening
                  ? 'Listening…'
                  : 'Ask about a destination, price, or itinerary…'
              }
              className="w-full rounded-full border border-ink-700 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || recognition.listening}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-all hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {/* Controls */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-400 transition-colors hover:text-white"
            >
              {muted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" /> Voice off
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" /> Voice on
                </>
              )}
            </button>
            {synth.speaking && !muted && (
              <span className="flex items-center gap-1 text-xs text-ink-400">
                <span className="flex h-3 items-end gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-0.5 animate-wave rounded-full bg-brand-400"
                      style={{
                        height: '100%',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </span>
                Speaking
              </span>
            )}
            {recognition.listening && (
              <span className="flex items-center gap-1 text-xs text-coral-400">
                <MapPin className="h-3.5 w-3.5" /> Listening…
              </span>
            )}
          </div>
          {turns.length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-400 transition-colors hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Message({
  turn,
  accent,
}: {
  turn: ConversationTurn;
  accent: string;
}) {
  const isUser = turn.role === 'user';
  return (
    <div
      className={`flex animate-fade-up gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Compass className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-ink-700 text-white'
            : 'rounded-bl-md bg-ink-800/80 text-ink-100'
        }`}
      >
        {turn.text}
      </div>
      {isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-700 text-xs font-bold text-ink-200">
          You
        </div>
      )}
    </div>
  );
}

function ThinkingBubble({ accent }: { accent: string }) {
  return (
    <div className="flex animate-fade-in gap-3">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Compass className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-ink-800/80 px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full"
              style={{
                backgroundColor: accent,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
