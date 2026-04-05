"use client";

import { motion, useMotionValue } from "framer-motion";
import { Star, Sparkles, MoveRight, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const testimonials = [
  {
    content: "COMSOC transformed how we manage our 500+ member engineering society. The execution is flawless and the interface is incredibly intuitive.",
    name: "Arham Khan",
    role: "President, IEEE CUI Lahore",
    avatar: "AK",
    rating: 5,
    color: "from-orange-500 to-orange-600",
    className: "lg:col-span-3 lg:row-span-2",
    icon: Zap
  },
  {
    content: "The elite standard for campus communities. Discovering my tribe at COMSATS took seconds, not semesters. Truly a masterpiece.",
    name: "Zainab Fatima",
    role: "Secretary, Creative Arts Society",
    avatar: "ZF",
    rating: 5,
    color: "from-stone-800 to-stone-900",
    className: "lg:col-span-3",
    icon: Sparkles
  },
  {
    content: "Stunning interface and institutional-grade management. Our secret weapon for society growth.",
    name: "Hamza Sheikh",
    role: "Lead, GDSC COMSATS",
    avatar: "HS",
    rating: 5,
    color: "from-orange-600 to-red-600",
    className: "lg:col-span-2",
  },
  {
    content: "Managing finances was a nightmare before COMSOC. Now, everything is automated and transparent.",
    name: "Ayesha Malik",
    role: "Director, CUI Sports",
    avatar: "AM",
    rating: 5,
    color: "from-stone-700 to-stone-800",
    className: "lg:col-span-2",
  },
  {
    content: "The most advanced platform for student engagement in Pakistan. Period.",
    name: "Bilal Farooq",
    role: "Executive, ACM Chapter",
    avatar: "BF",
    rating: 5,
    color: "from-orange-400 to-orange-600",
    className: "lg:col-span-2 lg:row-span-2 flex-center",
  },
  {
    content: "A game-changer for society communication and member retention.",
    name: "Maham Malik",
    role: "Admin, Literary Society",
    avatar: "MM",
    rating: 5,
    color: "from-stone-600 to-stone-700",
    className: "lg:col-span-4",
  }
];

function SpotlightCard({ testimonial, mouseX, mouseY }: { testimonial: typeof testimonials[0], mouseX: import("framer-motion").MotionValue<number>, mouseY: import("framer-motion").MotionValue<number> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localMouseX, setLocalMouseX] = useState(0);
  const [localMouseY, setLocalMouseY] = useState(0);

  useEffect(() => {
    const updateLocalMouse = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = mouseX.get() - rect.left;
      const y = mouseY.get() - rect.top;
      setLocalMouseX(x);
      setLocalMouseY(y);
    };

    const unsubscribeX = mouseX.on("change", updateLocalMouse);
    const unsubscribeY = mouseY.on("change", updateLocalMouse);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden bg-[rgba(255,247,237,0.6)] backdrop-blur-3xl border border-orange-100/50 rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(251,146,60,0.1)] group ${testimonial.className}`}
    >
      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${localMouseX}px ${localMouseY}px, rgba(249, 115, 22, 0.08), transparent 40%)`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
            <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                ))}
            </div>
            {testimonial.icon && <testimonial.icon className="w-5 h-5 text-orange-500/20 group-hover:text-orange-500 transition-colors" />}
        </div>

        <p className={`text-stone-900 font-bold tracking-tight mb-10 italic leading-tight ${testimonial.className.includes('lg:col-span-3') ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          &ldquo;{testimonial.content}&rdquo;
        </p>

        <div className="mt-auto flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
            {testimonial.avatar}
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm tracking-tight">{testimonial.name}</h4>
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">
                {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <section 
        id="testimonials" 
        onMouseMove={handleMouseMove}
        className="py-40 relative overflow-hidden bg-[#fffdfa]"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-10">
          <div className="max-w-2xl">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8"
            >
                <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                The Elite Pulse
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-stone-950 leading-[0.85]"
            >
                Trusted by the <br />
                <span className="text-orange-600 italic">Visionaries</span>.
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-stone-500 text-lg font-medium max-w-xs md:text-right border-l-2 md:border-l-0 md:border-r-2 border-orange-500/20 px-6 h-fit"
          >
            Empowering Pakistani student leaders with elite-grade management software for the digital age.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 auto-rows-auto">
          {testimonials.map((testimonial, index) => (
            <SpotlightCard 
                key={index} 
                testimonial={testimonial} 
                mouseX={mouseX} 
                mouseY={mouseY} 
            />
          ))}
        </div>

        {/* Bottom Social Proof Action */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-1.5 bg-stone-100 rounded-[2.5rem] inline-flex items-center gap-6 pr-10 mx-auto left-1/2 -translate-x-1/2 relative group hover:bg-orange-50 transition-colors cursor-pointer"
        >
            <div className="flex -space-x-3 ml-1">
                {testimonials.slice(0, 4).map((t, i) => (
                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br ${t.color} flex items-center justify-center text-[10px] font-black text-white relative hover:z-10 transition-transform hover:scale-110 shadow-lg`}>
                        {t.avatar}
                    </div>
                ))}
            </div>
            <div>
                <p className="text-stone-950 font-black text-sm tracking-tight">
                    Join 2,000+ Pakistani Students
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                    Start your journey <MoveRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
      </div>

      {/* Extreme Background Polish */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/30 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
    </section>
  );
}
