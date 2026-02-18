"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
      content: "COMSOC has completely transformed how we manage our 500+ member engineering society. The event check-in feature alone saved us hours.",
      name: "Alex Rivera",
      role: "President, Engineering Society",
      avatar: "AR"
    },
    {
      content: "Finding clubs at COMSATS used to be hard. Now I can see every active society, their events, and join with just one click. It's a game changer.",
      name: "Fatima Ali",
      role: "CS Student, Semester 4",
      avatar: "FA"
    },
    {
      content: "The user interface is stunning and so easy to use. Setting up our society page took less than 10 minutes.",
      name: "James Wilson",
      role: "Secretary, Photography Club",
      avatar: "JW"
    }
  ];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Trusted by student leaders
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what other society executives are saying about their experience with SocietySync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
            >
              <Quote className="w-10 h-10 text-indigo-100 mb-6" />
              <p className="text-gray-700 leading-relaxed flex-1 mb-8">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
