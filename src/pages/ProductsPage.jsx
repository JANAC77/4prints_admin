import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  Star,
  Flame,
  Award,
  DollarSign,
  Grid,
  List,
  Upload,
  UploadCloud,
  X,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Sliders,
  Info,
} from 'lucide-react';
import { Table, TableHead, TableRow, TableCell } from '../components/common/Table.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { productApi } from '../api/product.api.js';
import { categoryApi } from '../api/category.api.js';
import { subcategoryApi } from '../api/subcategory.api.js';
import { mockProducts, mockCategories, mockSubcategories } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, slugify, truncate, getDisplayImageUrl } from '../utils/formatters.js';

const VARIANT_TYPES = [
  { value: 'dropdown', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Pills' },
  { value: 'button', label: 'Option Buttons' },
  { value: 'color', label: 'Color Swatches' },
  { value: 'image', label: 'Image Swatches' },
  { value: 'checkbox', label: 'Checkbox Multi' },
  { value: 'text', label: 'Custom Text' },
  { value: 'number', label: 'Numeric Input' },
  { value: 'date', label: 'Date Picker' },
];

const PRESET_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80', alt: 'Visiting Cards Stack' },
  { url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80', alt: 'Gold Foil Stamped Cards' },
  { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', alt: 'Custom Cotton T-Shirt' },
  { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80', alt: 'Vinyl Die Cut Stickers' },
  { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80', alt: 'Tri-Fold Marketing Brochure' },
  { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', alt: 'Vinyl Banner Signage' },
];

export function ProductsPage({ initialCategoryId = null, initialSubcategoryId = null }) {
  const { isDemoMode } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(initialCategoryId || 'all');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState(initialSubcategoryId || 'all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'featured' | 'bestSeller' | 'newArrival'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick subcategory creation state
  const [isQuickAddSubOpen, setIsQuickAddSubOpen] = useState(false);
  const [quickSubName, setQuickSubName] = useState('');
  const [isQuickSubLoading, setIsQuickSubLoading] = useState(false);

  // Form Tab State
  const [activeFormTab, setActiveFormTab] = useState('basics'); // 'basics' | 'media' | 'pricing' | 'variants' | 'specs'

  // Initial Form Data Template
  const defaultFormData = {
    name: '',
    sku: '',
    category: '',
    subCategory: '',
    shortDescription: '',
    description: '',
    minimumOrder: 100,
    allowDesignUpload: true,
    designInstructions: 'Upload vector PDF or high-res 300 DPI design with 2mm bleed.',
    images: [{ url: PRESET_IMAGES[0].url, alt: 'Primary Product Image' }],
    highlights: ['Premium quality materials', 'High definition 2400 DPI printing', 'Fast turnaround time'],
    pricing: [
      { quantity: 100, price: 499, discount: 0 },
      { quantity: 250, price: 999, discount: 20 },
      { quantity: 500, price: 1699, discount: 32 },
    ],
    variants: [
      {
        name: 'Paper Finish',
        type: 'radio',
        values: [
          { label: 'Matte Finish', value: 'matte' },
          { label: 'Glossy Finish', value: 'gloss' },
        ],
      },
    ],
    specifications: [
      { title: 'Material', value: '350 GSM Cardstock' },
      { title: 'Dimensions', value: 'Standard 89mm x 51mm' },
      { title: 'Production Time', value: '2-3 Business Days' },
    ],
    faqs: [
      {
        question: 'What format should my artwork be?',
        answer: 'We accept PDF, AI, PSD, and high-resolution PNG or TIFF files.',
      },
    ],
    tags: 'printing, custom, promo',
    metaTitle: '',
    metaDescription: '',
    keywords: 'printing, custom print',
    status: {
      active: true,
      featured: false,
      bestSeller: false,
      newArrival: true,
    },
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  // Image Upload State
  const [imageUploadMethod, setImageUploadMethod] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const fileInputRef = React.useRef(null);

  // Compress & optimize image file before converting to data URL (prevents exceeding Fastify bodyLimit)
  const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(readerEvent.target.result);
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload (uploads directly to Cloudflare R2 bucket like Categories)
  const handleImageFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const validImages = fileList.filter((f) => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, JPEG, WEBP, GIF, SVG)');
      return;
    }

    setIsProcessingImages(true);
    try {
      const processed = await Promise.all(
        validImages.map(async (file) => {
          const dataUrl = await compressImageFile(file);
          if (!dataUrl) return null;

          const altText =
            file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || formData.name || 'Product Image';

          // Upload directly to Cloudflare R2 Storage (4printdev bucket)
          try {
            const uploadRes = await fetch('/api/upload-r2', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                contentType: file.type || 'image/jpeg',
                base64: dataUrl,
                folder: 'products',
              }),
            });

            if (uploadRes.ok) {
              const r2Data = await uploadRes.json();
              if (r2Data?.success && r2Data?.url) {
                return {
                  url: r2Data.url,
                  alt: altText,
                  isR2: true,
                };
              }
            }
          } catch (r2Err) {
            console.warn('R2 upload network error, falling back to data URL:', r2Err);
          }

          // Fallback if R2 service is offline or in mock demo mode
          return {
            url: dataUrl,
            alt: altText,
            isR2: false,
          };
        })
      );

      const successful = processed.filter(Boolean);
      if (successful.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...successful],
        }));
        const r2Count = successful.filter((s) => s.isR2).length;
        if (r2Count > 0) {
          toast.success(`Uploaded ${r2Count} image(s) to Cloudflare R2 Storage!`);
        } else {
          toast.success(`Added ${successful.length} product image(s)`);
        }
      } else {
        toast.error('Could not process selected image files');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Error uploading image files');
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Load Subcategories for a given category on demand
  const loadSubcategoriesForCategory = async (catId) => {
    if (!catId || isDemoMode) return;
    try {
      const res = await subcategoryApi.list({ categoryId: catId });
      const subs =
        (Array.isArray(res?.subcategories) && res.subcategories) ||
        (Array.isArray(res?.data?.subcategories) && res.data.subcategories) ||
        (Array.isArray(res?.subCategories) && res.subCategories) ||
        (Array.isArray(res?.data) && res.data) ||
        (Array.isArray(res) && res) ||
        [];

      if (subs.length > 0) {
        setSubcategories((prev) => {
          const map = new Map(prev.map((item) => [String(item._id || item.id || item.slug), item]));
          subs.forEach((s) => {
            const id = String(s._id || s.id || s.slug);
            map.set(id, { ...s, categoryId: s.categoryId || catId });
          });
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.warn('Could not load subcategories for category:', catId, e);
    }
  };

  // Load Categories & Subcategories
  useEffect(() => {
    async function loadMeta() {
      if (isDemoMode) {
        setCategories(mockCategories);
        setSubcategories(mockSubcategories);
        return;
      }
      try {
        const catRes = await categoryApi.list();
        const cats =
          (Array.isArray(catRes?.categories) && catRes.categories) ||
          (Array.isArray(catRes?.data?.categories) && catRes.data.categories) ||
          (Array.isArray(catRes?.data) && catRes.data) ||
          (Array.isArray(catRes) && catRes) ||
          mockCategories;

        setCategories(cats);

        // Fetch subcategories for each category individually because Fastify backend requires categoryId
        if (cats.length > 0) {
          const subResults = await Promise.allSettled(
            cats.map((c) => subcategoryApi.list({ categoryId: c._id || c.id }))
          );

          const allSubs = [];
          subResults.forEach((res, idx) => {
            if (res.status === 'fulfilled') {
              const val = res.value;
              const subs =
                (Array.isArray(val?.subcategories) && val.subcategories) ||
                (Array.isArray(val?.data?.subcategories) && val.data.subcategories) ||
                (Array.isArray(val?.subCategories) && val.subCategories) ||
                (Array.isArray(val?.data?.subCategories) && val.data.subCategories) ||
                (Array.isArray(val?.data) && val.data) ||
                (Array.isArray(val) && val) ||
                [];
              subs.forEach((s) => {
                allSubs.push({
                  ...s,
                  categoryId: s.categoryId || cats[idx]._id,
                });
              });
            }
          });

          if (allSubs.length > 0) {
            setSubcategories(allSubs);
          } else {
            setSubcategories(mockSubcategories);
          }
        } else {
          setSubcategories(mockSubcategories);
        }
      } catch (err) {
        console.warn('Fallback to mock categories & subcategories:', err);
        setCategories(mockCategories);
        setSubcategories(mockSubcategories);
      }
    }
    loadMeta();
  }, [isDemoMode]);

  // Load Products
  const loadProducts = async () => {
    setLoading(true);
    if (isDemoMode) {
      setProducts(mockProducts);
      setLoading(false);
      return;
    }

    try {
      const params = {
        category: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined,
        subCategory: selectedSubcategoryFilter !== 'all' ? selectedSubcategoryFilter : undefined,
      };

      if (statusFilter === 'active') params.active = true;
      if (statusFilter === 'inactive') params.active = false;
      if (statusFilter === 'featured') params.featured = true;
      if (statusFilter === 'bestSeller') params.bestSeller = true;
      if (statusFilter === 'newArrival') params.newArrival = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await productApi.list(params);
      if (res.success && Array.isArray(res.products)) {
        setProducts(res.products);
      } else {
        setProducts(mockProducts);
      }
    } catch (err) {
      console.warn('Fallback to mock products:', err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [isDemoMode, selectedCategoryFilter, selectedSubcategoryFilter, statusFilter]);

  // Filtered Products for client-side responsive search
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name?.toLowerCase().includes(q) ||
        prod.sku?.toLowerCase().includes(q) ||
        prod.shortDescription?.toLowerCase().includes(q) ||
        prod.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategoryFilter === 'all' || prod.category === selectedCategoryFilter;

      const matchesSub =
        selectedSubcategoryFilter === 'all' || prod.subCategory === selectedSubcategoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && prod.status?.active !== false) ||
        (statusFilter === 'inactive' && prod.status?.active === false) ||
        (statusFilter === 'featured' && prod.status?.featured) ||
        (statusFilter === 'bestSeller' && prod.status?.bestSeller) ||
        (statusFilter === 'newArrival' && prod.status?.newArrival);

      return matchesSearch && matchesCat && matchesSub && matchesStatus;
    });
  }, [products, searchQuery, selectedCategoryFilter, selectedSubcategoryFilter, statusFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status?.active !== false).length;
    const featured = products.filter((p) => p.status?.featured).length;
    const bestSellers = products.filter((p) => p.status?.bestSeller).length;
    return { total, active, featured, bestSellers };
  }, [products]);

  // Subcategories partitioned for current category selection in Form
  const { categorySubcategories, otherSubcategories } = useMemo(() => {
    if (!formData.category) {
      return { categorySubcategories: [], otherSubcategories: subcategories };
    }
    const targetCatId = String(formData.category).trim();
    const matchedCategory = categories.find(
      (c) => String(c._id).trim() === targetCatId || String(c.slug).trim() === targetCatId
    );

    const matching = [];
    const others = [];

    subcategories.forEach((s) => {
      const sCatId = String(s.categoryId || s.category?._id || s.category || '').trim();
      const isMatch =
        sCatId === targetCatId ||
        (matchedCategory &&
          (sCatId === String(matchedCategory._id).trim() ||
            sCatId === String(matchedCategory.slug).trim()));

      if (isMatch) {
        matching.push(s);
      } else {
        others.push(s);
      }
    });

    return { categorySubcategories: matching, otherSubcategories: others };
  }, [subcategories, categories, formData.category]);

  const availableSubcategoriesForForm = categorySubcategories;

  // Subcategories filtered for the main table filter bar
  const availableSubcategoriesForFilter = useMemo(() => {
    if (!selectedCategoryFilter || selectedCategoryFilter === 'all') {
      return subcategories;
    }
    const targetCatId = String(selectedCategoryFilter).trim();
    const matchedCategory = categories.find(
      (c) => String(c._id).trim() === targetCatId || String(c.slug).trim() === targetCatId
    );

    return subcategories.filter((s) => {
      const sCatId = String(s.categoryId || s.category?._id || s.category || '').trim();
      if (!sCatId) return false;
      if (sCatId === targetCatId) return true;
      if (matchedCategory) {
        if (sCatId === String(matchedCategory._id).trim()) return true;
        if (sCatId === String(matchedCategory.slug).trim()) return true;
      }
      return false;
    });
  }, [subcategories, categories, selectedCategoryFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const firstCat = categories[0]?._id || '';
    if (firstCat) {
      loadSubcategoriesForCategory(firstCat);
    }
    const matchingSubs = subcategories.filter((s) => {
      const sCatId = String(s.categoryId || s.category?._id || s.category || '').trim();
      return sCatId === String(firstCat).trim();
    });
    const firstSub = matchingSubs[0]?._id || '';

    setFormData({
      ...defaultFormData,
      category: firstCat,
      subCategory: firstSub,
      sku: `PRD-${Date.now().toString().slice(-5)}`,
    });
    setIsEditing(false);
    setEditingId(null);
    setActiveFormTab('basics');
    setIsQuickAddSubOpen(false);
    setQuickSubName('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    if (product.category) {
      loadSubcategoriesForCategory(product.category);
    }
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      minimumOrder: product.minimumOrder || 1,
      allowDesignUpload: Boolean(product.allowDesignUpload),
      designInstructions: product.designInstructions || '',
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [{ url: PRESET_IMAGES[0].url, alt: product.name }],
      highlights: product.highlights || [],
      pricing: product.pricing?.length ? product.pricing : [{ quantity: 100, price: 499, discount: 0 }],
      variants: product.variants || [],
      specifications: product.specifications || [],
      faqs: product.faqs || [],
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      keywords: Array.isArray(product.keywords) ? product.keywords.join(', ') : '',
      status: {
        active: product.status?.active ?? true,
        featured: product.status?.featured ?? false,
        bestSeller: product.status?.bestSeller ?? false,
        newArrival: product.status?.newArrival ?? false,
      },
    });
    setIsEditing(true);
    setEditingId(product._id);
    setActiveFormTab('basics');
    setIsFormOpen(true);
  };

  // Quick Status Flag Toggle
  const handleToggleStatus = async (product, key) => {
    const currentVal = Boolean(product.status?.[key]);
    const nextVal = !currentVal;

    // Optimistic Update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id
          ? {
            ...p,
            status: {
              ...(p.status || {}),
              [key]: nextVal,
            },
          }
          : p
      )
    );

    if (isDemoMode) {
      toast.success(`Updated ${key} status to ${nextVal ? 'ON' : 'OFF'} (Demo Mode)`);
      return;
    }

    try {
      await productApi.updateStatus(product._id, { [key]: nextVal });
      toast.success(`Updated ${key} status`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
      loadProducts();
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      setActiveFormTab('basics');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('Product SKU is required');
      setActiveFormTab('basics');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      setActiveFormTab('basics');
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Short description is required');
      setActiveFormTab('basics');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Full description is required');
      setActiveFormTab('basics');
      return;
    }
    if (!formData.pricing || formData.pricing.length === 0) {
      toast.error('At least one pricing tier is required');
      setActiveFormTab('pricing');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      minimumOrder: Number(formData.minimumOrder) || 1,
      allowDesignUpload: Boolean(formData.allowDesignUpload),
      designInstructions: formData.designInstructions?.trim() || undefined,
      images: formData.images.filter((img) => img.url?.trim()),
      highlights: formData.highlights.filter((h) => h?.trim()),
      pricing: formData.pricing.map((tier) => ({
        quantity: Math.max(1, Number(tier.quantity)),
        price: Math.max(0, Number(tier.price)),
        discount: Math.min(100, Math.max(0, Number(tier.discount) || 0)),
      })),
      variants: formData.variants,
      specifications: formData.specifications.filter((s) => s.title?.trim() && s.value?.trim()),
      faqs: formData.faqs.filter((f) => f.question?.trim() && f.answer?.trim()),
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      metaTitle: formData.metaTitle?.trim() || undefined,
      metaDescription: formData.metaDescription?.trim() || undefined,
      keywords: formData.keywords
        ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
      status: formData.status,
    };

    if (isDemoMode) {
      setTimeout(() => {
        if (isEditing) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingId ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p))
          );
          toast.success('Product updated successfully (Demo Mode)');
        } else {
          const newDoc = {
            ...payload,
            _id: `prod_${Date.now()}`,
            slug: slugify(payload.name),
            rating: { average: 5, totalReviews: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProducts((prev) => [newDoc, ...prev]);
          toast.success('Product created successfully (Demo Mode)');
        }
        setIsSubmitting(false);
        setIsFormOpen(false);
      }, 500);
      return;
    }

    try {
      if (isEditing) {
        const res = await productApi.update(editingId, payload);
        if (res.success) {
          toast.success('Product updated successfully!');
          loadProducts();
          setIsFormOpen(false);
        }
      } else {
        const res = await productApi.create(payload);
        if (res.success) {
          toast.success('Product created successfully!');
          loadProducts();
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed. Check SKU uniqueness or network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    if (isDemoMode) {
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
      toast.success(`Deleted "${selectedProduct.name}" (Demo Mode)`);
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      setIsSubmitting(false);
      return;
    }

    try {
      await productApi.delete(selectedProduct._id);
      toast.success(`Product "${selectedProduct.name}" deleted`);
      loadProducts();
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick inline creation of subcategory right from product modal
  const handleQuickCreateSub = async () => {
    if (!quickSubName.trim()) {
      toast.error('Please enter a subcategory name');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a parent category first');
      return;
    }

    setIsQuickSubLoading(true);
    try {
      if (isDemoMode) {
        const newSub = {
          _id: `sub_${Date.now()}`,
          categoryId: formData.category,
          name: quickSubName.trim(),
          slug: slugify(quickSubName),
          description: quickSubName.trim(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSubcategories((prev) => [newSub, ...prev]);
        setFormData((prev) => ({ ...prev, subCategory: newSub._id }));
        toast.success(`Created subcategory "${newSub.name}"`);
        setQuickSubName('');
        setIsQuickAddSubOpen(false);
      } else {
        const res = await subcategoryApi.create({
          categoryId: formData.category,
          name: quickSubName.trim(),
          description: quickSubName.trim(),
          isActive: true,
        });

        const created = res.subcategory || res.data?.subcategory;
        if (created) {
          const formatted = {
            ...created,
            categoryId: created.categoryId || formData.category,
          };
          setSubcategories((prev) => [formatted, ...prev]);
          setFormData((prev) => ({ ...prev, subCategory: created._id }));
          toast.success(`Created & linked subcategory "${created.name}"`);
        } else {
          await loadSubcategoriesForCategory(formData.category);
          toast.success(`Created subcategory "${quickSubName.trim()}"`);
        }
        setQuickSubName('');
        setIsQuickAddSubOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create subcategory');
    } finally {
      setIsQuickSubLoading(false);
    }
  };

  // Helpers for category and subcategory names
  const getCategoryName = (catId) => {
    if (!catId) return 'Uncategorized';
    const target = String(catId).trim();
    const cat = categories.find(
      (c) => String(c._id).trim() === target || String(c.slug).trim() === target
    );
    return cat?.name || catId || 'Uncategorized';
  };

  const getSubcategoryName = (subId) => {
    if (!subId) return '—';
    const target = String(subId).trim();
    const sub = subcategories.find(
      (s) => String(s._id).trim() === target || String(s.slug).trim() === target
    );
    return sub?.name || subId || '—';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-[#FFD40C]" />
              Products Catalog
            </h1>
            <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:bg-[#FFD40C]/20 dark:text-[#FFD40C] border border-amber-500/30">
              {filteredProducts.length} Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure printing products, tier pricing, custom specifications, variants, and stock rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#FFD40C] text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#FFD40C] text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="Grid Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
            className="shadow-lg shadow-amber-500/20"
          >
            Create Product
          </Button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Storefront</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.active}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Featured Items</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.featured}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Best Sellers</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.bestSellers}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, tags or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => {
              setSelectedCategoryFilter(e.target.value);
              setSelectedSubcategoryFilter('all');
            }}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedSubcategoryFilter}
            onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Subcategories</option>
            {availableSubcategoriesForFilter.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="bestSeller">Best Sellers</option>
            <option value="newArrival">New Arrivals</option>
          </select>
        </div>

        {(searchQuery || selectedCategoryFilter !== 'all' || selectedSubcategoryFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('all');
              setSelectedSubcategoryFilter('all');
              setStatusFilter('all');
            }}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            searchQuery || selectedCategoryFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Add your first printing product to make it available to clients.'
          }
          actionLabel="Add New Product"
          onAction={handleOpenCreate}
          icon={Package}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell isHeader>Product / Details</TableCell>
                <TableCell isHeader>Category & Subcategory</TableCell>
                <TableCell isHeader>Pricing & MOQ</TableCell>
                <TableCell isHeader>Status Flags (Click to Toggle)</TableCell>
                <TableCell isHeader className="text-right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <tbody>
              {filteredProducts.map((product) => {
                const primaryImage = getDisplayImageUrl(
                  product.images?.[0]?.url,
                  'https://placehold.co/120x120/1e293b/f8fafc?text=Print'
                );

                const lowestPrice = product.pricing?.reduce(
                  (min, p) => (p.price < min ? p.price : min),
                  product.pricing[0]?.price || 0
                );

                return (
                  <TableRow key={product._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Column 1: Image & Name */}
                    <TableCell>
                      <div className="flex items-center space-x-3.5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 group">
                          <img
                            src={primaryImage}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/120x120/1e293b/f8fafc?text=Print';
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {product.images?.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-bold text-white px-1 rounded">
                              +{product.images.length - 1}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-500 dark:hover:text-[#FFD40C] transition-colors truncate">
                              {product.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              {product.sku}
                            </code>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {product.shortDescription || truncate(product.description, 45)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Category & Subcategory */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="primary" size="sm">
                          {getCategoryName(product.category)}
                        </Badge>
                        {product.subCategory && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <span className="text-slate-400 dark:text-slate-600">↳</span>
                            <span>{getSubcategoryName(product.subCategory)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Column 3: Pricing & MOQ */}
                    <TableCell>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <span className="text-amber-600 dark:text-[#FFD40C] font-black">₹{lowestPrice}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                            (Starting Tier)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          MOQ: <span className="font-semibold text-slate-800 dark:text-slate-200">{product.minimumOrder || 1} units</span>
                          {product.pricing?.length > 1 && (
                            <span className="text-slate-400 dark:text-slate-500"> • {product.pricing.length} tiers</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 4: Quick Status Flags Toggle */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggleStatus(product, 'active')}
                          title="Toggle Active on Storefront"
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${product.status?.active !== false
                            ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          ● {product.status?.active !== false ? 'Active' : 'Draft'}
                        </button>

                        {/* Featured Toggle */}
                        <button
                          onClick={() => handleToggleStatus(product, 'featured')}
                          title="Toggle Featured badge"
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${product.status?.featured
                            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 border-slate-200 dark:border-slate-700/80'
                            }`}
                        >
                          <Star className="w-2.5 h-2.5" />
                          Featured
                        </button>

                        {/* Best Seller Toggle */}
                        <button
                          onClick={() => handleToggleStatus(product, 'bestSeller')}
                          title="Toggle Best Seller badge"
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${product.status?.bestSeller
                            ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 border-slate-200 dark:border-slate-700/80'
                            }`}
                        >
                          <Flame className="w-2.5 h-2.5" />
                          Best Seller
                        </button>
                      </div>
                    </TableCell>

                    {/* Column 5: Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Full Specifications & Pricing Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const primaryImage = getDisplayImageUrl(
              product.images?.[0]?.url,
              'https://placehold.co/400x300/1e293b/f8fafc?text=Print'
            );
            const lowestPrice = product.pricing?.reduce(
              (min, p) => (p.price < min ? p.price : min),
              product.pricing[0]?.price || 0
            );

            return (
              <div
                key={product._id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Status Badges */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/1e293b/f8fafc?text=Print';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {product.status?.active === false && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
                          Draft
                        </span>
                      )}
                      {product.status?.featured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 shadow">
                          ★ Featured
                        </span>
                      )}
                      {product.status?.bestSeller && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white shadow">
                          🔥 Best Seller
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-black/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-700">
                      <span className="text-xs font-black text-[#FFD40C]">₹{lowestPrice}</span>
                      <span className="text-[10px] text-slate-300 font-normal"> /start</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="primary" size="sm">
                        {getCategoryName(product.category)}
                      </Badge>
                      <code className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-400/20 font-bold">
                        {product.sku}
                      </code>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-[#FFD40C] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {product.shortDescription || product.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>MOQ: <strong className="text-slate-800 dark:text-slate-200">{product.minimumOrder || 1}</strong></span>
                      <span>{product.pricing?.length || 1} Tier Prices</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsPreviewOpen(true);
                    }}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    Preview
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE & EDIT PRODUCT MODAL (HIGH-GRADE MULTI-TAB ARCHITECTURE)           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={isEditing ? `Edit Product: ${formData.name}` : 'Create New Print Product'}
        size="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              * Required: Name, SKU, Category, Descriptions.
            </span>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-edit-form"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                {isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </div>
        }
      >
        <form id="product-edit-form" onSubmit={handleSubmitForm} className="space-y-5">
          {/* Tabs Navigation */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFormTab('basics')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeFormTab === 'basics'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              1. Basics & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('media')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFormTab === 'media'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              2. Media & Images
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                {formData.images.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('pricing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFormTab === 'pricing'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              3. Tiered Pricing & MOQ
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                {formData.pricing.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('variants')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFormTab === 'variants'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              4. Variants
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                {formData.variants.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('specs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeFormTab === 'specs'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              5. Specs, FAQs & SEO
            </button>
          </div>

          {/* TAB 1: BASICS */}
          {activeFormTab === 'basics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Title"
                  placeholder="e.g. Premium Silk Laminated Business Cards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Unique SKU Code"
                  placeholder="e.g. BC-SILK-400"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  required
                  helperText="Must be unique in store catalog"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: newCatId,
                        subCategory: '',
                      }));
                      if (newCatId) {
                        loadSubcategoriesForCategory(newCatId);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Subcategory (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddSubOpen(!isQuickAddSubOpen)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      {isQuickAddSubOpen ? '× Cancel' : '+ Add New for ' + getCategoryName(formData.category)}
                    </button>
                  </div>

                  {/* Inline Quick Add Subcategory */}
                  {isQuickAddSubOpen && (
                    <div className="p-2.5 mb-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-amber-400/40 flex gap-2 animate-fade-in shadow-sm">
                      <input
                        type="text"
                        placeholder={`Subcategory name under ${getCategoryName(formData.category)}...`}
                        value={quickSubName}
                        onChange={(e) => setQuickSubName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickCreateSub();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={isQuickSubLoading}
                        onClick={handleQuickCreateSub}
                      >
                        Create
                      </Button>
                    </div>
                  )}

                  <select
                    value={formData.subCategory || ''}
                    onChange={(e) => {
                      const selectedSubId = e.target.value;
                      if (!selectedSubId) {
                        setFormData((prev) => ({ ...prev, subCategory: '' }));
                        return;
                      }
                      const chosenSub = subcategories.find(
                        (s) =>
                          String(s._id) === String(selectedSubId) ||
                          String(s.slug) === String(selectedSubId)
                      );
                      if (chosenSub) {
                        const parentCatId =
                          chosenSub.categoryId ||
                          chosenSub.category?._id ||
                          chosenSub.category;
                        if (
                          parentCatId &&
                          String(parentCatId) !== String(formData.category)
                        ) {
                          const parentName = getCategoryName(parentCatId);
                          toast.info(
                            `Linked Category updated to "${parentName}" for subcategory "${chosenSub.name}"`
                          );
                          setFormData((prev) => ({
                            ...prev,
                            category: parentCatId,
                            subCategory: chosenSub._id || selectedSubId,
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            subCategory: chosenSub._id || selectedSubId,
                          }));
                        }
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          subCategory: selectedSubId,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    <option value="">None / Primary Category Only</option>

                    {/* Subcategories directly in this category */}
                    {categorySubcategories.length > 0 && (
                      <optgroup label={`Subcategories in "${getCategoryName(formData.category)}"`}>
                        {categorySubcategories.map((s) => (
                          <option key={s._id} value={s._id}>
                            ✓ {s.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* All other available subcategories in the catalog */}
                    {otherSubcategories.length > 0 && (
                      <optgroup
                        label={
                          categorySubcategories.length > 0
                            ? 'Other Store Subcategories (Auto-links Category)'
                            : 'All Available Subcategories in Catalog (Select to link)'
                        }
                      >
                        {otherSubcategories.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({getCategoryName(s.categoryId)})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Short Tagline / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="One sentence description shown on store listing cards"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Detailed Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Comprehensive description covering paper stock, coatings, texture, usage guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Minimum Order Quantity (MOQ)"
                  type="number"
                  min={1}
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                  required
                />

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Customer Design Upload</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow customers to submit artwork files</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowDesignUpload}
                    onChange={(e) => setFormData({ ...formData, allowDesignUpload: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              {formData.allowDesignUpload && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Design Guidelines & Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Upload PDF/AI at 300 DPI with 2mm bleed on all sides"
                    value={formData.designInstructions}
                    onChange={(e) => setFormData({ ...formData, designInstructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              )}

              {/* Status Toggles Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Storefront Status Flags
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.status.active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, active: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-500"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Active</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.status.featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, featured: e.target.checked },
                        })
                      }
                      className="rounded text-amber-500"
                    />
                    <span className="font-semibold text-amber-600 dark:text-amber-300">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.status.bestSeller}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, bestSeller: e.target.checked },
                        })
                      }
                      className="rounded text-rose-500"
                    />
                    <span className="font-semibold text-rose-600 dark:text-rose-300">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.status.newArrival}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, newArrival: e.target.checked },
                        })
                      }
                      className="rounded text-blue-500"
                    />
                    <span className="font-semibold text-blue-600 dark:text-blue-300">New Arrival</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & IMAGES */}
          {activeFormTab === 'media' && (
            <div className="space-y-4 animate-fade-in">
              {/* Method Switcher */}
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setImageUploadMethod('upload')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${imageUploadMethod === 'upload'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900'
                    }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMethod('url')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${imageUploadMethod === 'url'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900'
                    }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMethod('presets')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${imageUploadMethod === 'presets'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>
              </div>

              {/* METHOD 1: DIRECT FILE UPLOADER (DRAG & DROP / BROWSE) */}
              {imageUploadMethod === 'upload' && (
                <div className="space-y-2 animate-fade-in">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleImageFilesUpload(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[190px] ${isDraggingFiles
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-400/10 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700/80 hover:border-amber-400 bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleImageFilesUpload(e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />

                    {isProcessingImages ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Optimizing & Uploading Images...</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compressing images for ultra-fast storefront loading</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-[#FFD40C] border border-amber-200 dark:border-amber-400/20 flex items-center justify-center mb-2">
                          <UploadCloud className="w-6 h-6 animate-bounce" />
                        </div>

                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Drag & Drop product images here, or <span className="text-amber-600 dark:text-[#FFD40C] underline">Browse files</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          PNG, JPG, WEBP, GIF, SVG • Multiple files supported
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-sm flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Files from Computer</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 2: URL INPUT */}
              {imageUploadMethod === 'url' && (
                <div className="space-y-2 animate-fade-in p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enter External Image URL</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={newImageAlt}
                      onChange={(e) => setNewImageAlt(e.target.value)}
                      className="w-40 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!newImageUrl.trim()) {
                          toast.error('Please enter an image URL');
                          return;
                        }
                        setFormData({
                          ...formData,
                          images: [
                            ...formData.images,
                            { url: newImageUrl.trim(), alt: newImageAlt.trim() || formData.name || 'Product Image' },
                          ],
                        });
                        setNewImageUrl('');
                        setNewImageAlt('');
                        toast.success('Image added');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* METHOD 3: PRESETS */}
              {imageUploadMethod === 'presets' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Select Quick Print Presets
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            images: [...formData.images, preset],
                          });
                          toast.success('Preset image added');
                        }}
                        className="group relative h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 hover:border-amber-400 transition-all"
                      >
                        <img src={preset.url} alt={preset.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                          + Add
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Image Gallery List */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Product Gallery Images ({formData.images.length})
                  </p>
                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, images: [] });
                        toast.info('Cleared gallery images');
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {formData.images.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    No images uploaded yet. Upload a photo above to display on storefront.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 group shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="relative h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                          <img
                            src={getDisplayImageUrl(img.url)}
                            alt={img.alt}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/200x200/1e293b/f8fafc?text=Image';
                            }}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950 shadow z-10">
                              Primary
                            </span>
                          )}
                          {img.url?.includes('r2.cloudflarestorage.com') && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-600/90 text-white shadow z-10 backdrop-blur-xs flex items-center gap-1">
                              R2 Cloud
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={img.alt || ''}
                          placeholder="Image caption / alt"
                          onChange={(e) => {
                            const copy = [...formData.images];
                            copy[index].alt = e.target.value;
                            setFormData({ ...formData, images: copy });
                          }}
                          className="w-full text-[10px] text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 mt-1.5 focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex items-center justify-between mt-1.5 px-1">
                          {index !== 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...formData.images];
                                const [selected] = copy.splice(index, 1);
                                copy.unshift(selected);
                                setFormData({ ...formData, images: copy });
                                toast.success('Set as primary image');
                              }}
                              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Cover photo</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== index),
                              });
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-semibold ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TIERED PRICING & MOQ */}
          {activeFormTab === 'pricing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Volume Discount Tiers</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Reward higher quantity print orders with automated volume discounts.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    const lastTier = formData.pricing[formData.pricing.length - 1];
                    const nextQty = lastTier ? lastTier.quantity * 2 : 100;
                    const nextPrice = lastTier ? Math.round(lastTier.price * 1.8) : 500;
                    setFormData({
                      ...formData,
                      pricing: [
                        ...formData.pricing,
                        { quantity: nextQty, price: nextPrice, discount: 15 },
                      ],
                    });
                  }}
                >
                  Add Pricing Tier
                </Button>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Quantity (Units)</th>
                      <th className="p-3">Total Price (₹)</th>
                      <th className="p-3">Discount (%)</th>
                      <th className="p-3">Calculated Unit Rate</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {formData.pricing.map((tier, idx) => {
                      const unitRate = tier.quantity > 0 ? (tier.price / tier.quantity).toFixed(2) : '0';
                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={1}
                              value={tier.quantity}
                              onChange={(e) => {
                                const copy = [...formData.pricing];
                                copy[idx].quantity = Number(e.target.value);
                                setFormData({ ...formData, pricing: copy });
                              }}
                              className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              value={tier.price}
                              onChange={(e) => {
                                const copy = [...formData.pricing];
                                copy[idx].price = Number(e.target.value);
                                setFormData({ ...formData, pricing: copy });
                              }}
                              className="w-28 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-amber-600 dark:text-[#FFD40C] font-black focus:outline-none focus:border-amber-400"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={tier.discount}
                              onChange={(e) => {
                                const copy = [...formData.pricing];
                                copy[idx].discount = Number(e.target.value);
                                setFormData({ ...formData, pricing: copy });
                              }}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                            />
                          </td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300 font-mono">
                            ₹{unitRate} /unit
                          </td>
                          <td className="p-2.5 text-right">
                            {formData.pricing.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    pricing: formData.pricing.filter((_, i) => i !== idx),
                                  });
                                }}
                                className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VARIANTS */}
          {activeFormTab === 'variants' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Attributes & Variants</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add customizable options like Paper Finish, Card Corners, Sizes, or Colors.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      variants: [
                        ...formData.variants,
                        {
                          name: 'Custom Option',
                          type: 'dropdown',
                          values: [
                            { label: 'Option A', value: 'opt_a' },
                            { label: 'Option B', value: 'opt_b' },
                          ],
                        },
                      ],
                    });
                  }}
                >
                  Add Variant Group
                </Button>
              </div>

              {formData.variants.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  No variant options created yet. Click "Add Variant Group" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variants.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Variant Name (e.g. Paper Finish)"
                          value={v.name}
                          onChange={(e) => {
                            const copy = [...formData.variants];
                            copy[vIdx].name = e.target.value;
                            setFormData({ ...formData, variants: copy });
                          }}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 flex-1 focus:outline-none focus:border-amber-400"
                        />
                        <select
                          value={v.type}
                          onChange={(e) => {
                            const copy = [...formData.variants];
                            copy[vIdx].type = e.target.value;
                            setFormData({ ...formData, variants: copy });
                          }}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-400"
                        >
                          {VARIANT_TYPES.map((vt) => (
                            <option key={vt.value} value={vt.value}>
                              {vt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              variants: formData.variants.filter((_, i) => i !== vIdx),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Values sub-list */}
                      <div className="space-y-1.5 pl-3 border-l-2 border-amber-400/50">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          Selectable Values / Choices
                        </p>
                        {v.values.map((val, valIdx) => (
                          <div key={valIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Label (e.g. Velvet Matte)"
                              value={val.label}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].values[valIdx].label = e.target.value;
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-slate-100 flex-1 focus:outline-none focus:border-amber-400"
                            />
                            <input
                              type="text"
                              placeholder="Internal Value (e.g. velvet)"
                              value={val.value}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].values[valIdx].value = e.target.value;
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 flex-1 focus:outline-none focus:border-amber-400"
                            />
                            {v.values.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...formData.variants];
                                  copy[vIdx].values = copy[vIdx].values.filter((_, i) => i !== valIdx);
                                  setFormData({ ...formData, variants: copy });
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...formData.variants];
                            copy[vIdx].values.push({ label: '', value: '' });
                            setFormData({ ...formData, variants: copy });
                          }}
                          className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-1 inline-flex items-center gap-1"
                        >
                          + Add Choice Value
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SPECS, FAQS & SEO */}
          {activeFormTab === 'specs' && (
            <div className="space-y-4 animate-fade-in">
              {/* Highlights */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Bullet Highlights (Key Selling Points)
                </label>
                <textarea
                  rows={3}
                  placeholder="One highlight per line (e.g. 350 GSM European cardstock)"
                  value={formData.highlights.join('\n')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      highlights: e.target.value.split('\n'),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Product Technical Specifications
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        specifications: [
                          ...formData.specifications,
                          { title: '', value: '' },
                        ],
                      });
                    }}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    + Add Spec Row
                  </button>
                </div>
                {formData.specifications.map((spec, sIdx) => (
                  <div key={sIdx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Paper Weight)"
                      value={spec.title}
                      onChange={(e) => {
                        const copy = [...formData.specifications];
                        copy[sIdx].title = e.target.value;
                        setFormData({ ...formData, specifications: copy });
                      }}
                      className="w-1/3 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 350 GSM)"
                      value={spec.value}
                      onChange={(e) => {
                        const copy = [...formData.specifications];
                        copy[sIdx].value = e.target.value;
                        setFormData({ ...formData, specifications: copy });
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          specifications: formData.specifications.filter((_, i) => i !== sIdx),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-600 dark:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tags and Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Search Tags (comma-separated)"
                  placeholder="visiting cards, matte, business"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
                <Input
                  label="Meta Keywords"
                  placeholder="print cards, custom print, 4prints"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>

              {/* SEO Meta */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  SEO & Social Sharing Preview
                </p>
                <Input
                  label="Meta Title"
                  placeholder="Custom Business Cards | 4Prints Online"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Search engine summary text..."
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* DETAILED PRODUCT PREVIEW MODAL                                            */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Product Overview: ${selectedProduct.name}`}
          size="xl"
        >
          <div className="space-y-5 animate-fade-in">
            {/* Top overview row */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-56 h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img
                  src={getDisplayImageUrl(
                    selectedProduct.images?.[0]?.url,
                    'https://placehold.co/400x300/1e293b/f8fafc?text=Preview'
                  )}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x300/1e293b/f8fafc?text=Preview';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" size="sm">
                    {getCategoryName(selectedProduct.category)}
                  </Badge>
                  {selectedProduct.subCategory && (
                    <Badge variant="blue" size="sm">
                      {getSubcategoryName(selectedProduct.subCategory)}
                    </Badge>
                  )}
                  <code className="text-xs font-mono font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-400/20">
                    {selectedProduct.sku}
                  </code>
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedProduct.name}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">{selectedProduct.shortDescription}</p>

                <div className="flex items-center gap-2 pt-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedProduct.status?.active !== false
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
                      }`}
                  >
                    {selectedProduct.status?.active !== false ? 'Live on Store' : 'Draft'}
                  </span>
                  {selectedProduct.status?.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      ★ Featured
                    </span>
                  )}
                  {selectedProduct.status?.bestSeller && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      🔥 Best Seller
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Tiers Table */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                Volume Pricing Tiers
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Total Price</th>
                      <th className="p-2.5">Effective Rate</th>
                      <th className="p-2.5">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedProduct.pricing?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{t.quantity} units</td>
                        <td className="p-2.5 font-black text-amber-600 dark:text-[#FFD40C]">₹{t.price}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">
                          ₹{(t.price / t.quantity).toFixed(2)} /unit
                        </td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          {t.discount ? `${t.discount}% OFF` : 'Base'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Specifications & Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedProduct.highlights?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Key Highlights
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                    {selectedProduct.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProduct.specifications?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Specifications
                  </p>
                  <div className="text-xs space-y-1.5 divide-y divide-slate-200/80 dark:divide-slate-800/80">
                    {selectedProduct.specifications.map((s, i) => (
                      <div key={i} className="flex justify-between pt-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{s.title}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isSubmitting && setIsDeleteOpen(false)}
        title="Confirm Product Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 dark:text-white">"{selectedProduct?.name}"</strong>?
          </p>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
            ⚠️ This will remove the product and its pricing tiers from the customer storefront.
          </div>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
