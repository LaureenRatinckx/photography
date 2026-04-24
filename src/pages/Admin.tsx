import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider, githubProvider, db, Album } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, Timestamp, query, where, orderBy } from 'firebase/firestore';
import { LogIn, LogOut, Plus, Trash2, Camera, FolderPlus, Grid, Image as ImageIcon, Check, Github } from 'lucide-react';
import { format } from 'date-fns';

const ADMIN_EMAIL = 'laureen.ratinckx@gmail.com';

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

  // GitHub Import State
  const [ghUser, setGhUser] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghPath, setGhPath] = useState('');
  const [ghToken, setGhToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleGithubImport = async () => {
    if (!selectedAlbumId || !ghUser || !ghRepo || !ghToken) {
        alert('Vul alle GitHub velden in.');
        return;
    }
    
    setIsScanning(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/${ghPath}`, {
        headers: {
          'Authorization': `token ${ghToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('GitHub folder niet gevonden of token ongeldig.');

      const files = await response.json();
      if (!Array.isArray(files)) throw new Error('Het opgegeven pad is geen folder.');
      
      const imageFiles = files.filter((f: any) => 
        f.type === 'file' && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
      );

      if (imageFiles.length === 0) {
        alert('Geen afbeeldingen gevonden in deze folder.');
        return;
      }

      let count = 0;
      for (const file of imageFiles) {
        await addDoc(collection(db, 'photos'), {
          url: file.download_url,
          albumId: selectedAlbumId,
          createdAt: serverTimestamp(),
        });
        count++;
      }
      
      alert(`${count} foto's succesvol geïmporteerd van GitHub!`);
      setGhPath('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsScanning(false);
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
    // Helper to seed some data
    const demoAlbum = {
      title: "Demo Trouwreportage",
      date: Timestamp.fromDate(new Date()),
      category: 'wedding' as any,
      coverImage: "https://picsum.photos/seed/demo-cover/800/1000",
      description: "Een prachtige dag vol emotie en licht."
    };
    const docRef = await addDoc(collection(db, 'albums'), demoAlbum);
    
    // Add some photos
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
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block">Cover Image URL</label>
                <input 
                  required
                  placeholder="https://..."
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
                        onClick={() => setSelectedAlbumId(selectedAlbumId === album.id ? null : album.id!)}
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
                      {/* Manual Add */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 opacity-40">Handmatig Foto Toevoegen</h4>
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

                      {/* GitHub Import */}
                      <div className="bg-brand-ink/5 p-6 rounded-sm border border-brand-ink/5">
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 flex items-center">
                          <Camera className="mr-2" size={14} /> Importeer van GitHub (Private Repo)
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <input 
                            placeholder="GitHub User (bv. lratinckx)"
                            value={ghUser}
                            onChange={e => setGhUser(e.target.value)}
                            className="bg-white border border-brand-ink/5 px-3 py-2 text-xs outline-none"
                          />
                          <input 
                            placeholder="Repo Name (bv. portfolio-fotos)"
                            value={ghRepo}
                            onChange={e => setGhRepo(e.target.value)}
                            className="bg-white border border-brand-ink/5 px-3 py-2 text-xs outline-none"
                          />
                          <input 
                            placeholder="Path in repo (bv. weddings/jan)"
                            value={ghPath}
                            onChange={e => setGhPath(e.target.value)}
                            className="bg-white border border-brand-ink/5 px-3 py-2 text-xs outline-none"
                          />
                          <input 
                            type="password"
                            placeholder="GitHub Access Token"
                            value={ghToken}
                            onChange={e => setGhToken(e.target.value)}
                            className="bg-white border border-brand-ink/5 px-3 py-2 text-xs outline-none"
                          />
                        </div>
                        <button 
                          onClick={handleGithubImport}
                          disabled={isScanning}
                          className="w-full py-3 bg-brand-ink text-brand-offwhite text-[10px] uppercase tracking-widest hover:bg-brand-accent hover:text-brand-ink transition-all disabled:opacity-50"
                        >
                          {isScanning ? 'Scannen...' : 'Scan Folder & Importeer Foto\'s'}
                        </button>
                        <p className="mt-2 text-[9px] text-brand-ink/40 leading-relaxed italic">
                          Tip: Maak een "Personal Access Token" aan op GitHub om toegang te krijgen tot je private repo. De foto's worden direct aan dit album toegevoegd.
                        </p>
                      </div>

                      <p className="mt-4 text-[9px] text-brand-ink/40 tracking-widest italic uppercase">
                        De foto's in het album worden voor de bezoeker automatisch door elkaar gehusseld.
                      </p>
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
