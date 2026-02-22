"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch("https://formspree.io/f/xpqjoaae", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formState)
            });
            if (response.ok) {
                setSubmitted(true);
                setFormState({ name: "", email: "", subject: "", message: "" });
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900 overflow-hidden">
            <Header />

            <section className="relative pt-15 pb-20 lg:pt-34 lg:pb-34">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px]" 
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold uppercase tracking-widest mb-8">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                Get in Touch
                            </span>
                            <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-none">
                                Let&apos;s Start a <br />
                                <span className="text-orange-600 italic">Conversation</span>.
                            </h1>
                            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                                Have questions about a society, an event, or want to collaborate? 
                                Our team is here to help you navigate your journey.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-5 space-y-6"
                        >
                            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-stone-200/60 shadow-xl shadow-stone-100/50">
                                <h3 className="text-2xl font-black text-stone-900 mb-8">Contact Information</h3>
                                
                                <div className="space-y-8">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Email Us</p>
                                            <p className="text-lg font-bold text-stone-900">sp25-bcs-051@cuilahore.edu.pk</p>
                                            <p className="text-lg font-bold text-stone-900">sp25-bcs-048@cuilahore.edu.pk</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Call Us</p>
                                            <p className="text-lg font-bold text-stone-900">+923181792848</p>
                                            <p className="text-lg font-bold text-stone-900">+923249540797</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Office</p>
                                            <p className="text-lg font-bold text-stone-900">Student Center, COMSATS University</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white">
                                <div className="flex items-center gap-4 mb-6">
                                    <Clock className="w-6 h-6 text-orange-500" />
                                    <h4 className="text-xl font-bold">Response Time</h4>
                                </div>
                                <p className="text-stone-400 leading-relaxed mb-6">
                                    We typically respond to all inquiries within 24 hours during working days. 
                                    For urgent society matters, please contact the respective society president directly.
                                </p>
                               
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="lg:col-span-7"
                        >
                            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-stone-200/60 shadow-2xl shadow-stone-200/40 relative overflow-hidden">
                                {submitted ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-20"
                                    >
                                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <Send className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-black text-stone-900 mb-4">Message Sent!</h3>
                                        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
                                            Thank you for reaching out. We&apos;ve received your message and will get back to you shortly.
                                        </p>
                                        <button 
                                            onClick={() => setSubmitted(false)}
                                            className="text-orange-600 font-bold hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-500 uppercase tracking-widest ml-1">Full Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    value={formState.name}
                                                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                                                    placeholder="John Doe"
                                                    className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-stone-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-500 uppercase tracking-widest ml-1">Email Address</label>
                                                <input 
                                                    required
                                                    type="email" 
                                                    value={formState.email}
                                                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                                                    placeholder="john@example.com"
                                                    className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-stone-300"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase tracking-widest ml-1">Subject</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={formState.subject}
                                                onChange={(e) => setFormState({...formState, subject: e.target.value})}
                                                placeholder="How can we help?"
                                                className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-stone-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase tracking-widest ml-1">Message</label>
                                            <textarea 
                                                required
                                                rows={5}
                                                value={formState.message}
                                                onChange={(e) => setFormState({...formState, message: e.target.value})}
                                                placeholder="Share your thoughts with us..."
                                                className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-stone-300 resize-none"
                                            />
                                        </div>

                                        <button 
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 border-t border-stone-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Live Chat</h4>
                            <p className="text-stone-500">Available Mon-Fri, 9am-5pm for immediate assistance.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                                <Users className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Community Support</h4>
                            <p className="text-stone-500">Join our Whatsapp group to connect with other students.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Partnerships</h4>
                            <p className="text-stone-500">For sponsorship or collaboration, email sp25-bcs-051@cuilahore.edu.pk , sp25-bcs-048@cuilahore.edu.pk</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

import { Users } from "lucide-react";
