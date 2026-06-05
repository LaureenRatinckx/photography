import { motion } from 'motion/react';
import { Mail, Instagram } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
        {/* Left column: Images / Visuals */}
        <div className="lg:col-span-5 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/5] bg-zinc-100 overflow-hidden"
          >
            <img 
              src="https://picsum.photos/seed/laureen/800/1000" 
              alt="Laureen Ratinckx" 
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-brand-ink/40 space-y-4">
            <p>Antwerp, Belgium</p>
            <p>Available worldwide</p>
          </div>
        </div>

        {/* Right column: Text content */}
        <div className="lg:col-span-7 lg:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl serif mb-12">Laureen Ratinckx</h1>
            
            <div className="space-y-8 text-lg leading-relaxed text-brand-ink/80 font-light max-w-xl">
              <p>
                Ik ben een fotografe gespecialiseerd in lifestyle—van bruiloften en baby's tot koppels—met een diepe passie voor reizen en reportagefotografie.
              </p>
              <p>
                Mijn stijl is minimalistisch en eerlijk. Ik zoek niet naar de perfecte pose, maar naar de momenten ertussenin. De momenten die echt zijn, die ademen en die een verhaal vertellen dat over tien jaar nog steeds hetzelfde gevoel oproept.
              </p>
              <p className="italic serif text-2xl text-brand-ink">
                "Ik geloof dat de mooiste verhalen vaak verborgen zitten in de eenvoud."
              </p>
              <p>
                Of het nu gaat om een intieme trouwdag in de Ardennen of een reportage van een verre reis, mijn doel is altijd hetzelfde: beelden maken die de essentie van het moment vastleggen zonder afleiding.
              </p>
            </div>

            <div className="mt-16 pt-16 border-t border-brand-ink/5 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-ink/40 mb-4">Focus</h4>
                <ul className="text-sm space-y-2">
                  <li>Weddings</li>
                  <li>Travel</li>
                  <li>Reportage</li>
                  <li>Events</li>
                  <li>Baby & Family</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-ink/40 mb-4">Contact</h4>
                <div className="flex space-x-6 text-brand-ink/60">
                  <a href="mailto:laureen.ratinkcx@hotmail.com" className="hover:text-brand-ink transition-colors"><Mail size={20}/></a>
                  <a href="https://www.instagram.com/laureen.photography/" target="_blank" rel="noreferrer" className="hover:text-brand-ink transition-colors"><Instagram size={20}/></a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
