import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCreateSocietyRequestMutation } from '../../../lib/features/societies/societyApiSlice';

export default function ApplicationForm() {
  const [createRequest, { isLoading }] = useCreateSocietyRequestMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State Structured per User Requirements
  const [formData, setFormData] = useState({
    title: '',
    exec_council: {
      president: { name: '', reg_no: '' },
      gen_sec: { name: '', reg_no: '' },
      treasurer: { name: '', reg_no: '' },
      others: [
        { name: '', reg_no: '' },
        { name: '', reg_no: '' },
        { name: '', reg_no: '' },
        { name: '', reg_no: '' },
      ],
    },
    exec_council_elect: Array(15).fill({ name: '', reg_no: '' }) as { name: string, reg_no: string }[],
    calendar_events: {
      description: '', // max 50 words
      events: [] as string[]
    },
    faculty_advisor: '',
    email: '',
    website: '',
    functions: ''
  });

  const updateElect = (idx: number, field: 'name'|'reg_no', value: string) => {
    const newElect = [...formData.exec_council_elect];
    newElect[idx] = { ...newElect[idx], [field]: value };
    setFormData({ ...formData, exec_council_elect: newElect });
  };
  
  const addElect = () => {
     setFormData({ ...formData, exec_council_elect: [...formData.exec_council_elect, { name: '', reg_no: '' }] });
  };

  const updateOtherExec = (idx: number, field: 'name'|'reg_no', value: string) => {
    const newOthers = [...formData.exec_council.others];
    newOthers[idx] = { ...newOthers[idx], [field]: value };
    setFormData({ ...formData, exec_council: { ...formData.exec_council, others: newOthers } });
  };

  const addEvent = () => {
    setFormData({ ...formData, calendar_events: { ...formData.calendar_events, events: [...formData.calendar_events.events, ''] } });
  };

  const updateEvent = (idx: number, value: string) => {
    const newEvents = [...formData.calendar_events.events];
    newEvents[idx] = value;
    setFormData({ ...formData, calendar_events: { ...formData.calendar_events, events: newEvents } });
  };

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
        description: formData.functions.substring(0, 200), // fallback description
        request_type: 'RENEWAL',
        form_data: formData
      };

      await createRequest(payload).unwrap();
      setSuccess('Society Application (Renewal) Form submitted successfully. An admin will review it shortly.');
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

      <div className="border-b border-stone-200 pb-4">
        <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-orange-600" />
          Society Application Form
        </h3>
        <p className="text-sm text-stone-500 mt-1">For renewing registration. Must be completed and submitted to the Office of the Incharge Student Societies.</p>
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

      {/* 2. Executive Council */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-stone-800 mb-2 border-b border-stone-200 pb-2">2. Executive Council</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label className="text-xs font-bold text-stone-500 ml-1">(i) President</label>
             <div className="flex gap-2 mt-1">
               <input placeholder="Name" required value={formData.exec_council.president.name} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, president: {...formData.exec_council.president, name: e.target.value}}})} className="input-field" />
               <input placeholder="Reg No" required value={formData.exec_council.president.reg_no} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, president: {...formData.exec_council.president, reg_no: e.target.value}}})} className="input-field w-1/3" />
             </div>
          </div>
          <div>
             <label className="text-xs font-bold text-stone-500 ml-1">(ii) General Secretary</label>
             <div className="flex gap-2 mt-1">
               <input placeholder="Name" required value={formData.exec_council.gen_sec.name} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, gen_sec: {...formData.exec_council.gen_sec, name: e.target.value}}})} className="input-field" />
               <input placeholder="Reg No" required value={formData.exec_council.gen_sec.reg_no} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, gen_sec: {...formData.exec_council.gen_sec, reg_no: e.target.value}}})} className="input-field w-1/3" />
             </div>
          </div>
          <div>
             <label className="text-xs font-bold text-stone-500 ml-1">(iii) Treasurer</label>
             <div className="flex gap-2 mt-1">
               <input placeholder="Name" required value={formData.exec_council.treasurer.name} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, treasurer: {...formData.exec_council.treasurer, name: e.target.value}}})} className="input-field" />
               <input placeholder="Reg No" required value={formData.exec_council.treasurer.reg_no} onChange={e => setFormData({...formData, exec_council: {...formData.exec_council, treasurer: {...formData.exec_council.treasurer, reg_no: e.target.value}}})} className="input-field w-1/3" />
             </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {formData.exec_council.others.map((member, idx) => (
            <div key={idx}>
              <label className="text-xs font-bold text-stone-500 ml-1">({['iv', 'v', 'vi', 'vii'][idx] || 'viii'}) Other Member</label>
              <div className="flex gap-2 mt-1">
                <input placeholder="Name" value={member.name} onChange={e => updateOtherExec(idx, 'name', e.target.value)} className="input-field" />
                <input placeholder="Reg No" value={member.reg_no} onChange={e => updateOtherExec(idx, 'reg_no', e.target.value)} className="input-field w-1/3 md:w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Executive Council - Elect */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <div>
                <h4 className="text-sm font-bold text-stone-800">3. Executive Council – Elect</h4>
                <p className="text-xs text-stone-500 mt-1">Please provide names and registration numbers of at least 15 members.</p>
            </div>
            <button type="button" onClick={addElect} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"><Plus className="w-3 h-3"/> Add More</button>
        </div>
        
        <div className="space-y-3">
          {formData.exec_council_elect.map((member, idx) => {
            const labels = ['President', 'General Secretary', 'Treasurer'];
            const label = labels[idx] || `Member ${idx + 1}`;
            return (
              <div key={idx} className="flex flex-col md:flex-row gap-2">
                <div className="w-full md:w-48 self-center text-xs font-bold text-stone-500">
                  ({['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv'][idx] || idx+1}) {label}
                </div>
                <input placeholder="Name" required={idx < 15} value={member.name} onChange={e => updateElect(idx, 'name', e.target.value)} className="input-field flex-1" />
                <input placeholder="Reg No" required={idx < 15} value={member.reg_no} onChange={e => updateElect(idx, 'reg_no', e.target.value)} className="input-field w-full md:w-48" />
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Calendar of Events */}
      <section className="bg-stone-50/50 border border-stone-100 p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-stone-800 border-b border-stone-200 pb-2">4. Proposed Calendar of Events</h4>
        
        <div>
          <label className="block text-xs font-bold text-stone-500 mb-1">What does it involve? How will you manage it? (not more than 50 words)</label>
          <textarea
            rows={3}
            required
            value={formData.calendar_events.description}
            onChange={e => setFormData({ ...formData, calendar_events: { ...formData.calendar_events, description: e.target.value }})}
            className="input-field"
          />
          <p className="text-[10px] text-stone-400 text-right mt-1">{formData.calendar_events.description.split(/\s+/).filter(w=>w.length>0).length} / 50 words</p>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-stone-500">Events List</label>
                <button type="button" onClick={addEvent} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg mb-2"><Plus className="w-3 h-3"/> Add Event</button>
            </div>
            
            {formData.calendar_events.events.length === 0 && (
                <div className="text-sm text-stone-400 italic">Please add your proposed events.</div>
            )}
            
            {formData.calendar_events.events.map((ev, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                    <span className="text-xs font-bold text-stone-500 min-w-[60px]">Event {idx + 1}:</span>
                    <input value={ev} onChange={e => updateEvent(idx, e.target.value)} className="input-field flex-1" placeholder="Event description..." />
                </div>
            ))}
        </div>
      </section>

      {/* 5,6,7. Other Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-bold text-stone-800 mb-2">5. Nominated Faculty Advisor</label>
             <input required value={formData.faculty_advisor} onChange={e => setFormData({...formData, faculty_advisor: e.target.value})} className="input-field" placeholder="Name of Faculty Advisor" />
          </div>
          <div>
             <label className="block text-sm font-bold text-stone-800 mb-2">6. Society Email Address</label>
             <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="society@cuilahore.edu.pk" />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-bold text-stone-800 mb-2">7. Society Website (if created)</label>
             <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="input-field" placeholder="https://" />
          </div>
      </section>

      {/* 8. Functions */}
      <section>
          <label className="block text-sm font-bold text-stone-800 mb-2">8. Functions of Society</label>
          <p className="text-xs text-stone-500 mb-2">Clearly mention the prime activities of the society.</p>
          <textarea
            rows={5}
            required
            value={formData.functions}
            onChange={e => setFormData({ ...formData, functions: e.target.value })}
            className="input-field min-h-[120px]"
          />
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
          {isLoading ? 'Submitting Form...' : 'Submit Application Form'}
        </button>
      </div>
    </motion.form>
  );
}
