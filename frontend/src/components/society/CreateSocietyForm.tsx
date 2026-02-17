import React, { useState } from 'react';
import { useCreateSocietyMutation, useUpdateSocietyMutation } from '@/lib/features/societies/societyApiSlice';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { toast } from 'react-hot-toast';

export interface ContentSection {
  title: string;
  content: string;
}

interface CreateSocietyFormProps {
  initialData?: any;
  isEditing?: boolean;
}

interface FormData {
  name: string;
  description: string;
  registration_fee: number;
  teams: string[];
  content_sections: ContentSection[];
}

const CreateSocietyForm = ({ initialData, isEditing = false }: CreateSocietyFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    registration_fee: initialData?.registration_fee || 0,
    teams: initialData?.groups?.map((g: any) => g.name) || [],
    content_sections: initialData?.content_sections || [],
  });
  const [teamInput, setTeamInput] = useState('');
  
  // Content Section State
  const [newSection, setNewSection] = useState<ContentSection>({
    title: '',
    content: ''
  });

  const [createSociety, { isLoading: isCreating }] = useCreateSocietyMutation();
  const [updateSociety, { isLoading: isUpdating }] = useUpdateSocietyMutation();
  const router = useRouter();
  const isLoading = isCreating || isUpdating;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (isEditing && initialData?._id) {
          result = await updateSociety({ id: initialData._id, ...formData }).unwrap();
          toast.success('Society updated successfully!', { icon: '✅' });
      } else {
          result = await createSociety(formData).unwrap();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#0f172a] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden">
        
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
            {[1, 2, 3].map((s) => (
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
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                onClick={() => router.back()}
                                className="px-6 py-2 rounded-lg text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
                
                {step < 3 ? (
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
    </div>
  );
};

export default CreateSocietyForm;
