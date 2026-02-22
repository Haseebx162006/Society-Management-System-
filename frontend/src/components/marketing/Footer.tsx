import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  Platform: [
    { name: "Executive Lab", href: "#" },
    { name: "Portal Access", href: "/login" },
    { name: "Global Analytics", href: "#" },
    { name: "Network Status", href: "#" },
  ],
  Enterprise: [
    { name: "Institutional Policy", href: "#" },
    { name: "Brand Assets", href: "#" },
    { name: "Security Audit", href: "#" },
    { name: "Terms of Engagement", href: "#" },
  ],
  Support: [
    { name: "Manifesto", href: "/about" },
    { name: "Developer Docs", href: "#" },
    { name: "Connect with HQ", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-100 py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-20 lg:gap-12 mb-24">
          <div className="lg:col-span-3">
            <Link href="/" className="inline-flex items-center mb-10 group">
                <div className="relative h-20 w-48 transition-all duration-500 group-hover:scale-105">
                    <Image
                        src="/logo.png"
                        alt="COMSOC Logo"
                        fill
                        className="object-contain object-left filter drop-shadow-xl"
                    />
                </div>
            </Link>
            <p className="text-stone-500 font-normal text-lg leading-relaxed max-w-sm mb-12">
              The institutional standard for campus communities. Discover. Lead. Dominate.
            </p>
            <div className="flex gap-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <Link key={i} href={social.href} className="w-10 h-10 rounded-xl border border-stone-100 flex items-center justify-center text-stone-400 hover:text-orange-600 hover:border-orange-500 transition-all duration-300">
                    <social.icon size={18} />
                </Link>
              ))}
            </div>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-[0.4em] mb-10">{category}</h3>
              <ul className="space-y-6">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors uppercase tracking-widest"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-20 border-t border-stone-100/60 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} COMSOC Core Systems.
                </p>
                <div className="h-1 w-1 bg-stone-200 rounded-full hidden md:block" />
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
                    Authorized and Verified Unit
                </p>
            </div>
            
            <div className="flex gap-8">
                {["Legal Protocols", "Security Policy", "Privacy Shield"].map((item, i) => (
                    <Link key={i} href="#" className="text-[11px] font-semibold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest leading-none border-b border-transparent hover:border-stone-900 py-1">
                        {item}
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </footer>
  );
}
