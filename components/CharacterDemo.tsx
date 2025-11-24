import React, { useEffect, useRef, useState } from 'react';
import { HanziWriterInstance, HanziWriterOptions } from '../types';

// Access the global HanziWriter class loaded from CDN
declare const HanziWriter: any;

interface CharacterDemoProps {
  char: string;
  mode: 'demo' | 'quiz';
  onQuizComplete?: (summary: any) => void;
}

const CharacterDemo: React.FC<CharacterDemoProps> = ({ char, mode, onQuizComplete }) => {
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const containerId = useRef(`hanzi-writer-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if HanziWriter is loaded
    if (typeof HanziWriter === 'undefined') {
      console.warn("HanziWriter script not loaded yet.");
      setIsLoading(true);
      return;
    }

    // Cleanup previous instance
    const container = document.getElementById(containerId.current);
    if (container) container.innerHTML = '';
    
    if (!char) return;

    setIsLoading(true);

    try {
      const options: HanziWriterOptions = {
        width: 300,
        height: 300,
        padding: 20,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
        strokeColor: '#333333',
        radicalColor: '#166534', // green-700
      };

      writerRef.current = HanziWriter.create(containerId.current, char, {
        ...options,
        onLoadCharDataSuccess: () => {
          setIsLoading(false);
          if (mode === 'demo') {
            writerRef.current?.animateCharacter({ 
               onComplete: () => {
                 // Loop animation with delay
                 setTimeout(() => {
                   if (writerRef.current && mode === 'demo') {
                     writerRef.current.animateCharacter();
                   }
                 }, 2000);
               }
            });
          } else if (mode === 'quiz') {
            writerRef.current?.quiz({
              onComplete: (summary: any) => {
                if (onQuizComplete) onQuizComplete(summary);
              }
            });
          }
        },
        onLoadCharDataError: (err: any) => {
          console.error("Failed to load char", err);
          setIsLoading(false);
        }
      });
    } catch (e) {
      console.error("HanziWriter init error", e);
      setIsLoading(false);
    }

    return () => {
        // Cleanup if necessary
    };
  }, [char, mode, onQuizComplete]);

  // Re-trigger quiz/demo if mode switches but char stays same
  useEffect(() => {
    if (!writerRef.current || isLoading) return;
    
    if (mode === 'demo') {
        writerRef.current.cancelQuiz();
        writerRef.current.showOutline();
        writerRef.current.animateCharacter();
    } else {
        writerRef.current.cancelQuiz();
        writerRef.current.hideOutline();
        writerRef.current.quiz({
            onComplete: (summary: any) => {
                if(onQuizComplete) onQuizComplete(summary);
            }
        });
    }
  }, [mode, isLoading, onQuizComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white border-2 border-red-500 rounded shadow-inner tian-zi-ge" style={{ width: 300, height: 300 }}>
         {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                 {typeof HanziWriter === 'undefined' ? '加载组件中...' : '加载汉字中...'}
             </div>
         )}
        <div id={containerId.current} className="w-full h-full" />
      </div>
      <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
        {mode === 'demo' ? '动画演示模式' : '描红测试模式'}
      </p>
    </div>
  );
};

export default CharacterDemo;