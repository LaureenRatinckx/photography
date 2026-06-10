import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider, githubProvider, db, Album } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, Timestamp, query, where, orderBy, updateDoc, onSnapshot } from 'firebase/firestore';
import { LogIn, LogOut, Plus, Trash2, Camera, FolderPlus, Grid, Image as ImageIcon, Check, Github, Upload, X, Star } from 'lucide-react';
import { format } from 'date-fns';

const ADMIN_EMAIL = 'laureen.ratinckx@hotmail.com';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = 'photography_unsigned'; // zie stap hieronder

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'albums' | 'messages'>('albums');
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // New Album Form
  const [newAlbum, setNewAlbum] = useState({ title: '', date: '', category: 'wedding', coverImage: '', description: '' });
  
  // Photo Upload State
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  // Cloudinary Upload State
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photos per album (for cover selection)
  const [albumPhotos, setAlbumPhotos] = useState<{[albumId: string]: any[]}>({});

  const loadAlbumPhotos = (albumId: string) => {
    const q = query(collection(db, 'photos'), where('albumId', '==', albumId));
    onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAlbumPhotos(prev => ({ ...prev, [albumId]: photos }));
    });
  };

  const handleSetCover = async (albumId: string, photoUrl: string) => {
    await updateDoc(doc(db, 'albums', albumId), { coverImage: photoUrl });
    fetchData();
    alert('Coverfoto bijgewerkt!');
  };

  // Edit description state
  const [editDescriptions, setEditDescriptions] = useState<{[albumId: string]: string}>({});

  const handleUpdateDescription = async (albumId: string) => {
    await updateDoc(doc(db, 'albums', albumId), { description: editDescriptions[albumId] });
    fetchData();
    alert('Beschrijving opgeslagen!');
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Foto verwijderen uit dit album?')) {
      await deleteDoc(doc(db, 'photos', photoId));
    }
  };

  const handleCloudinaryUpload = async () => {
    if (!selectedAlbumId || uploadFiles.length === 0) {
      alert('Selecteer een album en kies minstens één foto.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let count = 0;
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `photography/${selectedAlbumId}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) throw new Error('Upload mislukt voor ' + file.name);

        const data = await response.json();

        await addDoc(collection(db, 'photos'), {
          url: data.secure_url,
          albumId: selectedAlbumId,
          createdAt: serverTimestamp(),
        });

        count++;
        setUploadProgress(Math.round((count / uploadFiles.length) * 100));
      }

      alert(`${count} foto's succesvol geüpload!`);
      setUploadFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert('Fout bij uploaden: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
      if (u && (u.email === ADMIN_EMAIL || u.providerData.some(p => p.email === ADMIN_EMAIL))) {
        fetchData();
      }
    });
    return unsub;
  }, []);

  const fetchData = async () => {
    const albumSnap = await getDocs(query(collection(db, 'albums'), orderBy('date', 'desc')));
    setAlbums(albumSnap.docs.map(d => ({ id: d.id, ...d.data() } as Album)));
    
    const messageSnap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
    setMessages(messageSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    try {
      const p = provider === 'google' ? googleProvider : githubProvider;
      await signInWithPopup(auth, p);
    } catch (e: any) {
      console.error(e);
      alert('Login mislukt. Controleer of GitHub login is ingeschakeld in je Firebase Console. ' + e.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.title || !newAlbum.date) return;
    
    await addDoc(collection(db, 'albums'), {
      ...newAlbum,
      date: Timestamp.fromDate(new Date(newAlbum.date)),
    });
    setNewAlbum({ title: '', date: '', category: 'wedding', coverImage: '', description: '' });
    fetchData();
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbumId || !photoUrl) return;
    
    await addDoc(collection(db, 'photos'), {
      url: photoUrl,
      albumId: selectedAlbumId,
      createdAt: serverTimestamp(),
    });
    setPhotoUrl('');
    alert('Foto toegevoegd!');
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('Zeker weten? Alle foto\'s in dit album blijven wel in de database staan (worden niet automatisch verwijderd).')) {
      await deleteDoc(doc(db, 'albums', id));
      fetchData();
    }
  };

  const handleCreateDemo = async () => {
    const demoAlbum = {
      title: "Demo Trouwreportage",
      date: Timestamp.fromDate(new Date()),
      category: 'wedding' as any,
      coverImage: "https://picsum.photos/seed/demo-cover/800/1000",
      description: "Een prachtige dag vol emotie en licht."
    };
    const docRef = await addDoc(collection(db, 'albums'), demoAlbum);
    
    for(let i=0; i<6; i++) {
        await addDoc(collection(db, 'photos'), {
            url: `https://picsum.photos/seed/demo-${i}/1200/800`,
            albumId: docRef.id,
            createdAt: serverTimestamp()
        });
    }
    fetchData();
    alert('Demo album met 6 foto\'s gemaakt!');
  };

  if (!authChecked) return null;

  if (!user || (user.email !== ADMIN_EMAIL && !user.providerData.some(p => p.email === ADMIN_EMAIL))) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl serif mb-8">Admin Access</h1>
        <p className="text-brand-ink/60 mb-10 max-w-sm">Toegang is beperkt tot Laureen Ratinckx.</p>
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <button 
            onClick={() => handleLogin('google')}
            className="w-full px-10 py-4 border border-brand-ink/10 hover:bg-brand-ink hover:text-brand-offwhite text-sm uppercase tracking-widest flex items-center justify-center transition-all rounded-sm"
          >
            <LogIn className="mr-3" size={18} /> Inloggen met Google
          </button>
          <button 
            onClick={() => handleLogin('github')}
            className="w-full px-10 py-4 bg-brand-ink text-brand-offwhite text-sm uppercase tracking-widest flex items-center justify-center transition-all rounded-sm"
          >
            <Github className="mr-3" size={18} /> Inloggen met GitHub
          </button>
        </div>
        {user && (
          <p className="mt-6 text-red-500 text-xs uppercase tracking-widest">
            Ingelogd als {user.email || 'GitHub account'}, maar dit account heeft geen toegang.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="flex justify-between items-center mb-20">
        <div>
          <h1 className="text-4xl serif mb-2">Welkom, Laureen</h1>
          <p className="text-xs uppercase tracking-widest text-brand-ink/40">Beheer je portfolio en berichten</p>
        </div>
        <button onClick={handleLogout} className="p-3 text-brand-ink/40 hover:text-brand-ink transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex space-x-12 mb-16 border-b border-brand-ink/5 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('albums')}
          className={`pb-4 text-xs uppercase tracking-[0.2em] transition-all relative ${activeTab === 'albums' ? 'text-brand-ink' : 'text-brand-ink/40'}`}
        >
          Albums & Foto's
          {activeTab === 'albums' && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-ink" />}
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-4 text-xs uppercase tracking-[0.2em] transition-all relative ${activeTab === 'messages' ? 'text-brand-ink' : 'text-brand-ink/40'}`}
        >
          Berichten ({messages.length})
          {activeTab === 'messages' && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-ink" />}
        </button>
      </div>

      {activeTab === 'albums' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Left: Add Album Form */}
          <div className="lg:col-span-1 border-r border-brand-ink/5 pr-20">
            <h2 className="serif text-2xl mb-10 flex items-center"><FolderPlus className="mr-3" size={24} /> Nieuw Album</h2>
            <form onSubmit={handleAddAlbum} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Titel</label>
                <input 
                  required
                  value={newAlbum.title}
                  onChange={e => setNewAlbum({...newAlbum, title: e.target.value})}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-2 focus:border-brand-ink outline-none px-0"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Datum</label>
                <input 
                  required
                  type="date"
                  value={newAlbum.date}
                  onChange={e => setNewAlbum({...newAlbum, date: e.target.value})}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-2 focus:border-brand-ink outline-none px-0"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Categorie</label>
                <select 
                  value={newAlbum.category}
                  onChange={e => setNewAlbum({...newAlbum, category: e.target.value as any})}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-2 outline-none px-0"
                >
                  <option value="wedding">Wedding</option>
                  <option value="baby">Baby</option>
                  <option value="couple">Couple</option>
                  <option value="travel">Travel</option>
                  <option value="reportage">Reportage</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Cover Image URL <span className="opacity-50">(optioneel — of kies na uploaden)</span></label>
                <input 
                  placeholder="https://... (optioneel)"
                  value={newAlbum.coverImage}
                  onChange={e => setNewAlbum({...newAlbum, coverImage: e.target.value})}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-2 focus:border-brand-ink outline-none px-0 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Beschrijving</label>
                <textarea 
                  rows={3}
                  value={newAlbum.description}
                  onChange={e => setNewAlbum({...newAlbum, description: e.target.value})}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-2 focus:border-brand-ink outline-none px-0 text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-brand-accent text-brand-ink text-xs uppercase tracking-widest font-bold rounded-sm"
              >
                Album Aanmaken
              </button>
              
              <div className="pt-10">
                <button 
                  type="button"
                  onClick={handleCreateDemo}
                  className="w-full py-4 border border-brand-ink/10 text-brand-ink/40 text-[10px] uppercase tracking-widest hover:bg-brand-ink hover:text-brand-offwhite transition-all"
                >
                  Genereer Demo Data
                </button>
              </div>
            </form>
          </div>

          {/* Right: Album List & Photo Adder */}
          <div className="lg:col-span-2">
            <h2 className="serif text-2xl mb-10 flex items-center"><Grid className="mr-3" size={24} /> Bestaande Albums</h2>
            <div className="space-y-12">
              {albums.map(album => (
                <div key={album.id} className={`p-8 border ${selectedAlbumId === album.id ? 'border-brand-ink bg-brand-ink/5' : 'border-brand-ink/5'} transition-colors`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="serif text-xl mb-1">{album.title}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">
                        {album.category} • {album.date?.toDate ? format(album.date.toDate(), 'MMMM yyyy') : ''}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => {
                          const newId = selectedAlbumId === album.id ? null : album.id!;
                          setSelectedAlbumId(newId);
                          if (newId) loadAlbumPhotos(newId);
                        }}
                        className={`p-2 rounded-full ${selectedAlbumId === album.id ? 'bg-brand-ink text-white' : 'hover:bg-brand-ink/5'}`}
                        title="Voeg foto's toe"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button onClick={() => handleDeleteAlbum(album.id!)} className="p-2 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {selectedAlbumId === album.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-6 border-t border-brand-ink/10 space-y-8"
                    >
                      {/* Edit Description */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 opacity-40">Beschrijving Bewerken</h4>
                        <textarea
                          rows={3}
                          value={editDescriptions[album.id!] ?? album.description ?? ''}
                          onChange={e => setEditDescriptions(prev => ({ ...prev, [album.id!]: e.target.value }))}
                          className="w-full bg-white/50 border border-brand-ink/10 px-4 py-2 text-sm outline-none focus:border-brand-ink rounded-sm"
                          placeholder="Beschrijving van dit album..."
                        />
                        <button
                          onClick={() => handleUpdateDescription(album.id!)}
                          className="mt-2 px-4 py-2 bg-brand-accent text-brand-ink text-[10px] uppercase tracking-widest font-bold rounded-sm"
                        >
                          Opslaan
                        </button>
                      </div>

                      {/* Manual Add via URL */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 opacity-40">Handmatig URL Toevoegen</h4>
                        <form onSubmit={handleAddPhoto} className="flex gap-4">
                          <input 
                            required
                            placeholder="Public URL"
                            value={photoUrl}
                            onChange={e => setPhotoUrl(e.target.value)}
                            className="flex-grow bg-white/50 border border-brand-ink/10 px-4 py-2 text-sm outline-none focus:border-brand-ink"
                          />
                          <button type="submit" className="bg-brand-accent text-brand-ink px-4 py-2 rounded flex items-center font-bold">
                            <Check size={16} />
                          </button>
                        </form>
                      </div>

                      {/* Cloudinary Upload */}
                      <div className="bg-brand-ink/5 p-6 rounded-sm border border-brand-ink/5">
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 flex items-center">
                          <Upload className="mr-2" size={14} /> Foto's Uploaden via Cloudinary
                        </h4>

                        {/* Dropzone */}
                        <div
                          className="border-2 border-dashed border-brand-ink/20 rounded-sm p-8 text-center cursor-pointer hover:border-brand-ink/50 transition-colors mb-4"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault();
                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                            setUploadFiles(prev => [...prev, ...files]);
                          }}
                        >
                          <Camera className="mx-auto mb-3 text-brand-ink/30" size={28} />
                          <p className="text-xs text-brand-ink/40 uppercase tracking-widest">Klik of sleep foto's hierheen</p>
                          <p className="text-[10px] text-brand-ink/20 mt-1">JPG, PNG, WEBP</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              setUploadFiles(prev => [...prev, ...files]);
                            }}
                          />
                        </div>

                        {/* Selected files preview */}
                        {uploadFiles.length > 0 && (
                          <div className="mb-4 space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">{uploadFiles.length} foto('s) geselecteerd</p>
                            <div className="flex flex-wrap gap-2">
                              {uploadFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-[10px]">
                                  <span className="truncate max-w-[120px]">{file.name}</span>
                                  <button
                                    onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-brand-ink/30 hover:text-red-500"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress bar */}
                        {isUploading && (
                          <div className="mb-4">
                            <div className="w-full bg-brand-ink/10 rounded-full h-1">
                              <div
                                className="bg-brand-ink h-1 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-brand-ink/40 mt-1 text-center">{uploadProgress}%</p>
                          </div>
                        )}

                        <button 
                          onClick={handleCloudinaryUpload}
                          disabled={isUploading || uploadFiles.length === 0}
                          className="w-full py-3 bg-brand-ink text-brand-offwhite text-[10px] uppercase tracking-widest hover:bg-brand-accent hover:text-brand-ink transition-all disabled:opacity-50"
                        >
                          {isUploading ? `Uploaden... ${uploadProgress}%` : `Upload ${uploadFiles.length > 0 ? uploadFiles.length + ' foto\'s' : 'Foto\'s'}`}
                        </button>
                      </div>

                      <p className="mt-4 text-[9px] text-brand-ink/40 tracking-widest italic uppercase">
                        De foto's in het album worden voor de bezoeker automatisch door elkaar gehusseld.
                      </p>

                      {/* Cover Photo Selector & Photo Management */}
                      {albumPhotos[album.id!]?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest mb-4 opacity-40 flex items-center">
                            <Star className="mr-2" size={12} /> Foto's Beheren — Kies Cover of Verwijder
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {albumPhotos[album.id!].map((photo: any) => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url}
                                  alt="foto"
                                  className="w-full h-24 object-cover rounded-sm"
                                />
                                {/* Cover overlay */}
                                {album.coverImage === photo.url ? (
                                  <div className="absolute inset-0 bg-brand-ink/40 rounded-sm flex items-center justify-center pointer-events-none">
                                    <Star size={20} className="text-white fill-white" />
                                  </div>
                                ) : (
                                  <div
                                    className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/20 rounded-sm transition-all flex items-center justify-center cursor-pointer"
                                    onClick={() => handleSetCover(album.id!, photo.url)}
                                  >
                                    <Star size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                )}
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-[9px] text-brand-ink/30 mt-2 italic">⭐ Klik op foto voor cover &nbsp;|&nbsp; ✕ Klik rechtsboven om te verwijderen.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
              {albums.length === 0 && <p className="italic text-brand-ink/30">Nog geen albums aangemaakt.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-8">
           {messages.map(msg => (
             <div key={msg.id} className="p-8 border border-brand-ink/5 bg-white space-y-4">
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-brand-ink/40">
                 <span>{msg.name} ({msg.email})</span>
                 <span>{msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'v MMM yyyy HH:mm') : ''}</span>
               </div>
               <p className="serif text-xl italic">"{msg.message}"</p>
             </div>
           ))}
           {messages.length === 0 && <p className="italic text-brand-ink/30">Geen berichten ontvangen.</p>}
        </div>
      )}
    </div>
  );
}
