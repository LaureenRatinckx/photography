import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, Album, Photo } from '../lib/firebase';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAlbum = async () => {
      const docRef = doc(db, 'albums', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAlbum({ id: docSnap.id, ...docSnap.data() } as Album);
      }
    };

    const q = query(collection(db, 'photos'), where('albumId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      // Randomize the photos as requested
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPhotos(shuffled);
      setLoading(false);
    });

    fetchAlbum();
    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center italic text-brand-ink/40">Loading gallery...</div>;
  if (!album) return <div className="h-screen flex items-center justify-center italic text-brand-ink/40 text-center">Album niet gevonden.<br/><Link to="/portfolio" className="underline mt-4 block">Terug naar portfolio</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <Link to="/portfolio" className="inline-flex items-center text-[10px] uppercase tracking-widest text-brand-ink/40 hover:text-brand-ink transition-colors mb-20 group">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Terug naar Portfolio
      </Link>

      <header className="mb-32 text-center max-w-2xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.4em] text-brand-ink/40 block mb-6">{album.category}</span>
        <h1 className="text-5xl md:text-7xl serif mb-6">{album.title}</h1>
        <div className="text-sm italic text-brand-ink/60 mb-8">
          {album.date?.toDate ? format(album.date.toDate(), 'd MMMM yyyy') : ''}
        </div>
        {album.description && (
          <p className="text-brand-ink/60 leading-relaxed font-light">
            {album.description}
          </p>
        )}
      </header>

      {/* Masonry or Grid for Photos */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id || index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 3) * 0.1 }}
            className="relative group break-inside-avoid"
          >
            <img
              src={photo.url}
              alt={`${album.title} gallery`}
              className="w-full h-auto cursor-crosshair transition-all duration-500 hover:brightness-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-ink opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-20 text-brand-ink/20 italic">
          Nog geen foto's toegevoegd aan dit album.
        </div>
      )}
    </div>
  );
}
