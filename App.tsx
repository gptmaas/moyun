import React, { useState, useEffect } from 'react';
import CharacterDemo from './components/CharacterDemo';
import FreehandCanvas from './components/FreehandCanvas';
import { getCharacterDetails, gradeHandwriting } from './services/geminiService';
import { CharacterData, GradingResult } from './types';

const INITIAL_CHAR = '永';

const App: React.FC = () => {
  const [inputChar, setInputChar] = useState<string>(INITIAL_CHAR);
  const [activeChar, setActiveChar] = useState<string>(INITIAL_CHAR);
  const [charData, setCharData] = useState<CharacterData | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Controls the mode of the HanziWriter (Demo = Animation, Quiz = Guided)
  const [demoMode, setDemoMode] = useState<'demo' | 'quiz'>('demo');

  // Load initial character data
  useEffect(() => {
    fetchData(INITIAL_CHAR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (char: string) => {
    try {
      setError(null);
      setCharData(null); // Reset while loading
      const data = await getCharacterDetails(char);
      setCharData(data);
    } catch (err) {
      setError("无法获取汉字详情。");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChar) return;
    const char = inputChar.charAt(0); // Only take first char
    setActiveChar(char);
    setInputChar(char);
    setGradingResult(null); // Clear previous grades
    fetchData(char);
  };

  const handleGradeSubmission = async (base64Image: string) => {
    setIsGrading(true);
    const result = await gradeHandwriting(activeChar, base64Image);
    setGradingResult(result);
    setIsGrading(false);
  };

  return (
    <div className="min-h-screen text-stone-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 py-6 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-serif text-2xl font-bold rounded">
                 墨
             </div>
             <div>
                <h1 className="text-2xl font-serif font-bold tracking-wide">墨韵 (MoYun)</h1>
                <p className="text-xs text-stone-500 tracking-wider uppercase">AI 智能书法导师</p>
             </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              maxLength={1}
              value={inputChar}
              onChange={(e) => setInputChar(e.target.value)}
              placeholder="请输入汉字 (如: 龙)"
              className="border border-stone-300 rounded px-4 py-2 w-56 text-center text-lg focus:outline-none focus:border-red-500 font-serif"
            />
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              开始练习
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4">
        
        {/* Character Info Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-stone-100 mb-8 flex flex-wrap justify-between items-center gap-6">
            <div>
                <h2 className="text-6xl font-serif mb-2">{activeChar}</h2>
            </div>
            
            {charData ? (
                <div className="flex-1 flex flex-wrap gap-8 text-sm md:text-base">
                    <div>
                        <span className="block text-stone-400 text-xs uppercase tracking-wide">拼音</span>
                        <span className="font-bold text-xl text-red-600">{charData.pinyin}</span>
                    </div>
                    <div>
                        <span className="block text-stone-400 text-xs uppercase tracking-wide">释义</span>
                        <span className="font-serif italic">{charData.definition}</span>
                    </div>
                    <div>
                        <span className="block text-stone-400 text-xs uppercase tracking-wide">部首</span>
                        <span>{charData.radical}</span>
                    </div>
                     <div>
                        <span className="block text-stone-400 text-xs uppercase tracking-wide">总笔画</span>
                        <span>{charData.strokeCount}</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 text-stone-400 italic">
                    {error ? <span className="text-red-400">{error}</span> : "正在加载详情..."}
                </div>
            )}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Demo & Learn */}
            <section className="flex flex-col items-center">
                <div className="flex items-center justify-between w-[300px] mb-4">
                    <h3 className="font-bold text-stone-700">1. 笔顺学习</h3>
                    <div className="flex bg-stone-100 rounded p-1">
                        <button 
                            onClick={() => setDemoMode('demo')}
                            className={`px-3 py-1 text-xs rounded transition-colors ${demoMode === 'demo' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-500'}`}
                        >
                            演示
                        </button>
                        <button 
                            onClick={() => setDemoMode('quiz')}
                            className={`px-3 py-1 text-xs rounded transition-colors ${demoMode === 'quiz' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-500'}`}
                        >
                            描红
                        </button>
                    </div>
                </div>
                
                <CharacterDemo char={activeChar} mode={demoMode} />
                
                <div className="mt-6 max-w-[300px] text-center text-sm text-stone-500">
                    {demoMode === 'demo' 
                        ? "观看动画演示，掌握正确的笔顺和书写节奏。" 
                        : "跟随引导进行描红练习，系统将辅助您纠正笔画。"}
                </div>
            </section>

            {/* Right: Freehand & AI Grade */}
            <section className="flex flex-col items-center">
                <div className="flex items-center justify-between w-[300px] mb-4">
                    <h3 className="font-bold text-stone-700">2. 自由临摹</h3>
                </div>

                <FreehandCanvas 
                    width={300} 
                    height={300} 
                    onExport={handleGradeSubmission} 
                    isGrading={isGrading}
                />

                {/* AI Feedback Area */}
                {gradingResult && (
                    <div className="w-full max-w-md mt-8 animate-fade-in">
                        <div className="bg-stone-5 rounded-lg border border-stone-200 p-6">
                            <div className="flex items-center justify-between mb-4 border-b border-stone-200 pb-4">
                                <h4 className="font-serif font-bold text-lg">AI 智能点评</h4>
                                <div className={`text-2xl font-bold ${gradingResult.score >= 80 ? 'text-green-600' : gradingResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {gradingResult.score}<span className="text-sm text-stone-400 font-normal">/100</span>
                                </div>
                            </div>
                            
                            <p className="text-stone-700 mb-4 text-sm leading-relaxed">
                                {gradingResult.feedback}
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h5 className="font-bold text-green-700 mb-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        亮点
                                    </h5>
                                    <ul className="list-disc list-inside text-stone-600 space-y-1">
                                        {gradingResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-red-700 mb-2 flex items-center gap-1">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        待改进
                                    </h5>
                                    <ul className="list-disc list-inside text-stone-600 space-y-1">
                                        {gradingResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>

      </main>
    </div>
  );
};

export default App;