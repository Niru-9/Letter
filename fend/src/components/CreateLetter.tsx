import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Heart, Lock, ImagePlus, X, Loader } from 'lucide-react';

const IMGBB_KEY = '9635999d6d2859ccc646959bf0043cf0';

interface CreateLetterProps {
  onCreated: (data: { message: string; password: string; photoUrl?: string }) => void;
}

// Compress to max 1024px, JPEG 0.8 before uploading
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        // Return base64 without the data:image/jpeg;base64, prefix
        const full = canvas.toDataURL('image/jpeg', 0.8);
        resolve(full.split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToImgbb(base64: string): Promise<string> {
  const form = new FormData();
  form.append('key', IMGBB_KEY);
  form.append('image', base64);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Upload failed');
  const json = await res.json();
  return json.data.url as string;
}

export function CreateLetter({ onCreated }: CreateLetterProps) {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    try {
      const base64 = await compressImage(file);
      const url = await uploadToImgbb(base64);
      setPhotoUrl(url);
    } catch {
      setUploadError('Upload failed — photo will not be included.');
      setPhotoPreview(null);
      setPhotoUrl(null);
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const removePhoto = () => {
    setPhotoUrl(null);
    setPhotoPreview(null);
    setUploadError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (uploading) return; // wait for upload to finish
    if (message.trim() && password.trim()) {
      onCreated({ message, password, photoUrl: photoUrl ?? undefined });
    }
  };

  return (
    <div className="glass-panel create-letter-scene">
      <h1 className="gate-title">
        Write a Secret Letter{' '}
        <Heart
          size={22}
          fill="currentColor"
          color="var(--color-primary)"
          style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}
        />
      </h1>
      <p className="gate-subtitle">Seal your emotions with a password.</p>

      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <textarea
          className="letter-textarea"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        {/* Photo */}
        {photoPreview ? (
          <div className="photo-preview-wrapper">
            <img src={photoPreview} alt="Attached" className="photo-preview" />
            {uploading && (
              <div className="photo-uploading-overlay">
                <Loader size={20} className="spin" />
                <span>Uploading…</span>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                className="photo-remove-btn"
                onClick={removePhoto}
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="photo-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus size={18} />
            Add a Photo
          </button>
        )}

        {uploadError && (
          <p style={{ fontSize: '0.8rem', color: '#c0392b', textAlign: 'center', margin: '-8px 0' }}>
            {uploadError}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        <div className="password-input-wrapper">
          <input
            type="password"
            className="password-input"
            placeholder="Set a password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          className="unlock-btn"
          style={{ alignSelf: 'center' }}
          disabled={uploading}
        >
          {uploading ? 'Uploading photo…' : <>Create & Lock <Lock size={16} /></>}
        </button>
      </form>
    </div>
  );
}
