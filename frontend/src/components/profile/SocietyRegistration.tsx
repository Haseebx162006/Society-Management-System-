import { useState } from "react";
import { useCreateSocietyRequestMutation } from "../../lib/features/societies/societyApiSlice";

export default function SocietyRegistration() {
  const [formData, setFormData] = useState({
    society_name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createRequest, { isLoading }] = useCreateSocietyRequestMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.society_name.trim()) {
      setError("Society name is required");
      return;
    }

    try {
      await createRequest(formData).unwrap();
      setSuccess("Request submitted successfully! An admin will review it shortly.");
      setFormData({ society_name: "", description: "" });
    } catch (err) {
      console.error("Failed to submit request:", err);
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 font-[var(--font-family-poppins)]">
          Register a New Society
        </h2>
        <p className="text-sm text-stone-400 mt-1">
          Submit a request to create a new society.
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="society_name" className="block text-sm font-medium text-stone-700">
              Society Name
            </label>
            <div className="mt-1">
              <input
                id="society_name"
                name="society_name"
                type="text"
                required
                value={formData.society_name}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm transition-all duration-200"
                placeholder="e.g. Green Valley Residents"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700">
              Description (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm transition-all duration-200"
                placeholder="Briefly describe your society..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
