import { useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { useProductStore } from '../../store/useProductStore';
import { Settings, Save, RefreshCw, DollarSign } from 'lucide-react';

export function SettingsAdmin() {
  const { customDolarBlue, setCustomDolarBlue } = useAdminStore();
  const { dolarBlue, fetchDolarBlue } = useProductStore();
  
  const [localRate, setLocalRate] = useState<string>(
    customDolarBlue ? customDolarBlue.toString() : ''
  );

  const handleSave = () => {
    const rate = parseFloat(localRate);
    if (!isNaN(rate) && rate > 0) {
      setCustomDolarBlue(rate);
      alert('Tasa de cambio manual guardada correctamente. Toda la tienda usará este valor ahora.');
    } else {
      alert('Por favor ingresa un número válido.');
    }
  };

  const handleReset = async () => {
    setCustomDolarBlue(null);
    setLocalRate('');
    await fetchDolarBlue();
    alert('Modo Automático activado. Se ha restablecido el Dólar Blue consultando la API en tiempo real.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-widest mb-1">Configuración Global</h2>
        <p className="text-gray-500 font-medium">Ajustes generales del sistema y cotizaciones.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
          <DollarSign className="text-brand-green w-6 h-6" />
          <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wide">Control de Cotización (Dólar Blue)</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-brand-dark rounded-lg p-4 text-white flex items-center justify-between border-l-4 border-brand-gold">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Cotización Actual en Tienda</p>
              <p className="text-2xl font-black text-brand-gold">$ {customDolarBlue || dolarBlue}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-widest ${customDolarBlue ? 'bg-yellow-500/20 text-yellow-500' : 'bg-brand-green/20 text-brand-green'}`}>
                {customDolarBlue ? 'Modo Manual Activo' : 'Modo Automático (API)'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 font-bold mb-2 block">Forzar cotización manual (ARS):</span>
              <div className="flex gap-4">
                <input 
                  type="number"
                  value={localRate}
                  onChange={(e) => setLocalRate(e.target.value)}
                  placeholder="Ej: 1250"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-lg font-bold"
                />
                <button 
                  onClick={handleSave}
                  className="bg-brand-green hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Fijar Valor
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Si fijas un valor manual, la tienda ignorará la API en vivo y usará siempre este número para calcular los precios en pesos.
              </p>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button 
              onClick={handleReset}
              className="text-brand-dark bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Volver a Modo Automático (API)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
