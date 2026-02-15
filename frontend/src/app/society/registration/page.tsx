"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSocietyRequestMutation } from "../../../lib/features/societies/societyApiSlice";
import Link from "next/link";

export default function SocietyRegistrationPage() {
  const [formData, setFormData] = useState({
    society_name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
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

    if (!formData.society_name.trim()) {
      setError("Society name is required");
      return;
    }

    try {
      await createRequest(formData).unwrap();
      router.push("/profile");
    } catch (err) {
      console.error("Failed to submit request:", err);
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-[var(--font-family-poppins)]">
          Register a New Society
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Submit a request to create a new society.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="society_name" className="block text-sm font-medium text-gray-700">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Green Valley Residents"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Briefly describe your society..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-500">
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Submitting..." : "Submit Request"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
