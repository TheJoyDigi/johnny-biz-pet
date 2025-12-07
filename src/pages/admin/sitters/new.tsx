import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../_layout';

export default function NewSitterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [createMode, setCreateMode] = useState<'profile_only' | 'invite_user'>('profile_only');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreateSitter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let endpoint = '';
      let body = {};

      if (createMode === 'invite_user') {
        endpoint = '/api/admin/invite-sitter';
        body = { email, firstName, lastName, sendInvite: true };
      } else {
        endpoint = '/api/admin/create-sitter-profile';
        body = { firstName, lastName, email: email || undefined };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }
      
      // Redirect to the sitters list on success
      router.push('/admin/sitters');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">New Sitter</h1>
      <div className="max-w-lg bg-white p-8 rounded-lg shadow">
        
        {/* Mode Toggle */}
        <div className="mb-6 flex space-x-4 border-b pb-4">
            <button
                type="button"
                onClick={() => setCreateMode('profile_only')}
                className={`pb-2 text-sm font-medium ${createMode === 'profile_only' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Create Profile (No Account)
            </button>
            <button
                type="button"
                onClick={() => setCreateMode('invite_user')}
                className={`pb-2 text-sm font-medium ${createMode === 'invite_user' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Invite User & Create Profile
            </button>
        </div>

        <form onSubmit={handleCreateSitter} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {createMode === 'invite_user' ? 'Email Address (Required)' : 'Contact Email (Optional)'}
            </label>
            <input
              type="email"
              id="email"
              required={createMode === 'invite_user'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {createMode === 'profile_only' && (
             <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                This will create a sitter profile that you can edit. The sitter will <strong>not</strong> receive an email or have a login account yet. You can invite them later from the Sitters list.
             </p>
          )}

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Processing...' : (createMode === 'invite_user' ? 'Send Invitation' : 'Create Sitter Profile')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}