'use client';

import React, { useState } from 'react';
import { useCreateSocietyMutation, useUpdateSocietyMutation } from '@/lib/features/societies/societyApiSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface ContentSection {
  title: string;
  content: string;
}

interface SocietyGroup {
  name: string;
}

interface SocietyData {
  _id?: string;
  name: string;
  description: string;
  registration_fee: number;
  groups?: SocietyGroup[];
  content_sections: ContentSection[];
}

interface CreateSocietyFormProps {
  initialData?: SocietyData;
  isEditing?: boolean;
  isModal?: boolean;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  registration_fee: number;
  category: string;
  teams: string[];
  content_sections: ContentSection[];
  why_join_us: string[];
  faqs: FAQ[];
  contact_info: ContactInfo;
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface ContactInfo {
    email: string;
    phone: string;
    website: string;
    social_links: {
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
    }
}

const CreateSocietyForm = ({ initialData, isEditing = false, isModal = true, onCancel }: CreateSocietyFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    registration_fee: initialData?.registration_fee || 0,
    category: (initialData as any)?.category || 'Technology',
    teams: initialData?.groups?.map((g: SocietyGroup) => g.name) || [],
    content_sections: initialData?.content_sections || [],
    why_join_us: (initialData as any)?.why_join_us || [],
    faqs: (initialData as any)?.faqs || [],
    contact_info: (initialData as any)?.contact_info || {
        email: '',
        phone: '',
        website: '',
        social_links: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        }
    }
  });
  
  // Set initial preview if logo exists (assuming it's a URL in initialData, though not in interface yet)
  // For now, only local preview.
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>((initialData as any)?.logo || null);
  const [teamInput, setTeamInput] = useState('');
  
  // Content Section State
  const [newSection, setNewSection] = useState<ContentSection>({
    title: '',
    content: ''
  });

  // Why Join Us State
  const [reasonInput, setReasonInput] = useState('');
  
  // FAQ State
  const [newFaq, setNewFaq] = useState<FAQ>({
      question: '',
      answer: ''
  });

  const [createSociety, { isLoading: isCreating }] = useCreateSocietyMutation();
  const [updateSociety, { isLoading: isUpdating }] = useUpdateSocietyMutation();
  const router = useRouter();
  const isLoading = isCreating || isUpdating;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (['facebook', 'instagram', 'twitter', 'linkedin'].includes(name)) {
          setFormData({
              ...formData,
              contact_info: {
                  ...formData.contact_info,
                  social_links: {
                      ...formData.contact_info.social_links,
                      [name]: value
                  }
              }
          });
      } else {
          setFormData({
              ...formData,
              contact_info: {
                  ...formData.contact_info,
                  [name]: value
              }
          });
      }
  };

  const addTeam = () => {
    const teamName = teamInput.trim();
    if (teamName && !formData.teams.includes(teamName)) {
      setFormData({ ...formData, teams: [...formData.teams, teamName] });
      setTeamInput('');
    }
  };

  const removeTeam = (index: number) => {
    const newTeams = [...formData.teams];
    newTeams.splice(index, 1);
    setFormData({ ...formData, teams: newTeams });
  };

  const addSection = () => {
    if (newSection.title && newSection.content) {
        setFormData({ 
          ...formData, 
          content_sections: [...formData.content_sections, newSection] 
        });
        setNewSection({ title: '', content: '' });
    }
  };

  const removeSection = (index: number) => {
      const newSections = [...formData.content_sections];
      newSections.splice(index, 1);
      setFormData({ ...formData, content_sections: newSections });
  };

  const addReason = () => {
      const reason = reasonInput.trim();
      if (reason && !formData.why_join_us.includes(reason)) {
          setFormData({ ...formData, why_join_us: [...formData.why_join_us, reason] });
          setReasonInput('');
      }
  };

  const removeReason = (index: number) => {
      const newReasons = [...formData.why_join_us];
      newReasons.splice(index, 1);
      setFormData({ ...formData, why_join_us: newReasons });
  };

  const addFaq = () => {
      if (newFaq.question && newFaq.answer) {
          setFormData({
              ...formData,
              faqs: [...formData.faqs, newFaq]
          });
          setNewFaq({ question: '', answer: '' });
      }
  };

  const removeFaq = (index: number) => {
      const newFaqs = [...formData.faqs];
      newFaqs.splice(index, 1);
      setFormData({ ...formData, faqs: newFaqs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('registration_fee', formData.registration_fee.toString());
      formPayload.append('category', formData.category);
      formPayload.append('teams', JSON.stringify(formData.teams));
      formPayload.append('content_sections', JSON.stringify(formData.content_sections));
      formPayload.append('why_join_us', JSON.stringify(formData.why_join_us));
      formPayload.append('faqs', JSON.stringify(formData.faqs));
      formPayload.append('contact_info', JSON.stringify(formData.contact_info));
      
      if (logo) {
        formPayload.append('logo', logo);
      }

      // Debug Logging
      for (const pair of formPayload.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
      }

      if (isEditing && initialData?._id) {
          result = await updateSociety({ id: initialData._id, data: formPayload }).unwrap();
          toast.success('Society updated successfully!', { icon: '✅' });
      } else {
          result = await createSociety(formPayload).unwrap();
          toast.success('Society launched successfully!', { icon: '🚀' });
      }
      
      if (result) {
          router.push('/society/dashboard'); 
      }
    } catch (err) {
      console.error('Failed to save society:', err);
      const error = err as { data?: { message?: string } };
      const errorMessage = error.data?.message || 'Failed to save society';
      toast.error(errorMessage);
    }
  };

  const formContent = (
      <div className={`w-full max-w-4xl bg-[#0f172a] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden ${!isModal ? 'mx-auto my-8' : ''}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-blue-500/20 bg-linear-to-r from-blue-900/20 to-purple-900/20">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
            {isEditing ? 'Update Society Settings' : 'Setup Your Society'}
          </h2>
          <p className="text-blue-200/60 mt-2">
            {isEditing ? 'Modify your society profile and settings' : 'Initialize your digital headquarters'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 px-8 pt-6">
            {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transitions-all duration-300 ${step >= s ? 'bg-blue-500' : 'bg-gray-700'}`} />
            ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Society Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder="e.g. Computer Science Society"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all min-h-[100px]"
                                placeholder="Describe your society's mission..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Registration Fee (PKR)</label>
                            <input
                                type="number"
                                name="registration_fee"
                                value={formData.registration_fee}
                                onChange={handleInputChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                required
                            >
                                <option value="Technology">Technology</option>
                                <option value="Arts">Arts</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Sports">Sports</option>
                                <option value="Religious">Religious</option>
                                <option value="Social">Social</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                         {/* Logo Upload */}
                         <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Society Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setLogo(file);
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                            />
                            {preview && (
                                <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-blue-500/30">
                                    <img src={preview} alt="Society Logo Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setLogo(null);
                                            setPreview(null);
                                        }} 
                                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Teams */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">Create Teams/Committees</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={teamInput}
                                onChange={(e) => setTeamInput(e.target.value)}
                                className="flex-1 bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g. Technical Team"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeam())}
                            />
                            <button
                                type="button"
                                onClick={addTeam}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {formData.teams.map((team: string, idx: number) => (
                                <span key={idx} className="bg-blue-900/40 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {team}
                                    <button type="button" onClick={() => removeTeam(idx)} className="hover:text-red-400">×</button>
                                </span>
                            ))}
                        </div>
                   </div>
                </div>
            )}

            {/* Step 3: Content Sections */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">Add Content Sections</label>
                        <p className="text-xs text-blue-400/60 mb-4">Add detailed sections about your society (e.g., Overview, Mission, Achievements).</p>
                        
                        <div className="space-y-4 mb-6">
                            <input
                                type="text"
                                placeholder="Section Title (e.g., Overview)"
                                value={newSection.title}
                                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <textarea
                                placeholder="Section Content..."
                                value={newSection.content}
                                onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]"
                            />
                            <button
                                type="button"
                                onClick={addSection}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg py-3 font-medium transition-colors"
                            >
                                Add Section
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.content_sections.map((section: ContentSection, idx: number) => (
                                <div key={idx} className="bg-blue-900/20 border border-blue-500/10 rounded-lg p-4 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-blue-200 font-semibold">{section.title}</h4>
                                        <button type="button" onClick={() => removeSection(idx)} className="text-gray-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Why Join Us */}
            {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">Why Join Us?</label>
                        <p className="text-xs text-blue-400/60 mb-4">Add key benefits of joining your society.</p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={reasonInput}
                                onChange={(e) => setReasonInput(e.target.value)}
                                className="flex-1 bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g. Networking Opportunities"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
                            />
                            <button
                                type="button"
                                onClick={addReason}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                             {formData.why_join_us.map((reason: string, idx: number) => (
                                 <div key={idx} className="bg-blue-900/40 border border-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
                                     <span>{reason}</span>
                                     <button type="button" onClick={() => removeReason(idx)} className="hover:text-red-400">×</button>
                                 </div>
                             ))}
                        </div>
                   </div>
                </div>
            )}

            {/* Step 5: FAQs */}
            {step === 5 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">Frequently Asked Questions</label>
                        
                        <div className="space-y-4 mb-6">
                            <input
                                type="text"
                                placeholder="Question"
                                value={newFaq.question}
                                onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <textarea
                                placeholder="Answer"
                                value={newFaq.answer}
                                onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                            />
                            <button
                                type="button"
                                onClick={addFaq}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg py-3 font-medium transition-colors"
                            >
                                Add FAQ
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.faqs.map((faq: FAQ, idx: number) => (
                                <div key={idx} className="bg-blue-900/20 border border-blue-500/10 rounded-lg p-4 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-blue-200 font-semibold">{faq.question}</h4>
                                        <button type="button" onClick={() => removeFaq(idx)} className="text-gray-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                   </div>
                 </div>
            )}

            {/* Step 6: Contact Info */}
            {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-xl font-semibold text-blue-200">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Official Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.contact_info.email}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="society@university.edu.pk"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.contact_info.phone}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="+92 300 1234567"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-blue-300 mb-1">Website URL</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.contact_info.website}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="https://societysite.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Facebook URL</label>
                            <input
                                type="url"
                                name="facebook"
                                value={formData.contact_info.social_links.facebook}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Instagram URL</label>
                            <input
                                type="url"
                                name="instagram"
                                value={formData.contact_info.social_links.instagram}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">Twitter URL</label>
                            <input
                                type="url"
                                name="twitter"
                                value={formData.contact_info.social_links.twitter}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-300 mb-1">LinkedIn URL</label>
                            <input
                                type="url"
                                name="linkedin"
                                value={formData.contact_info.social_links.linkedin}
                                onChange={handleContactChange}
                                className="w-full bg-[#1e293b] border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-blue-500/20">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2 rounded-lg text-blue-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Back
                    </button>
                ) : (
                    <div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => onCancel ? onCancel() : router.back()}
                                className="px-6 py-2 rounded-lg text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
                
                {step < 6 ? (
                    <button
                        type="button"
                        onClick={() => setStep(step + 1)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all hover:scale-[1.02]"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Society' : 'Launch Society')}
                    </button>
                )}
            </div>
        </form>
      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto">
        {formContent}
      </div>
    );
  }

  return formContent;
};

export default CreateSocietyForm;
