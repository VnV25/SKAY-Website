/**
 * ProductVariantsPanel
 *
 * Shown inside the Admin Dashboard products tab when an admin
 * expands a product row. Lets the admin:
 *   - View all existing variants (grouped by type)
 *   - Upload / replace the image for each variant
 *   - Add new variants
 *   - Delete variants
 *
 * Does NOT touch the Services page or any public-facing UI.
 */
import { useState } from 'react';
import { Plus, Trash2, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useProductVariants, ProductVariant } from '../../hooks/useProductVariants';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Props {
  productId: string;
  productName: string;
}

const VARIANT_TYPES = ['color', 'type', 'size'] as const;
type VariantType = typeof VARIANT_TYPES[number];

const TYPE_LABELS: Record<VariantType, string> = {
  color: 'Color',
  type:  'Style / Type',
  size:  'Size',
};

const TYPE_COLORS: Record<VariantType, string> = {
  color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  type:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  size:  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

export function ProductVariantsPanel({ productId, productName }: Props) {
  const {
    variants, loading, error,
    addVariant, uploadVariantImage, deleteVariant,
  } = useProductVariants(productId);

  const [newType,  setNewType]  = useState<VariantType>('color');
  const [newValue, setNewValue] = useState('');
  const [adding,   setAdding]   = useState(false);
  const [addError, setAddError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Group variants by type for display
  const grouped = VARIANT_TYPES.reduce<Record<string, ProductVariant[]>>((acc, t) => {
    acc[t] = variants.filter(v => v.variant_type === t);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  const handleAdd = async () => {
    if (!newValue.trim()) { setAddError('Value is required'); return; }
    setAdding(true);
    setAddError('');
    const result = await addVariant(newType, newValue.trim());
    if (result) setNewValue('');
    else setAddError('Failed to add variant');
    setAdding(false);
  };

  const handleImageUpload = async (variantId: string, file: File) => {
    setUploadingId(variantId);
    await uploadVariantImage(variantId, file);
    setUploadingId(null);
  };

  const inputClass = 'h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-sm text-white outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent';

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Variants for {productName}
        </h4>
        {loading && <span className="text-xs text-white/40 animate-pulse">Loading…</span>}
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* ── Existing variants grouped by type ── */}
      {VARIANT_TYPES.map(type => {
        const group = grouped[type];
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${TYPE_COLORS[type]}`}>
              {TYPE_LABELS[type]}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {group.map(variant => (
                <div
                  key={variant.id}
                  className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden group"
                >
                  {/* Variant image */}
                  <div className="aspect-square bg-white/5 overflow-hidden">
                    {variant.image_url ? (
                      <ImageWithFallback
                        src={variant.image_url}
                        alt={variant.variant_value}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Variant label */}
                  <div className="px-2 py-1.5">
                    <p className="text-white/80 text-xs font-medium truncate">{variant.variant_value}</p>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {/* Upload image */}
                    <label className="cursor-pointer w-full">
                      <div className="flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-2 py-1 text-white text-[10px] font-medium transition-colors">
                        {uploadingId === variant.id ? (
                          <span className="animate-pulse">Uploading…</span>
                        ) : (
                          <><Upload size={10} /> Upload</>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === variant.id}
                        onChange={e => {
                          if (e.target.files?.[0]) void handleImageUpload(variant.id, e.target.files[0]);
                        }}
                      />
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete variant "${variant.variant_value}"?`)) {
                          void deleteVariant(variant.id);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg px-2 py-1 text-red-300 text-[10px] font-medium transition-colors"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {variants.length === 0 && !loading && (
        <p className="text-white/30 text-xs text-center py-2">No variants yet. Add one below.</p>
      )}

      {/* ── Add new variant ── */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-white/50 mb-2 font-medium">Add Variant</p>
        <div className="flex flex-wrap gap-2 items-end">
          {/* Type selector */}
          <div>
            <label className="block text-[10px] text-white/40 mb-1">Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as VariantType)}
              className={`${inputClass} w-28 [&>option]:bg-indigo-950 [&>option]:text-white`}
            >
              {VARIANT_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Value input */}
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] text-white/40 mb-1">Value</label>
            <input
              type="text"
              value={newValue}
              onChange={e => { setNewValue(e.target.value); setAddError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') void handleAdd(); }}
              placeholder={newType === 'color' ? 'e.g. Black' : newType === 'type' ? 'e.g. Oversized' : 'e.g. XL'}
              className={`${inputClass} w-full`}
            />
          </div>

          {/* Add button */}
          <button
            onClick={() => void handleAdd()}
            disabled={adding || !newValue.trim()}
            className="h-8 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus size={13} />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>

        {addError && <p className="text-red-400 text-xs mt-1">{addError}</p>}
        <p className="text-white/25 text-[10px] mt-1.5">
          After adding, hover the variant card to upload its image.
        </p>
      </div>
    </div>
  );
}
