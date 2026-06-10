import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, Album } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Portfolio() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'albums'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      setAlbums(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAlbums = filter === 'all' 
    ? albums 
    : albums.filter(a => a.category === filter);

  const categories = [
    { id: 'all', name: 'Alles' },
    { id: 'wedding', name: 'Weddings' },
    { id: 'baby', name: 'Baby' },
    { id: 'couple', name: 'Couple' },
    { id: 'travel', name: 'Travel' },
    { id: 'reportage', name: 'Reportage' },
    { id: 'events', name: 'Events' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl serif mb-10">Portfolio</h1>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-brand-ink/5 pb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`text-[10px] uppercase tracking-[0.2em] transition-all relative py-2 ${
                filter === cat.id ? 'text-brand-ink' : 'text-brand-ink/40'
              }`}
            >
              {cat.name}
              {filter === cat.id && (
                <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent" />
              )}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="h-96 flex items-center justify-center italic text-brand-ink/40">Loading portfolio...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredAlbums.map((album) => (
            <motion.div
              layout
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Link to={`/album/${album.id}`}>
                <div className="aspect-[4/5] bg-zinc-100 overflow-hidden mb-6 relative">
                  <img
                    src={album.coverImage || `https://picsum.photos/seed/${album.id}/800/1000`}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/10 transition-colors" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="serif text-2xl mb-1">{album.title}</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-ink/40">{album.category}</span>
                  </div>
                  <span className="text-[10px] text-brand-ink/40 mt-1">
                    {album.date?.toDate ? format(album.date.toDate(), 'MMMM yyyy') : 'No Date'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
