'use client';
import { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeImage, type ImageAnalysisResponse } from '@/lib/api';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import EmergencyAlert from '@/components/EmergencyAlert';

type ImageType = 'auto' | 'prescription' | 'injury' | 'report' | 'skin';

const TYPE_LABELS: Record<ImageType, string> = {
  auto: '🔍 Auto-detect',
  prescription: '💊 Prescription',
  injury: '🩹 Physical injury',
  report: '📋 Lab report',
  skin: '🧴 Skin condition',
};

export default function ImageAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [type, setType] = useState<ImageType>('auto');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);
  const [error, setError] = useState('');

  function handleFile(f: File | null) {
    setFile(f);
    setResult(null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  }

  async function handleSubmit() {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await analyzeImage(file, type, context);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="eyebrow mb-2"><Sparkles className="w-3 h-3" /> Vision AI</div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">Image Analysis</h1>
        <p className="text-sm text-ink-500">
          Upload a prescription, lab report, or photo of an injury for AI-powered analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <label className="label">Image type</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(Object.keys(TYPE_LABELS) as ImageType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-sm px-3 py-2 rounded-xl border transition-all ${
                  type === t
                    ? 'bg-ink-950 border-ink-950 text-white font-medium shadow-soft'
                    : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <label className="label">Upload image</label>
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-ink-200 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all bg-ink-50/40">
            {preview ? (
              <img src={preview} alt="preview" className="max-h-44 object-contain rounded-lg" />
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-ink-400" />
                </div>
                <span className="text-sm text-ink-600 font-medium">Click to upload</span>
                <span className="text-xs text-ink-400 mt-1">JPG, PNG up to 10MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </label>

          <label className="label mt-4">
            Additional context (optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="e.g. 3 days old, painful to touch"
            className="input mb-4 resize-none"
          />

          <button onClick={handleSubmit} disabled={loading || !file} className="btn-accent w-full">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Analyzing…</>
            ) : (
              <>Analyze Image</>
            )}
          </button>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        <div>
          {!result && !loading && (
            <div className="card flex flex-col items-center justify-center text-center text-ink-400 h-full min-h-[300px]">
              <div className="w-14 h-14 bg-ink-50 rounded-2xl flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-ink-300" />
              </div>
              <p className="text-sm">Upload an image to see AI analysis here.</p>
            </div>
          )}

          {loading && (
            <div className="card flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin mb-3" />
              <p className="text-sm text-ink-500">Analyzing image…</p>
            </div>
          )}

          {result && (
            <div className="space-y-3 animate-fade-up">
              {result.urgency === 'emergency' && <EmergencyAlert message="This image suggests possible emergency. Seek medical attention." />}

              <div className="card">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="text-ink-400">Type:</span>{' '}
                    <span className="font-medium text-ink-900 capitalize">{result.detected_type}</span>
                  </div>
                  <ConfidenceBadge confidence={result.confidence} />
                </div>

                {result.suggested_specialty && (
                  <div className="mb-3 text-sm">
                    <span className="text-ink-400">Suggested specialty:</span>{' '}
                    <span className="font-medium text-brand-700">{result.suggested_specialty}</span>
                  </div>
                )}

                <div className="prose prose-sm max-w-none prose-headings:text-ink-900 prose-strong:text-ink-900">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>

                <div className="text-xs text-ink-400 italic mt-4 pt-3 border-t border-ink-100">
                  {result.disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
