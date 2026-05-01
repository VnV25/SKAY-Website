/**
 * ServiceModal
 *
 * Dark glass design — matches the rest of the site.
 * Now uses DB product_variants for color image switching when available.
 * Falls back to static colorOptions / previewImages from services.ts.
 * All cart / wishlist logic is unchanged.
 */
import { X, ShoppingCart, Heart, Star, Upload, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Product, useShop } from '../context/ShopContext';
import { ServiceItem } from '../data/services';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProductVariants } from '../hooks/useProductVariants';

interface ServiceModalProps {
  service: ServiceItem | null;
  categoryName: string;
  categoryIcon: string;
  isOpen: boolean;
  onClose: () => void;
}

type ColorOption = { name: string; hex: string; image?: string };

const TSHIRT_NECK_OPTIONS = [
  { id: 'round-neck', name: 'Round Neck', image: '/assets/blacktshirt.jpg' },
  { id: 'polo',       name: 'Polo',       image: '/assets/whitepolo.jpg' },
  { id: 'collar',     name: 'Collar',     image: '/assets/overcollar.jpg' },
];
const HOODIE_SLEEVE_OPTIONS = [
  { id: 'half-sleeve', name: 'Half Sleeve', image: '/assets/halfsleeve-hoodie.jpg' },
  { id: 'full-sleeve', name: 'Full Sleeve', image: '/assets/hoodie2.jpeg' },
];
const HOODIE_POCKET_OPTIONS = [
  { id: 'with-pocket',    name: 'With Pocket',    image: '/assets/hoodiepocket.jpg' },
  { id: 'without-pocket', name: 'Without Pocket', image: '/assets/withoutpocket.jpg' },
];

// Shared variant image card
function VariantCard({
  id, name, image, selected, onClick,
}: { id: string; name: string; image: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
        selected
          ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-lg shadow-pink-500/20'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      <div className="aspect-square overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="p-2 bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] font-medium text-center text-white/80 truncate">{name}</p>
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
}

export function ServiceModal({ service, categoryName, categoryIcon, isOpen, onClose }: ServiceModalProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  const [quantity,       setQuantity]       = useState(1);
  const [selectedSize,   setSelectedSize]   = useState('');
  const [selectedColor,  setSelectedColor]  = useState('');
  const [selectedNeck,   setSelectedNeck]   = useState('');
  const [selectedSleeve, setSelectedSleeve] = useState('');
  const [selectedType,   setSelectedType]   = useState('');
  const [customDesign,   setCustomDesign]   = useState('');
  const [designPreview,  setDesignPreview]  = useState('');

  // Try to find a matching DB product id for this service
  // Services use id `service-{name}` — we look up variants by that key.
  // If the product was seeded into the DB, its id will be a UUID, not this key.
  // We pass null here and rely on static fallbacks; admins can link via the
  // variants panel in the admin dashboard once products are in the DB.
  const serviceProductId = null; // extend later if you store service→product mapping
  const { variants: dbVariants } = useProductVariants(serviceProductId);

  const dbColorVariants = useMemo(() => dbVariants.filter(v => v.variant_type === 'color'), [dbVariants]);

  const colorOptions: ColorOption[] = useMemo(() => {
    if (!service) return [];
    if (service.colorOptions?.length) return service.colorOptions as ColorOption[];
    return (service.colors ?? []).map(c => ({ name: c, hex: '#9ca3af' }));
  }, [service]);

  const isTShirt = useMemo(() => Boolean(service && /t-?shirt/i.test(service.name)), [service]);
  const isHoodie = useMemo(() => Boolean(service && /hoodie/i.test(service.name)), [service]);

  useEffect(() => {
    if (!service || !isOpen) return;
    setQuantity(1);
    setSelectedSize('');
    setSelectedColor('');
    setSelectedNeck('');
    setSelectedSleeve('');
    setSelectedType('');
    setCustomDesign('');
    setDesignPreview('');
  }, [service, isOpen]);

  if (!service || !isOpen) return null;

  // Active preview image — DB variants first, then static previewImages
  const previewImage =
    (selectedColor && dbColorVariants.find(v => v.variant_value === selectedColor)?.image_url) ||
    (selectedColor && service.previewImages?.[selectedColor]) ||
    (selectedColor && colorOptions.find(o => o.name === selectedColor)?.image) ||
    service.image ||
    '/assets/img433.jpg';

  const serviceAsProduct: Product = {
    id:            `service-${service.name}`,
    name:          service.name,
    category:      categoryName.toLowerCase().replace(/\s+/g, '-'),
    price:         service.price         ?? 299,
    originalPrice: service.originalPrice ?? 499,
    discount:      service.discount      ?? 40,
    rating:        service.rating        ?? 4.8,
    reviews:       service.reviews       ?? 125,
    image:         previewImage,
    stock:         service.stock         ?? 50,
    description:   service.description,
    trending:      service.trending      ?? false,
    sizes:         service.sizes         ?? [],
    colors:        colorOptions.map(o => o.name),
  };

  const inWishlist = isInWishlist(serviceAsProduct.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setCustomDesign(file.name); setDesignPreview(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const canAddToCart = () => {
    if ((serviceAsProduct.sizes?.length ?? 0) > 0 && !selectedSize)   return false;
    if ((serviceAsProduct.colors?.length ?? 0) > 0 && !selectedColor) return false;
    if (isTShirt && !selectedNeck)   return false;
    if (isHoodie && (!selectedSleeve || !selectedType)) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;
    addToCart(serviceAsProduct, quantity, selectedSize, selectedColor, customDesign, selectedSleeve, selectedType, selectedNeck);
    onClose();
  };

  const optionBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-lg shadow-pink-500/25'
        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40'
    }`;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[90vh] z-50 overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryIcon}</span>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              {service.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all duration-200 hover:scale-105">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">

          {/* ── Left: image ── */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-white/5">
              <ImageWithFallback
                key={previewImage}
                src={previewImage}
                alt={serviceAsProduct.name}
                className="w-full rounded-xl object-cover transition-opacity duration-300"
              />
              {serviceAsProduct.discount > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {serviceAsProduct.discount}% OFF
                </span>
              )}
            </div>

            {/* Color thumbnail strip */}
            {colorOptions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      selectedColor === c.name
                        ? 'border-pink-500 ring-2 ring-pink-500/30'
                        : 'border-white/20 hover:border-white/50'
                    }`}
                  >
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-white/50 text-center leading-tight px-0.5"
                        style={{ backgroundColor: c.hex + '33' }}>
                        {c.name.slice(0, 3)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Design preview */}
            {designPreview && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="text-sm font-semibold mb-2 flex items-center gap-2 text-white/80">
                  <Package size={16} className="text-pink-400" /> Design Preview
                </div>
                <img src={designPreview} alt="Custom design preview" className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* ── Right: details ── */}
          <div className="space-y-4">

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14}
                    className={i < Math.floor(serviceAsProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'} />
                ))}
              </div>
              <span className="text-xs text-white/55">{serviceAsProduct.rating} ({serviceAsProduct.reviews} reviews)</span>
            </div>

            {/* Name + description */}
            <h1 className="text-2xl font-bold text-white leading-tight">{serviceAsProduct.name}</h1>
            <p className="text-white/65 text-sm leading-relaxed">{serviceAsProduct.description}</p>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                ₹{serviceAsProduct.price}
              </span>
              {serviceAsProduct.originalPrice && serviceAsProduct.originalPrice > serviceAsProduct.price && (
                <>
                  <span className="text-sm text-white/35 line-through">₹{serviceAsProduct.originalPrice}</span>
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    Save ₹{serviceAsProduct.originalPrice - serviceAsProduct.price}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            {serviceAsProduct.stock <= 10 ? (
              <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-semibold">
                🔥 Only {serviceAsProduct.stock} slots left!
              </div>
            ) : (
              <div className="text-green-400 text-xs font-medium">✓ Available ({serviceAsProduct.stock} slots)</div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="space-y-1">
                {service.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-green-400 flex-shrink-0">✓</span> {f}
                  </div>
                ))}
              </div>
            )}

            {/* Min order */}
            {service.minOrder && (
              <div className="bg-blue-500/15 border border-blue-500/25 px-3 py-2 rounded-xl text-xs text-blue-300 font-semibold">
                📦 {service.minOrder}
              </div>
            )}

            {/* Size selection */}
            {(serviceAsProduct.sizes?.length ?? 0) > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/70">
                  Size <span className="text-pink-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {serviceAsProduct.sizes!.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={optionBtn(selectedSize === s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection — image cards if colorOptions has images */}
            {colorOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/70">
                  Color <span className="text-pink-400">*</span>
                  {selectedColor && <span className="ml-2 text-pink-300 font-normal">— {selectedColor}</span>}
                </label>
                {colorOptions.some(c => c.image) ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {colorOptions.map(c => (
                      <VariantCard key={c.name} id={c.name} name={c.name}
                        image={c.image || service.image || '/assets/img433.jpg'}
                        selected={selectedColor === c.name}
                        onClick={() => setSelectedColor(c.name)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => (
                      <button key={c.name} onClick={() => setSelectedColor(c.name)} className={optionBtn(selectedColor === c.name)}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Variant options (style types) */}
            {service.variantOptions && service.variantOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/70">Style</label>
                <div className="flex flex-wrap gap-2">
                  {service.variantOptions.map(v => (
                    <button key={v} onClick={() => setSelectedType(v)} className={optionBtn(selectedType === v)}>{v}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Neck style (t-shirts) */}
            {isTShirt && (
              <div>
                <label className="block text-xs font-semibold mb-2 text-white/70">
                  Neck Style <span className="text-pink-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TSHIRT_NECK_OPTIONS.map(o => (
                    <VariantCard key={o.id} id={o.id} name={o.name} image={o.image}
                      selected={selectedNeck === o.id} onClick={() => setSelectedNeck(o.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Sleeve + pocket (hoodies) */}
            {isHoodie && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-white/70">
                    Sleeve <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HOODIE_SLEEVE_OPTIONS.map(o => (
                      <VariantCard key={o.id} id={o.id} name={o.name} image={o.image}
                        selected={selectedSleeve === o.id} onClick={() => setSelectedSleeve(o.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-white/70">
                    Pocket <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HOODIE_POCKET_OPTIONS.map(o => (
                      <VariantCard key={o.id} id={o.id} name={o.name} image={o.image}
                        selected={selectedType === o.id} onClick={() => setSelectedType(o.id)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Upload design */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-white/70">
                Upload Design <span className="text-white/35 font-normal">(Optional)</span>
              </label>
              <input type="file" id="service-design-upload" accept="image/*,.pdf,.ai,.psd" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="service-design-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-pink-400/50 transition-all duration-200 text-white/55 hover:text-white/75">
                <Upload size={16} className="text-pink-400" />
                <span className="text-xs">{customDesign || 'Click to upload your design'}</span>
              </label>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-white/70">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all flex items-center justify-center font-bold">
                  −
                </button>
                <span className="text-lg font-bold text-white w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(serviceAsProduct.stock, q + 1))}
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all flex items-center justify-center font-bold">
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-1">
              <button onClick={handleAddToCart} disabled={!canAddToCart()}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 ${
                  canAddToCart()
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-[1.02] hover:brightness-110 shadow-lg shadow-pink-500/25'
                    : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                }`}>
                <ShoppingCart size={17} /> Add to Cart
              </button>
              <button
                onClick={() => inWishlist ? removeFromWishlist(serviceAsProduct.id) : addToWishlist(serviceAsProduct)}
                className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105">
                <Heart size={18} className={inWishlist ? 'fill-red-400 text-red-400' : 'text-white/70'} />
              </button>
            </div>

            {!canAddToCart() && (
              <p className="text-xs text-pink-400/80">Please select all required options to continue</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
