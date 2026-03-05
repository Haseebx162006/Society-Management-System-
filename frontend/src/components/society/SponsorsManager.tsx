import React, { useState } from 'react';
import { useGetSponsorsBySocietyQuery, useCreateSponsorMutation, useUpdateSponsorMutation, useDeleteSponsorMutation } from '@/lib/features/sponsors/sponsorApiSlice';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaHandshake } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SponsorsManagerProps {
  societyId: string;
}

const SponsorsManager: React.FC<SponsorsManagerProps> = ({ societyId }) => {
  const { data: sponsorsResponse, isLoading, refetch } = useGetSponsorsBySocietyQuery(societyId);
  const [createSponsor, { isLoading: isCreating }] = useCreateSponsorMutation();
  const [updateSponsor, { isLoading: isUpdating }] = useUpdateSponsorMutation();
  const [deleteSponsor] = useDeleteSponsorMutation();

  const sponsors = Array.isArray(sponsorsResponse) ? sponsorsResponse : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact: '',
    email: '',
    phone: '',
    active: true,
    amount: 0,
    logo_url: ''
  });

  const handleOpenModal = (sponsor?: any) => {
    if (sponsor) {
      setEditingId(sponsor._id);
      setFormData({
        name: sponsor.name,
        description: sponsor.description || '',
        contact: sponsor.contact,
        email: sponsor.email,
        phone: sponsor.phone || '',
        active: sponsor.active,
        amount: sponsor.amount || 0,
        logo_url: sponsor.logo_url || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        contact: '',
        email: '',
        phone: '',
        active: true,
        amount: 0,
        logo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSponsor({ id: editingId, ...formData }).unwrap();
        toast.success("Sponsor updated successfully");
      } else {
        await createSponsor({ society_id: societyId, ...formData }).unwrap();
        toast.success("Sponsor added successfully");
      }
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to save sponsor");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await deleteSponsor(id).unwrap();
        toast.success("Sponsor deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error(err.data?.message || "Failed to delete sponsor");
      }
    }
  };

  const toggleActiveStatus = async (sponsor: any) => {
    try {
      await updateSponsor({ id: sponsor._id, active: !sponsor.active }).unwrap();
      toast.success(`Sponsor marked as ${!sponsor.active ? 'active' : 'inactive'}`);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaHandshake className="text-orange-600" /> Manage Sponsors
          </h2>
          <p className="text-slate-500">Add and manage society sponsors</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <FaPlus /> Add Sponsor
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <FaHandshake className="text-4xl mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-700 mb-2">No sponsors found</p>
          <p>Click the "Add Sponsor" button to start tracking your society's sponsors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor: any) => (
            <div key={sponsor._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={sponsor.name}>{sponsor.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(sponsor)}
                      className="p-2 text-stone-400 hover:text-orange-600 bg-stone-50 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor._id)}
                      className="p-2 text-stone-400 hover:text-red-600 bg-stone-50 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                  {sponsor.description || "No description provided."}
                </p>

                <div className="space-y-2 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><span className="font-semibold text-slate-700">Contact Person:</span> {sponsor.contact}</p>
                  <p><span className="font-semibold text-slate-700">Email:</span> {sponsor.email}</p>
                  {sponsor.phone && <p><span className="font-semibold text-slate-700">Phone:</span> {sponsor.phone}</p>}
                  {sponsor.amount > 0 && <p><span className="font-semibold text-slate-700">Amount:</span> ${sponsor.amount}</p>}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-sm font-medium text-slate-500">Status</span>
                  <button
                    onClick={() => toggleActiveStatus(sponsor)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      sponsor.active ? 'bg-orange-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sponsor.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Sponsor' : 'Add New Sponsor'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-stone-600 p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="sponsorForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Sponsor Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder="Brief description of the sponsorship"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      name="contact"
                      required
                      value={formData.contact}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full pl-7 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mt-4">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900 font-medium">
                    Active Sponsor
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="sponsorForm"
                disabled={isCreating || isUpdating}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(isCreating || isUpdating) ? (
                  <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Saving...
                  </>
                ) : (
                  'Save Sponsor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorsManager;
