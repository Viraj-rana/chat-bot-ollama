import React from 'react';
import { ChatWidget } from './components/ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Landing Page Simulation */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
            {/* Replaced external image with a CSS pattern for offline support */}
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 flex items-center justify-center opacity-60">
                 <div className="w-full h-full opacity-20" style={{ 
                     backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}></div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 z-20">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Старт продаж</span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">ЖК ПАТРИКИ</h1>
                <p className="text-lg text-slate-200 max-w-lg">Новый центр притяжения в Краснодаре. Европейский комфорт, южный климат.</p>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Локация</h3>
                    <p className="text-slate-600 text-sm">Центр Карасунского округа. 15 минут до аэропорта, 3 минуты до трамвая.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Инфраструктура</h3>
                    <p className="text-slate-600 text-sm">Школа и 3 детских сада внутри. Гранд-аллея с ресторанами.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Инвестиции</h3>
                    <p className="text-slate-600 text-sm">Рост цены +25% к сдаче. Высокий спрос на аренду.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Есть вопросы?</h2>
                    <p className="text-slate-600">Наш AI-ассистент готов рассказать про планировки, цены и условия покупки 24/7.</p>
                </div>
                <button 
                    onClick={() => document.querySelector<HTMLButtonElement>('button[class*="fixed bottom-6"]')?.click()}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                >
                    Спросить ассистента
                </button>
            </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>© 2024 ГК «ТОЧНО». Все права защищены.</p>
        <p className="mt-2 text-xs">Программное обеспечение создано и поддерживается AVALIN.</p>
      </footer>

      {/* The Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;