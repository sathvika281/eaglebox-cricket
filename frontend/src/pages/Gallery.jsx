import React, { useState, useEffect, useRef } from 'react';
import { getAllPhotos, addMatchPhoto, deletePhoto, uploadPhoto } from '../api/gallery.api';
import { getMyMatches } from '../api/matches.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function Gallery() {
  const [photos, setPhotos]     = useState([]);
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [matchId, setMatchId]   = useState('');
  const [caption, setCaption]   = useState('');
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef();

  const loadPhotos = () =>
    getAllPhotos()
      .then(({ data: res }) => setPhotos(res.data?.photos || []))
      .catch(() => {});

  useEffect(() => {
    Promise.all([getAllPhotos(), getMyMatches()])
      .then(([pRes, mRes]) => {
        setPhotos(pRes.data?.data?.photos || []);
        setMatches(mRes.data?.matches || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return; }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!matchId) { setError('Please select a match'); return; }
    if (!file)    { setError('Please choose a photo'); return; }
    setUploading(true);
    setError('');
    try {
      const { data: up } = await uploadPhoto(file);
      await addMatchPhoto(matchId, { photo_url: up.url, caption: caption.trim() || undefined });
      setShowAdd(false);
      setFile(null); setPreview(null); setMatchId(''); setCaption('');
      loadPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed — is the server running?');
    } finally { setUploading(false); }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await deletePhoto(photo.match_id, photo.id);
      setSelected(null);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch { setError('Failed to delete photo'); }
  };

  const openAdd = () => { setError(''); setFile(null); setPreview(null); setMatchId(''); setCaption(''); setShowAdd(true); };

  return (
    <div style={S.page}>
      <TopBar title="MATCH GALLERY" />

      <div style={S.wrap}>
        <div style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.heroOverlay} />
          <p style={S.tag}>MEMORIES</p>
          <h1 style={S.heroTitle}>MATCH GALLERY</h1>
          <p style={S.heroSub}>{loading ? '...' : `${photos.length} photo${photos.length !== 1 ? 's' : ''} from your matches`}</p>
        </div>

        <div style={S.body}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button style={S.addBtn} onClick={openAdd}>+ ADD PHOTO</button>
          </div>

          {loading ? (
            <div style={S.loadWrap}><div style={S.dot} /></div>
          ) : photos.length === 0 ? (
            <div style={S.empty}>
              <span className="material-symbols-outlined" style={{ fontSize: 52, color: '#BFFF00' }}>photo_library</span>
              <p style={S.emptyTitle}>No photos yet</p>
              <p style={S.emptySub}>Tap "+ ADD PHOTO" to upload your first match memory</p>
              <button style={S.addBtn} onClick={openAdd}>+ ADD PHOTO</button>
            </div>
          ) : (
            <div style={S.grid}>
              {photos.map(p => (
                <div key={p.id} style={S.tile} onClick={() => setSelected(p)}>
                  <img src={p.photo_url} alt={p.caption || 'match photo'} style={S.img}
                    onError={e => { e.target.src = ''; e.target.style.background = '#1a1a1a'; }} />
                  <div style={S.tileFoot}>
                    <div style={S.tileMatch}>{p.team_a_name} vs {p.team_b_name}</div>
                    {p.caption && <div style={S.tileCaption}>{p.caption}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Photo Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={() => setShowAdd(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>ADD PHOTO</div>
            {matches.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7 }}>
                Schedule a match first before adding photos.{' '}
                <a href="/matches" style={{ color: '#BFFF00' }}>Go to Matches →</a>
              </div>
            ) : (
              <form onSubmit={handleAdd}>
                <label style={S.label}>SELECT MATCH *</label>
                <select style={S.input} value={matchId} onChange={e => setMatchId(e.target.value)} required>
                  <option value="">Choose a match...</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.team_a_name} vs {m.team_b_name || m.opponent_name} — {new Date(m.match_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </option>
                  ))}
                </select>

                <label style={S.label}>PHOTO *</label>
                {/* label wraps the input — tap anywhere triggers native picker (camera + gallery on mobile) */}
                <label style={{ display: 'block', marginBottom: 12, cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                      <span style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                        ✕ Change
                      </span>
                    </div>
                  ) : (
                    <div style={S.uploadBox}>
                      <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#BFFF00' }}>add_photo_alternate</span>
                      <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Tap to take a photo or choose from gallery</p>
                      <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>JPG · PNG · WEBP · max 5 MB</p>
                    </div>
                  )}
                </label>

                <label style={S.label}>CAPTION <span style={{ color: '#444', fontWeight: 400 }}>(optional)</span></label>
                <input style={S.input} placeholder="e.g. Match winning shot!" value={caption} onChange={e => setCaption(e.target.value)} />

                {error && <div style={{ color: '#FF4444', fontSize: 12, marginTop: 8 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="button" style={{ ...S.btn('#222', '#aaa'), flex: 1 }} onClick={() => setShowAdd(false)}>CANCEL</button>
                  <button type="submit" style={{ ...S.btn('#BFFF00', '#000'), flex: 1 }} disabled={uploading}>
                    {uploading ? 'UPLOADING...' : 'UPLOAD'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div style={S.lightbox} onClick={() => setSelected(null)}>
          <div style={S.lightboxInner} onClick={e => e.stopPropagation()}>
            <img src={selected.photo_url} alt={selected.caption || 'photo'} style={S.lightboxImg} />
            <div style={S.lightboxMeta}>
              <div style={S.lightboxMatch}>{selected.team_a_name} vs {selected.team_b_name}</div>
              {selected.caption && <div style={S.lightboxCaption}>{selected.caption}</div>}
              <div style={S.lightboxDate}>
                {new Date(selected.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                {selected.uploader_name ? ` · Added by ${selected.uploader_name}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...S.btn('#FF444422', '#FF4444'), flex: 1 }} onClick={() => handleDelete(selected)}>DELETE</button>
              <button style={{ ...S.btn('#222', '#aaa'), flex: 1 }} onClick={() => setSelected(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}

const S = {
  page:    { minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  wrap:    { maxWidth: 600, margin: '0 auto' },
  hero:    { position: 'relative', padding: '32px 16px 28px', overflow: 'hidden', minHeight: 130 },
  heroBg:  { position: 'absolute', inset: 0, backgroundImage: "url('/bg-5-apex-arena.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(13,13,13,0.6) 0%,rgba(13,13,13,0.95) 100%)', zIndex: 1 },
  tag:     { position: 'relative', zIndex: 2, fontSize: 10, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 4 },
  heroTitle: { position: 'relative', zIndex: 2, fontSize: 28, fontWeight: 800, lineHeight: 1 },
  heroSub: { position: 'relative', zIndex: 2, fontSize: 12, color: '#aaa', marginTop: 4 },
  body:    { padding: 16 },
  addBtn:  { background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 },
  tile:    { background: '#161616', border: '1px solid #222', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' },
  img:     { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', background: '#111' },
  tileFoot: { padding: '8px 10px' },
  tileMatch: { fontSize: 10, fontWeight: 700, color: '#BFFF00', letterSpacing: '0.04em', marginBottom: 2 },
  tileCaption: { fontSize: 10, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  uploadBox: { border: '2px dashed #333', borderRadius: 10, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: '#111' },
  loadWrap: { display: 'flex', justifyContent: 'center', padding: 60 },
  dot:     { width: 8, height: 8, borderRadius: '50%', background: '#BFFF00' },
  empty:   { textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#fff' },
  emptySub:   { fontSize: 12, color: '#555', maxWidth: 240, lineHeight: 1.7 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:   { background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440, border: '1px solid #2a2a2a', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  label:   { color: '#aaa', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, marginTop: 14 },
  input:   { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 0, appearance: 'none' },
  btn:     (bg, col) => ({ background: bg, color: col, border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit' }),
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  lightboxInner: { width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 12 },
  lightboxImg: { width: '100%', borderRadius: 12, maxHeight: '55vh', objectFit: 'contain', background: '#111' },
  lightboxMeta: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 14px' },
  lightboxMatch: { fontSize: 13, fontWeight: 700, color: '#BFFF00', marginBottom: 4 },
  lightboxCaption: { fontSize: 13, color: '#ccc', marginBottom: 4 },
  lightboxDate: { fontSize: 11, color: '#555' },
};
