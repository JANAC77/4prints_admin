import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Table, TableHead, TableRow, TableCell } from '../components/common/Table.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { ImageUploader } from '../components/common/ImageUploader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { categoryApi } from '../api/category.api.js';
import { mockCategories } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, slugify, truncate } from '../utils/formatters.js';

export function CategoriesPage({ onSelectCategoryForSubcategories }) {
  const { isDemoMode } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    imageFile: null,
  });

  const loadCategories = async () => {
    setLoading(true);
    if (isDemoMode) {
      setCategories(mockCategories);
      setLoading(false);
      return;
    }

    try {
      const res = await categoryApi.list({
        search: searchQuery || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 'true' : 'false',
      });
      if (res.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      } else {
        setCategories(mockCategories);
      }
    } catch (err) {
      console.warn('Fallback to mock categories:', err);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [isDemoMode, statusFilter]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? cat.isActive !== false
            : cat.isActive === false;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      imageFile: null,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive !== false,
      imageFile: null,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleOpenPreview = (category) => {
    setSelectedCategory(category);
    setIsPreviewOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Category description is required by the backend');
      return;
    }
    if (!formData.imageFile) {
      toast.error('Category image file is required for upload to Cloudflare R2');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        const newCat = {
          _id: `cat_${Date.now()}`,
          name: formData.name,
          slug: slugify(formData.name),
          description: formData.description,
          isActive: formData.isActive,
          image: formData.imageFile
            ? URL.createObjectURL(formData.imageFile)
            : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCategories((prev) => [newCat, ...prev]);
        toast.success(`Category "${formData.name}" created successfully`);
      } else {
        await categoryApi.create(formData);
        toast.success(`Category "${formData.name}" created!`);
        await loadCategories();
      }
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === selectedCategory._id
              ? {
                ...c,
                name: formData.name,
                slug: slugify(formData.name),
                description: formData.description,
                isActive: formData.isActive,
                image: formData.imageFile
                  ? URL.createObjectURL(formData.imageFile)
                  : c.image,
                updatedAt: new Date().toISOString(),
              }
              : c
          )
        );
        toast.success(`Category updated successfully`);
      } else {
        await categoryApi.update(selectedCategory._id, formData);
        toast.success(`Category updated!`);
        await loadCategories();
      }
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setCategories((prev) => prev.filter((c) => c._id !== selectedCategory._id));
        toast.success(`Category "${selectedCategory.name}" deleted`);
      } else {
        await categoryApi.delete(selectedCategory._id);
        toast.success(`Category and related subcategories deleted`);
        await loadCategories();
      }
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            Category Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize main product lines and storefront hierarchies
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate} size="md">
          Create Category
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search categories by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:inline">
            Status:
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['all', 'active', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === st
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No Categories Found"
          description="Try modifying your search filter or create a new category."
          actionLabel="Create Category"
          onAction={handleOpenCreate}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Category</TableCell>
              <TableCell isHeader>Slug</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Created Date</TableCell>
              <TableCell isHeader className="text-right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredCategories.map((cat) => (
              <TableRow key={cat._id || cat.slug}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80'}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1">
                        {cat.description || 'No description provided'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                    /{cat.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={cat.isActive !== false ? 'success' : 'default'} size="sm">
                    {cat.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(cat.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleOpenPreview(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Category"
        description="Add a top-level category to the 4Prints catalog."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-category-form"
              isLoading={isSubmitting}
            >
              Save Category
            </Button>
          </>
        }
      >
        <form
          id="create-category-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            placeholder="e.g. Business Cards & Stationery"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText={
              formData.name
                ? `Generated URL slug: /${slugify(formData.name)}`
                : 'URL slug will be generated automatically'
            }
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Brief summary of this category for customer browsing..."
              className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <ImageUploader
            label="Category Cover Image *"
            helperText="PNG, JPG, WEBP up to 5MB (Required for R2 Cloud Storage)"
            onFileSelect={(file) => setFormData({ ...formData, imageFile: file })}
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Storefront Visibility
              </span>
              <span className="text-xs text-slate-500">
                Make this category publicly visible immediately
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </form>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
        description="Update details, banner image, or visibility."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-category-form"
              isLoading={isSubmitting}
            >
              Update Category
            </Button>
          </>
        }
      >
        <form
          id="edit-category-form"
          onSubmit={handleEditSubmit}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText={`Slug: /${slugify(formData.name)}`}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <ImageUploader
            label="Replace Category Image (Optional)"
            initialUrl={selectedCategory?.image}
            onFileSelect={(file) => setFormData({ ...formData, imageFile: file })}
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Active in Catalog
              </span>
              <span className="text-xs text-slate-500">
                Control storefront availability
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category?"
        description="This action cannot be undone."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSubmit}
              isLoading={isSubmitting}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              "{selectedCategory?.name}"
            </strong>
            ?
          </p>
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ⚠️ <strong>Warning:</strong> Deleting this category will cascade and remove all associated subcategories and Cloudflare R2 images from the database.
          </div>
        </div>
      </Modal>

      {/* PREVIEW DETAILS MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={selectedCategory?.name || 'Category Preview'}
        description={`Slug: /${selectedCategory?.slug}`}
        footer={
          <Button onClick={() => setIsPreviewOpen(false)} size="sm">
            Close Preview
          </Button>
        }
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={selectedCategory.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'}
                alt={selectedCategory.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Status</span>
                <Badge variant={selectedCategory.isActive !== false ? 'success' : 'default'}>
                  {selectedCategory.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Created At</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedCategory.createdAt)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Description</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCategory.description || 'No description provided for this category.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
