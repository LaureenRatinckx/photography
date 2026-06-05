import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, Album } from '../lib/firebase';
import { format } from 'date-fns';

const testimonials = [
  {
    name: "Noémie",
    text: "Oh echt bedankt voor de mooie foto's! Ik ga er nog steeds terug naar piepeloeren",
    category: "Baby"
  },
  {
    name: "Gilles",
    text: "Waaaauw hoe tof is da!",
    category: "Couple"
  },
  {
    name: "Amélie & Martin",
    text: "Oh merci Laureen!! We hebben er net samen naar gekeken, ze zijn SUPER! Het gaat zeer moeilijk zijn om een selectie te maken voor instagram. Echt top!",
    category: "Wedding"
  }
];

export default function Home() {
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'albums'), orderBy('date', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      setFeaturedAlbums(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Background Image */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-brand-ink">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dkp4ebm8s/image/upload/v1780666650/photography/7WNqVpoLHjdYkT27trsu/r15bn8vefdtuvkvsdpe9.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover grayscale brightness-50 opacity-70"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Slogan and Button on top of Image */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-brand-offwhite/60 mb-8 block">
              Laureen Ratinckx Photography
            </span>
            <h1 className="text-5xl md:text-8xl serif text-brand-offwhite leading-tight mb-12 italic">
              Het vastleggen van de <br />eerlijke schoonheid in elk moment.
            </h1>
            <Link 
              to="/portfolio" 
              className="inline-flex items-center space-x-4 px-8 py-4 border border-brand-accent/50 text-brand-offwhite hover:bg-brand-accent hover:text-brand-ink transition-all duration-500 serif text-lg italic rounded-sm"
            >
              <span>Bekijk Portfolio</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Work / Portfolio Preview Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-ink/40 mb-4 block">Portfolio Preview</span>
          <h2 className="serif text-4xl italic">Recent werk</h2>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center italic text-brand-ink/20">Albums laden...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {featuredAlbums.length > 0 ? (
              featuredAlbums.map((album, i) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link to={`/album/${album.id}`}>
                    <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-8 relative">
                      <img 
                        src={album.coverImage} 
                        alt={album.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/10 transition-colors" />
                      <div className="absolute bottom-6 left-6 text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                        <span className="text-[10px] uppercase tracking-widest flex items-center">
                          Bekijk Album <Plus size={12} className="ml-2" />
                        </span>
                      </div>
                    </div>
                    <h3 className="serif text-2xl mb-1">{album.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-brand-ink/40">{album.category}</span>
                      <span className="text-[10px] text-brand-ink/30 italic">
                        {album.date?.toDate ? format(album.date.toDate(), 'yyyy') : ''}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-brand-ink/10 text-brand-ink/30 italic">
                Nog geen albums aangemaakt. Ga naar de admin pagina om je werk toe te voegen.
              </div>
            )}
          </div>
        )}
        
        <div className="mt-20 flex justify-center">
          <Link to="/portfolio" className="text-xs uppercase tracking-[0.3em] font-medium border-b-2 border-brand-accent hover:border-brand-ink pb-2 transition-all">
            Bekijk alle reportages
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-brand-ink text-brand-offwhite px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 block">Getuigenissen</span>
          <h2 className="serif text-4xl italic">Wat anderen zeggen</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center px-4"
            >
              <Star className="text-white/20 mb-6" size={24} />
              <p className="serif text-xl mb-6 italic leading-relaxed">"{t.text}"</p>
              <h4 className="text-sm font-medium">{t.name}</h4>
              <span className="text-[10px] uppercase tracking-widest opacity-40 mt-1">{t.category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 flex flex-col items-center justify-center text-center">
        <h2 className="serif text-4xl md:text-5xl mb-10">Klaar om jouw verhaal <br /> te vertellen?</h2>
        <Link to="/contact" className="px-10 py-4 border-2 border-brand-accent hover:bg-brand-accent hover:text-brand-ink transition-all serif text-lg italic rounded-sm">
          Neem contact op
        </Link>
      </section>
    </div>
  );
}
