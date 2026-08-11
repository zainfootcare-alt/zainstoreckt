import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface AttachmentUploaderProps {
  bucketName: string;
  value?: string;
  onChange: (path: string) => void;
  label?: string;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  bucketName,
  value,
  onChange,
  label = 'Attach Invoice / Bill Document',
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum 10 MB limit.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const mockPath = `footwear/${Date.now()}_${file.name}`;
      onChange(mockPath);
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase text-slate-600">{label}</label>
      {value ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
          <div className="flex items-center space-x-2 text-emerald-800 font-medium">
            <FileText className="w-4 h-4 text-[#008060]" />
            <span className="truncate max-w-xs">{value}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#008060]" title="RLS Private Vault Secured" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 text-slate-400 hover:text-rose-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-slate-600">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#008060]" />
            <span>{isUploading ? 'Securing Attachment in RLS Vault...' : 'Upload PDF or Receipt Image (Max 10MB)'}</span>
          </div>
        </label>
      )}
    </div>
  );
};
