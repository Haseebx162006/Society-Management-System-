import Link from "next/link";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Features", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Integrations", href: "#" },
    { name: "Changelog", href: "#" },
    { name: "Docs", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Privacy", href: "#" },
  ],
  Resources: [
    { name: "Community", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Partners", href: "#" },
    { name: "Status", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-bold text-xl text-gray-900">
                Society<span className="text-indigo-600">Sync</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
              The all-in-one platform for student societies to manage members, events, and finances with ease.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SocietySync. All rights reserved.
          </p>
          <div className="flex gap-6">
             <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</Link>
             <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</Link>
             <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
