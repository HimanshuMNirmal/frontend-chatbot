import { useState, useEffect } from 'react';
import apiService from '../../services/api';

interface AIConfig {
    id: string;
    isEnabled: boolean;
    provider: string;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
}

function AISettings() {
    const [config, setConfig] = useState<AIConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await apiService.get('/api/ai/config');
            setConfig(data);
        } catch (error) {
            console.error('Failed to load AI config:', error);
            setMessage('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        if (!config) return;

        setSaving(true);
        try {
            const updated = await apiService.post('/api/ai/toggle', {
                isEnabled: !config.isEnabled,
            });
            setConfig(updated);
            setMessage(`AI ${updated.isEnabled ? 'enabled' : 'disabled'} successfully`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to toggle AI:', error);
            setMessage('Failed to toggle AI');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        setSaving(true);
        try {
            const updated = await apiService.put('/api/ai/config', {
                provider: config.provider,
                model: config.model,
                systemPrompt: config.systemPrompt,
                temperature: config.temperature,
                maxTokens: config.maxTokens,
            });
            setConfig(updated);
            setMessage('Configuration saved successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save config:', error);
            setMessage('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-gray-600">Loading AI configuration...</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-red-600">Failed to load AI configuration</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">AI Settings</h2>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${config.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {config.isEnabled ? 'AI Enabled' : 'AI Disabled'}
                    </span>
                    <button
                        onClick={handleToggle}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.isEnabled ? 'bg-green-600' : 'bg-gray-300'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="space-y-4">
                {/* Provider Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Provider
                    </label>
                    <select
                        value={config.provider}
                        onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="openrouter">OpenRouter (Free)</option>
                    </select>
                </div>

                {/* Model Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                    </label>
                    <select
                        value={config.model}
                        onChange={(e) => setConfig({ ...config, model: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="z-ai/glm-4.5-air:free">GLM-4.5 Air (Free)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Free model via OpenRouter</p>
                </div>

                {/* System Prompt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Prompt
                    </label>
                    <textarea
                        value={config.systemPrompt}
                        onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Define the AI's role and behavior..."
                    />
                </div>

                {/* Temperature */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature: {config.temperature}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>More Focused</span>
                        <span>More Creative</span>
                    </div>
                </div>

                {/* Max Tokens */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                    </label>
                    <input
                        type="number"
                        min="50"
                        max="2000"
                        value={config.maxTokens}
                        onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum length of AI responses (50-2000)</p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• When enabled, AI automatically responds to user messages</li>
                    <li>• Users see "AI is thinking..." while response generates</li>
                    <li>• AI messages appear with green styling and AI badge</li>
                    <li>• Conversation history is used for context-aware responses</li>
                </ul>
            </div>
        </div>
    );
}

export default AISettings;
