/**
 * ProductModal
 *
 * Displays full product details with:
 * - DB-driven variant system (colors, types, sizes from product_variants table)
 * - Image switches when a color variant is selected
 * - Falls back to static product.colors / product.sizes if no DB variants exist
 * - All existing cart / wishlist / design-upload logic preserved
 */
import { X, Star, Upload, ShoppingCart, Heart, Package } from 'lucide-react';
import { Product } from '../context/ShopContext';
import { useShop } from '../context/ShopContext';
import { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useProductVariants, ProductVariant } from '../hooks/useProductVariants';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

// ── Static fallbacks (used when DB has no variants for this product) ──────────
const DEFAULT_SLEEVE_OPTIONS = [
  { id: 'half', name: 'Half Sleeve', image: '/assets/halfsleeve-hoodie.jpg' },
  { id: 'full', name: 'Full Sleeve', image: '/assets/hoodie2.jpeg' },
];
const DEFAULT_TYPE_OPTIONS = [
  { id: 'with-pocket',    name: 'With Pocket',    image: '/assets/hoodiepocket.jpg' },
  { id: 'without-pocket', name: 'Without Pocket', image: '/assets/withoutpocket.jpg' },
];
const TSHIRT_NECK_OPTIONS = [
  { id: 'round-neck', name: 'Round Neck', image: '/assets/blacktshirt.jpg' },
  { id: 'polo',       name: 'Polo',       image: '/assets/whitepolo.jpg' },
  { id: 'collar',     name: 'Collar',     image: '/assets/overcollar.jpg' },
];

type VariantOption = string | { id: string; name: string; image: string };
const getOptionId    = (o: VariantOption) => typeof o === 'string' ? o : o.id;
const getOptionName  = (o: VariantOption) => typeof o === 'string' ? o : o.name;
const getOptionImage = (o: VariantOption, fb: string) => typeof o === 'string' ? fb : o.image || fb;

function tokenizeName(value: string): string[] {
  if (typeof value !== 'string') return [];
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
}

// ── Shared variant card ───────────────────────────────────────────────────────
function VariantCard({
  id, name, image, selected, onClick,
}: { id: string; name: string; image: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
        selected
          ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-lg shadow-pink-500/20'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-2.5 bg-white/10 backdrop-blur-sm">
        <p className="text-xs font-medium text-center text-white/80">{name}</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProductModal({ product, isOpen, onClose, onSelectProduct }: ProductModalProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToRecentlyViewed } = useShop();
  const { products } = useAdmin();

  // DB variants — only fetched when modal is open and product is set
  const { variants: dbVariants } = useProductVariants(isOpen && product ? product.id : null);

  // Selections
  const [selectedSize,   setSelectedSize]   = useState('');
  const [selectedColor,  setSelectedColor]  = useState('');
  const [selectedSleeve, setSelectedSleeve] = useState('');
  const [selectedType,   setSelectedType]   = useState('');
  const [selectedNeck,   setSelectedNeck]   = useState('');
  const [quantity,       setQuantity]       = useState(1);
  const [customDesign,   setCustomDesign]   = useState('');
  const [designPreview,  setDesignPreview]  = useState('');

  // Reset on product change
  useEffect(() => {
    if (!product || !isOpen) return;
    setSelectedSize('');
    setSelectedColor('');
    setSelectedSleeve('');
    setSelectedType('');
    setSelectedNeck('');
    setQuantity(1);
    setCustomDesign('');
    setDesignPreview('');
  }, [product?.id, isOpen]);

  const inWishlist = product ? isInWishlist(product.id) : false;
  const isHoodie   = useMemo(() => Boolean(product && /hoodie/i.test(product.name)), [product]);
  const isTShirt   = useMemo(() => Boolean(product && /t-?shirt/i.test(product.name)), [product]);

  // ── DB-driven variant groups ──────────────────────────────────────────────
  const dbColorVariants = useMemo(
    () => dbVariants.filter(v => v.variant_type === 'color'),
    [dbVariants]
  );
  const dbTypeVariants = useMemo(
    () => dbVariants.filter(v => v.variant_type === 'type'),
    [dbVariants]
  );
  const dbSizeVariants = useMemo(
    () => dbVariants.filter(v => v.variant_type === 'size'),
    [dbVariants]
  );

  // ── Active display image — switches when a color variant is selected ───────
  const activeImage = useMemo(() => {
    if (selectedColor && dbColorVariants.length > 0) {
      const match = dbColorVariants.find(v => v.variant_value === selectedColor);
      if (match?.image_url) return match.image_url;
    }
    return product?.image ?? '';
  }, [selectedColor, dbColorVariants, product]);

  // ── Sleeve / type / neck options (DB first, then static fallbacks) ─────────
  const sleeveOptions = useMemo(() => {
    if (!isHoodie) return [];
    if (dbTypeVariants.length > 0) {
      return dbTypeVariants
        .filter(v => /sleeve/i.test(v.variant_value))
        .map(v => ({ id: v.id, name: v.variant_value, image: v.image_url || '/assets/hoodie2.jpeg' }));
    }
    if (Array.isArray(product?.variants?.sleeves) && product!.variants!.sleeves.length > 0) {
      return product!.variants!.sleeves as VariantOption[];
    }
    return DEFAULT_SLEEVE_OPTIONS;
  }, [isHoodie, dbTypeVariants, product]);

  const typeOptions = useMemo(() => {
    if (!isHoodie) return [];
    if (dbTypeVariants.length > 0) {
      return dbTypeVariants
        .filter(v => !/sleeve/i.test(v.variant_value))
        .map(v => ({ id: v.id, name: v.variant_value, image: v.image_url || '/assets/hoodiepocket.jpg' }));
    }
    if (Array.isArray(product?.variants?.types) && product!.variants!.types.length > 0) {
      return product!.variants!.types as VariantOption[];
    }
    return DEFAULT_TYPE_OPTIONS;
  }, [isHoodie, dbTypeVariants, product]);

  const neckOptions = useMemo(() => {
    if (!isTShirt) return [];
    return TSHIRT_NECK_OPTIONS;
  }, [isTShirt]);

  // ── Related products ──────────────────────────────────────────────────────
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(c => c.id !== product.id && c.category === product.category);
    if (sameCategory.length >= 4) return sameCategory.slice(0, 6);
    const tokens = tokenizeName(product.name);
    const others = products
      .filter(c => c.id !== product.id && c.category !== product.category)
      .map(c => ({ c, score: tokenizeName(c.name).filter(t => tokens.includes(t)).length }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6 - sameCategory.length)
      .map(({ c }) => c);
    return [...sameCategory, ...others].slice(0, 6);
  }, [product, products]);

  if (!product || !isOpen) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomDesign(file.name);
      setDesignPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const canAddToCart = () => {
    // DB size variants take priority over static product.sizes
    const hasSizes = dbSizeVariants.length > 0 ? true : (product.sizes?.length ?? 0) > 0;
    const hasColors = dbColorVariants.length > 0 ? true : (product.colors?.length ?? 0) > 0;
    if (hasSizes  && !selectedSize)   return false;
    if (hasColors && !selectedColor)  return false;
    if (sleeveOptions.length > 0 && !selectedSleeve) return false;
    if (typeOptions.length   > 0 && !selectedType)   return false;
    if (neckOptions.length   > 0 && !selectedNeck)   return false;
    return true;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, customDesign, selectedSleeve, selectedType, selectedNeck);
    addToRecentlyViewed(product);
    onClose();
  };

  const handleWishlistToggle = () => {
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  // ── Shared button style ───────────────────────────────────────────────────
  const optionBtn = (active: boolean) =>
    `px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-lg shadow-pink-500/25'
        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[90vh] z-50 overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/15 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Product Details
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all duration-200 hover:scale-105">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">

            {/* ── Left: image ── */}
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-white/5">
                <img
                  key={activeImage}   /* key forces re-render / fade on image change */
                  src={activeImage}
                  alt={product.name}
                  className="w-full rounded-xl object-cover transition-opacity duration-300"
                  loading="lazy"
                />
                {product.discount && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* DB color variant thumbnails — quick-switch strip */}
              {dbColorVariants.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {dbColorVariants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedColor(v.variant_value)}
                      title={v.variant_value}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                        selectedColor === v.variant_value
                          ? 'border-pink-500 ring-2 ring-pink-500/30'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                    >
                      {v.image_url ? (
                        <img src={v.image_url} alt={v.variant_value} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40 text-[9px] text-center leading-tight px-0.5">
                          {v.variant_value}
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
            <div className="space-y-5">

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'} />
                  ))}
                </div>
                <span className="text-sm text-white/60">{product.rating} ({product.reviews} reviews)</span>
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  INR {product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-white/40 line-through">INR {product.originalPrice}</span>
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                      Save INR {product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              {product.stock <= 5 ? (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold">
                  ⚡ Hurry! Only {product.stock} left in stock
                </div>
              ) : (
                <div className="text-green-400 text-sm font-medium">✓ In Stock ({product.stock} available)</div>
              )}

              {/* Description */}
              <p className="text-white/70 leading-relaxed text-sm">{product.description}</p>

              {/* ── Size selection ── */}
              {/* DB size variants take priority */}
              {dbSizeVariants.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Select Size <span className="text-pink-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dbSizeVariants.map(v => (
                      <button key={v.id} onClick={() => setSelectedSize(v.variant_value)} className={optionBtn(selectedSize === v.variant_value)}>
                        {v.variant_value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : product.sizes && product.sizes.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Select Size <span className="text-pink-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={optionBtn(selectedSize === size)}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Color selection ── */}
              {/* DB color variants: show as image thumbnails + label */}
              {dbColorVariants.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Select Color <span className="text-pink-400">*</span>
                    {selectedColor && <span className="ml-2 text-pink-300 font-normal">— {selectedColor}</span>}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {dbColorVariants.map(v => (
                      <VariantCard
                        key={v.id}
                        id={v.id}
                        name={v.variant_value}
                        image={v.image_url || product.image}
                        selected={selectedColor === v.variant_value}
                        onClick={() => setSelectedColor(v.variant_value)}
                      />
                    ))}
                  </div>
                </div>
              ) : product.colors && product.colors.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Select Color <span className="text-pink-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={optionBtn(selectedColor === color)}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ── Sleeve options (hoodies) ── */}
              {sleeveOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Sleeve Options <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {sleeveOptions.map(option => {
                      const id    = getOptionId(option);
                      const name  = getOptionName(option);
                      const image = getOptionImage(option, '/assets/hoodie2.jpeg');
                      return (
                        <VariantCard key={id} id={id} name={name} image={image}
                          selected={selectedSleeve === id} onClick={() => setSelectedSleeve(id)} />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Pocket / type options (hoodies) ── */}
              {typeOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Style Options <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {typeOptions.map(option => {
                      const id    = getOptionId(option);
                      const name  = getOptionName(option);
                      const image = getOptionImage(option, '/assets/hoodiepocket.jpg');
                      return (
                        <VariantCard key={id} id={id} name={name} image={image}
                          selected={selectedType === id} onClick={() => setSelectedType(id)} />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Neck style (t-shirts) ── */}
              {neckOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/70">
                    Neck Style <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {neckOptions.map(option => (
                      <VariantCard key={option.id} id={option.id} name={option.name} image={option.image}
                        selected={selectedNeck === option.id} onClick={() => setSelectedNeck(option.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Upload design ── */}
              <div>
                <label className="block text-sm font-semibold mb-2.5 text-white/70">
                  Upload Custom Design <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <input type="file" id="design-upload" accept="image/*,.pdf,.ai,.psd" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="design-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-dashed border-white/25 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-pink-400/50 transition-all duration-200 text-white/60 hover:text-white/80">
                  <Upload size={18} className="text-pink-400" />
                  <span className="text-sm">{customDesign || 'Click to upload your design'}</span>
                </label>
              </div>

              {/* ── Quantity ── */}
              <div>
                <label className="block text-sm font-semibold mb-2.5 text-white/70">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all duration-200 flex items-center justify-center font-bold text-lg">
                    −
                  </button>
                  <span className="text-xl font-bold text-white w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all duration-200 flex items-center justify-center font-bold text-lg">
                    +
                  </button>
                </div>
              </div>

              {/* ── CTA ── */}
              <div className="flex gap-3 pt-1">
                <button onClick={handleAddToCart} disabled={!canAddToCart()}
                  className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 ${
                    canAddToCart()
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-[1.02] hover:brightness-110 shadow-lg shadow-pink-500/25'
                      : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                  }`}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={handleWishlistToggle}
                  className="px-5 py-3.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105">
                  <Heart size={20} className={inWishlist ? 'fill-red-400 text-red-400' : 'text-white/70'} />
                </button>
              </div>

              {!canAddToCart() && (
                <p className="text-sm text-pink-400/80">Please select all required options to continue</p>
              )}
            </div>
          </div>

          {/* ── Related products ── */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-5">
                You may also like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedProducts.map(related => (
                  <button key={related.id} className="text-left group"
                    onClick={() => { onSelectProduct ? onSelectProduct(related) : addToRecentlyViewed(related); }}>
                    <div className="overflow-hidden rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:-translate-y-1">
                      <img src={related.image} alt={related.name}
                        className="h-28 w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                    <p className="text-xs font-medium mt-2 line-clamp-2 text-white/70 group-hover:text-white transition-colors">{related.name}</p>
                    <p className="text-xs font-bold text-pink-400 mt-0.5">INR {related.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
