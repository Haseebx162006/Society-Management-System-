import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useCreateSocietyRequestMutation } from '../../../lib/features/societies/societyApiSlice';

export default function ReviewForm() {
  const [createRequest, { isLoading }] = useCreateSocietyRequestMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State Structured per User Requirements
  const [formData, setFormData] = useState({
    title: '',
    current_president: { name: '', reg_no: '', phone: '', email: '' },
    past_president: { name: '', reg_no: '', phone: '', email: '' },
    other_office_bearers: [] as { name: string, reg_no: string }[],
    faculty_advisor: { name: '', designation: '', tenure: '' },
    history: {
      review_comment: '',
      activities: [] as { title: string, dates: string, review: string }[],
      challenges: '',
      feedback: '',
      official_documents: ''
    }
  });

  const addBearer = () => setFormData(prev => ({
    ...prev, other_office_bearers: [...prev.other_office_bearers, { name: '', reg_no: '' }]
  }));

  const removeBearer = (index: number) => setFormData(prev => ({
    ...prev, other_office_bearers: prev.other_office_bearers.filter((_, i) => i !== index)
  }));

  const addActivity = () => setFormData(prev => ({
    ...prev, history: { ...prev.history, activities: [...prev.history.activities, { title: '', dates: '', review: '' }] }
  }));

  const removeActivity = (index: number) => setFormData(prev => ({
    ...prev, history: { ...prev.history, activities: prev.history.activities.filter((_, i) => i !== index) }
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title of Society is required');
      return;
    }

    try {
      const payload = {
        society_name: formData.title,
        description: formData.history.review_comment.substring(0, 200), // fallback description
        request_type: 'REGISTER',
        form_data: formData
      };

      await createRequest(payload).unwrap();
      setSuccess('Student Society Review Form submitted successfully. An admin will review it shortly.');
      // Optional: reset form
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to submit form');
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-12" 
      onSubmit={handleSubmit}
    >
      <div className="border-b border-stone-200 pb-4">
        <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Student Society Review
        </h3>
        <p className="text-sm text-stone-500 mt-1">For initiating the registration of a new society based on previous/proposed activities.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-200">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5" /> {success}
        </div>
      )}

      {/* 1. Title */}
      <section>
        <label className="block text-sm font-bold text-stone-800 mb-2">1. Title of Society *</label>
        <input
          required
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-stone-800"
          placeholder="e.g. Computer Science Society"
        />
      </section>

      {/* 2. Current President */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">2. Current President</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="(i) Name" required value={formData.current_president.name} onChange={e => setFormData({ ...formData, current_president: { ...formData.current_president, name: e.target.value }})} className="input-field" />
          <input placeholder="(ii) CIIT Registration No." required value={formData.current_president.reg_no} onChange={e => setFormData({ ...formData, current_president: { ...formData.current_president, reg_no: e.target.value }})} className="input-field" />
          <input placeholder="(iii) Cell Phone No." value={formData.current_president.phone} onChange={e => setFormData({ ...formData, current_president: { ...formData.current_president, phone: e.target.value }})} className="input-field" />
          <input placeholder="(iv) Email Address" type="email" required value={formData.current_president.email} onChange={e => setFormData({ ...formData, current_president: { ...formData.current_president, email: e.target.value }})} className="input-field" />
        </div>
      </section>

      {/* 3. Past President */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">3. Past President (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="(i) Name" value={formData.past_president.name} onChange={e => setFormData({ ...formData, past_president: { ...formData.past_president, name: e.target.value }})} className="input-field" />
          <input placeholder="(ii) CIIT Registration No." value={formData.past_president.reg_no} onChange={e => setFormData({ ...formData, past_president: { ...formData.past_president, reg_no: e.target.value }})} className="input-field" />
          <input placeholder="(iii) Cell Phone No." value={formData.past_president.phone} onChange={e => setFormData({ ...formData, past_president: { ...formData.past_president, phone: e.target.value }})} className="input-field" />
          <input placeholder="(iv) Email Address" type="email" value={formData.past_president.email} onChange={e => setFormData({ ...formData, past_president: { ...formData.past_president, email: e.target.value }})} className="input-field" />
        </div>
      </section>

      {/* 4. Other Bearers */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-stone-200 pb-2">
          <h4 className="text-sm font-bold text-stone-800">4. Other Current Office Bearers</h4>
          <button type="button" onClick={addBearer} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"><Plus className="w-3 h-3"/> Add Bearer</button>
        </div>
        <div className="space-y-3">
          {formData.other_office_bearers.map((bearer, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs text-stone-400 font-bold w-6">({idx + 1})</span>
              <input placeholder="Name" value={bearer.name} onChange={e => { const newB = [...formData.other_office_bearers]; newB[idx].name = e.target.value; setFormData({...formData, other_office_bearers: newB}) }} className="input-field flex-1" />
              <input placeholder="CIIT Reg No." value={bearer.reg_no} onChange={e => { const newB = [...formData.other_office_bearers]; newB[idx].reg_no = e.target.value; setFormData({...formData, other_office_bearers: newB}) }} className="input-field flex-1" />
              <button type="button" onClick={() => removeBearer(idx)} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {formData.other_office_bearers.length === 0 && <p className="text-sm text-stone-400 italic">No other bearers added.</p>}
        </div>
      </section>

      {/* 5. Faculty Advisor */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">Faculty Advisor</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="(i) Name" required value={formData.faculty_advisor.name} onChange={e => setFormData({ ...formData, faculty_advisor: { ...formData.faculty_advisor, name: e.target.value }})} className="input-field" />
          <input placeholder="(ii) Designation" required value={formData.faculty_advisor.designation} onChange={e => setFormData({ ...formData, faculty_advisor: { ...formData.faculty_advisor, designation: e.target.value }})} className="input-field" />
          <input placeholder="(iii) Tenure (time period)" value={formData.faculty_advisor.tenure} onChange={e => setFormData({ ...formData, faculty_advisor: { ...formData.faculty_advisor, tenure: e.target.value }})} className="input-field" />
        </div>
      </section>

      {/* 6. History */}
      <section className="space-y-8 border-t border-stone-200 pt-8">
        <h4 className="text-lg font-bold text-stone-800">5. History & Activities</h4>
        
        <div>
          <label className="block text-sm font-bold text-stone-800 mb-2">(i) Qualitative and Quantitative Review of Activities</label>
          <p className="text-xs text-stone-500 mb-3">In light of the aims and objectives of your society, comment on the activities, financial aspects, and CIIT sponsorships involved.</p>
          <textarea
            rows={5}
            required
            value={formData.history.review_comment}
            onChange={e => setFormData({ ...formData, history: { ...formData.history, review_comment: e.target.value }})}
            className="input-field min-h-[120px]"
            placeholder="Review comments..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-stone-800">Critical Review (Activities)</label>
            <button type="button" onClick={addActivity} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"><Plus className="w-3 h-3"/> Add Activity</button>
          </div>
          {formData.history.activities.map((act, idx) => (
            <div key={idx} className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 relative">
              <button type="button" onClick={() => removeActivity(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              <div className="grid grid-cols-2 gap-3 pr-8">
                <input placeholder={`Activity ${idx + 1} Title`} value={act.title} onChange={e => { const acts = [...formData.history.activities]; acts[idx].title = e.target.value; setFormData({...formData, history: {...formData.history, activities: acts}}) }} className="input-field" />
                <input placeholder="Dates" value={act.dates} onChange={e => { const acts = [...formData.history.activities]; acts[idx].dates = e.target.value; setFormData({...formData, history: {...formData.history, activities: acts}}) }} className="input-field" />
              </div>
              <textarea placeholder="Review (max 100 words)" rows={3} value={act.review} onChange={e => { const acts = [...formData.history.activities]; acts[idx].review = e.target.value; setFormData({...formData, history: {...formData.history, activities: acts}}) }} className="input-field text-sm" />
              <p className="text-[10px] text-stone-400 text-right">{act.review.split(/\s+/).filter(w=>w.length>0).length} / 100 words</p>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-800 mb-2">(ii) Challenges Faced</label>
          <textarea rows={3} value={formData.history.challenges} onChange={e => setFormData({ ...formData, history: { ...formData.history, challenges: e.target.value }})} className="input-field" placeholder="What challenges did you face and how did you overcome them?" />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-800 mb-2">(iii) Feedback to Administration</label>
          <textarea rows={3} value={formData.history.feedback} onChange={e => setFormData({ ...formData, history: { ...formData.history, feedback: e.target.value }})} className="input-field" placeholder="What feedback would you like to provide to CIIT Administration?" />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-800 mb-2">(iv) Official Documents</label>
          <textarea rows={3} value={formData.history.official_documents} onChange={e => setFormData({ ...formData, history: { ...formData.history, official_documents: e.target.value }})} className="input-field" placeholder="List guidelines, membership policy, constitution, etc." />
        </div>
      </section>

      {/* Undertaking */}
      <section className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
        <h4 className="font-bold text-orange-900 mb-4">Undertaking</h4>
        <div className="space-y-4 text-sm text-stone-700">
          <label className="flex items-start gap-3">
            <input type="checkbox" required className="mt-1" />
            <span>I hereby submit that all the information provided in the application form is true and to the best of my knowledge.</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" required className="mt-1" />
            <span>I have read the responsibilities of a Society Faculty Advisor outlined in the CIIT Lahore Student Society Policy and herein provide my consent.</span>
          </label>
        </div>
      </section>

      <div className="flex justify-end pt-4 border-t border-stone-200">
        <button
          type="submit"
          disabled={isLoading}
          className="py-4 px-10 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-xl shadow-stone-900/10"
        >
          {isLoading ? 'Submitting Form...' : 'Submit Review Form'}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: white;
          border: 1px solid #e7e5e4;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
      `}} />
    </motion.form>
  );
}
