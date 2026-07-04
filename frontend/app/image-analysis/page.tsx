"use client";

import { useState } from 'react';
import { analyzeImage } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ImageAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('auto');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError('Please choose an image first');
    setLoading(true);
    setError(null);
    try {
      const resp = await analyzeImage(file, type, 'uploaded from frontend');
      setResult(resp);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-4">Image Analysis</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-2 py-1">
            <option value="auto">Auto</option>
            <option value="injury">Injury</option>
            <option value="prescription">Prescription</option>
            <option value="report">Report</option>
            <option value="skin">Skin</option>
          </select>
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 bg-[#2E6BE6] text-white px-4 py-2 rounded">
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Analyze'}
          </button>
        </div>

        {preview && (
          <div className="rounded border p-2">
            <img src={preview} alt="preview" className="max-h-64 object-contain" />
          </div>
        )}

        {error && <div className="text-red-600">{error}</div>}

        {result && (
          <div className="bg-white rounded p-4 border">
            <h2 className="font-semibold">Analysis</h2>
            <p className="whitespace-pre-wrap mt-2">{result.analysis}</p>
            <div className="mt-3 text-sm text-muted-foreground">
              <div><strong>Detected Type:</strong> {result.detected_type}</div>
              <div><strong>Urgency:</strong> {result.urgency}</div>
              <div><strong>Suggested Specialty:</strong> {result.suggested_specialty}</div>
              <div><strong>Confidence:</strong> {result.confidence}</div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
