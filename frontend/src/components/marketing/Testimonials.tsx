"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    content: "COMSOC transformed how we manage our 500+ member engineering society. The execution is flawless.",
    name: "Alex Rivera",
    role: "President, Engineering Society",
    avatar: "AR"
  },
  {
    content: "The elite standard for campus communities. Discovering my tribe took seconds, not semesters.",
    name: "Fatima Ali",
    role: "CS Student, Semester 4",
    avatar: "FA"
  },
  {
    content: "Stunning interface and institutional-grade management. Our secret weapon for society growth.",
    name: "James Wilson",
    role: "Secretary, Photography Club",
    avatar: "JW"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-40 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-orange-600 mb-4 block">Proven Excellence</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-stone-900 leading-tight">
                Trusted by the next <br /> generation of leaders.
            </h2>
          </div>
          <p className="text-stone-500 font-semibold text-sm tracking-wide uppercase max-w-xs md:text-right border-l-2 md:border-l-0 md:border-r-2 border-orange-500/20 px-6">
            Institutional-grade feedback from active campus executives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex flex-col group"
            >
              <div className="mb-8">
                <Quote className="w-8 h-8 text-orange-500/20 group-hover:text-orange-500/40 transition-colors" />
              </div>
              <p className="text-[22px] font-bold text-stone-900 leading-tight tracking-tight mb-10 group-hover:text-stone-700 transition-colors italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-5 mt-auto">
                <div className="w-14 h-14 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 font-bold text-xs shadow-sm shadow-stone-200">
                    {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 tracking-tight text-base">{testimonial.name}</h4>
                  <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
