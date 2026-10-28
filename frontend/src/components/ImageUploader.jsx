import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import axios from 'axios';

export const ImageUploader = ({ 
  imageUrl, 
  onImageUploaded, 
  onRemoveImage,
  endpoint = "/api/issues/upload",
  label = "Upload Issue Photograph",
  hint = "PNG, JPG or WEBP up to 10MB. AI will analyze visual damage patterns."
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onImageUploaded(res.data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {imageUrl ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group max-w-md">
          <img 
            src={imageUrl} 
            alt="Uploaded Preview" 
            className="w-full h-56 object-cover transition duration-200 group-hover:opacity-90"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="bg-emerald-600/90 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
              <Check className="w-3 h-3" /> Image Uploaded
            </span>
            <button
              type="button"
              onClick={onRemoveImage}
              className="bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-md transition shadow"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="truncate">{imageUrl.split('/').pop()}</span>
            <span className="text-[11px] text-smart-600 font-medium">Ready for AI Vision Analysis</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
            dragOver 
              ? 'border-smart-500 bg-smart-50/50' 
              : 'border-slate-300 hover:border-smart-400 bg-slate-50/70 hover:bg-white'
          }`}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {uploading ? (
            <div className="py-4 flex flex-col items-center gap-2 text-smart-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Analyzing and uploading photograph...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-smart-100 text-smart-600 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{hint}</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
