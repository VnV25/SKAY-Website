import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, ChevronDown } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export function ImageManager() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const assetTypes = ['all', 'product', 'service', 'hero', 'gallery', 'brochure'];

  useEffect(() => {
    loadAssets();
  }, [filter]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const query = filter !== 'all' ? `?type=${filter}` : '';
      const data = await apiGet(`/api/admin/assets${query}`);
      setAssets(data.assets || []);
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      const fileName = `assets/${Date.now()}-${file.name}`;
      formData.append('file', file);

      // For now, we'll create a data URL representation
      // In production, you'd upload to Supabase Storage first
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // Create asset record
        const assetData = {
          name: file.name.split('.')[0],
          type: 'product', // Default, user can change
          file_url: base64, // In production, use actual Supabase URL
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
        };

        try {
          const newAsset = await apiPost('/api/admin/assets', assetData);
          setAssets([newAsset.asset, ...assets]);
          alert('Image uploaded successfully!');
          (e.target as HTMLInputElement).value = '';
          setPreviewUrl(null);
        } catch (err: any) {
          console.error('Error uploading asset:', err);
          alert(`Error uploading image: ${err.message}`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiDelete(`/api/admin/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
      alert('Image deleted successfully');
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      alert(`Error deleting image: ${err.message}`);
    }
  };

  const handleUpdateName = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const updatedAsset = await apiPut(`/api/admin/assets/${id}`, { name: editName });
      setAssets(assets.map(a => a.id === id ? { ...a, name: editName } : a));
      setEditingId(null);
      setEditName('');
    } catch (err: any) {
      console.error('Error updating asset:', err);
      alert(`Error updating image: ${err.message}`);
    }
  };

  const startEdit = (asset: any) => {
    setEditingId(asset.id);
    setEditName(asset.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Upload New Image</h2>
          
          <div className="mb-6">
            <label htmlFor="file-upload" className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors">
                <Upload className="mx-auto mb-4 text-gray-400" size={40} />
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold text-orange-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {previewUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img src={previewUrl} alt="Preview" className="max-h-40 rounded" />
            </div>
          )}

          {uploading && <p className="text-center text-gray-600">Uploading...</p>}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap gap-2">
            {assetTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filter === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            Images {filter !== 'all' && `(${filter})`}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : assets.length === 0 ? (
            <p className="text-center text-gray-500">No images found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image Preview */}
                  <div className="bg-gray-100 aspect-square overflow-hidden flex items-center justify-center">
                    {asset.file_url?.startsWith('data:') ? (
                      <img
                        src={asset.file_url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <p>Image</p>
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    {editingId === asset.id ? (
                      <div className="mb-3 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Image name"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateName(asset.id)}
                            className="flex-1 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{asset.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col text-xs text-gray-500">
                            <span>Type: <strong>{asset.type}</strong></span>
                            <span>Size: <strong>{(asset.file_size / 1024).toFixed(1)} KB</strong></span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    {editingId !== asset.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(asset)}
                          className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition-colors text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
