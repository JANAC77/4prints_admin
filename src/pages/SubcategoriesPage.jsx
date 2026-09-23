import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  FolderTree,
  CheckCircle2,
  XCircle,
  ExternalLink,
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
import { subcategoryApi } from '../api/subcategory.api.js';
import { mockCategories, mockSubcategories } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, slugify } from '../utils/formatters.js';

export function SubcategoriesPage({ initialCategoryId }) {
  const { isDemoMode } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || '');
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    isActive: true,
    imageFile: null,
  });

  // Load Parent Categories list
  useEffect(() => {
    async function loadCats() {
      if (isDemoMode) {
        setCategories(mockCategories);
        if (!selectedCategoryId && mockCategories.length > 0) {
          setSelectedCategoryId(mockCategories[0]._id);
        }
        return;
      }
      try {
        const res = await categoryApi.list();
        const cats = res?.categories || mockCategories;
        setCategories(cats);
        if (!selectedCategoryId && cats.length > 0) {
          setSelectedCategoryId(cats[0]._id);
        }
      } catch (err) {
        setCategories(mockCategories);
        if (!selectedCategoryId) setSelectedCategoryId(mockCategories[0]._id);
      }
    }
    loadCats();
  }, [isDemoMode]);

  // Load Subcategories for selected category
  const loadSubcategories = async () => {
    if (!selectedCategoryId) return;
    setLoading(true);

    if (isDemoMode) {
      const subs = mockSubcategories.filter((s) => s.categoryId === selectedCategoryId);
      setSubcategories(subs);
      setLoading(false);
      return;
    }

    try {
      const res = await subcategoryApi.list({
        categoryId: selectedCategoryId,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 'true' : 'false',
      });
      if (res.success && Array.isArray(res.subcategories)) {
        setSubcategories(res.subcategories);
      } else {
        const fallback = mockSubcategories.filter((s) => s.categoryId === selectedCategoryId);
        setSubcategories(fallback);
      }
    } catch (err) {
      console.warn('Fallback subcategories:', err);
      const fallback = mockSubcategories.filter((s) => s.categoryId === selectedCategoryId);
      setSubcategories(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [selectedCategoryId, isDemoMode, statusFilter]);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? sub.isActive !== false
            : sub.isActive === false;

      return matchesSearch && matchesStatus;
    });
  }, [subcategories, searchQuery, statusFilter]);

  const currentCategory = categories.find((c) => c._id === selectedCategoryId);

  const handleOpenCreate = () => {
    setFormData({
      categoryId: selectedCategoryId || (categories[0]?._id ?? ''),
      name: '',
      description: '',
      isActive: true,
      imageFile: null,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubcategory(sub);
    setFormData({
      categoryId: sub.categoryId || selectedCategoryId,
      name: sub.name || '',
      description: sub.description || '',
      isActive: sub.isActive !== false,
      imageFile: null,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (sub) => {
    setSelectedSubcategory(sub);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a parent category');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Subcategory description is required');
      return;
    }
    if (!formData.imageFile) {
      toast.error('Subcategory image file is required for upload to Cloudflare R2');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        const newSub = {
          _id: `sub_${Date.now()}`,
          categoryId: formData.categoryId,
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
        setSubcategories((prev) => [newSub, ...prev]);
        toast.success(`Subcategory "${formData.name}" created!`);
      } else {
        await subcategoryApi.create(formData);
        toast.success(`Subcategory "${formData.name}" created!`);
        await loadSubcategories();
      }
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setSubcategories((prev) =>
          prev.map((s) =>
            s._id === selectedSubcategory._id
              ? {
                ...s,
                name: formData.name,
                slug: slugify(formData.name),
                description: formData.description,
                isActive: formData.isActive,
                image: formData.imageFile
                  ? URL.createObjectURL(formData.imageFile)
                  : s.image,
                updatedAt: new Date().toISOString(),
              }
              : s
          )
        );
        toast.success(`Subcategory updated successfully`);
      } else {
        await subcategoryApi.update(selectedSubcategory._id, formData);
        toast.success(`Subcategory updated!`);
        await loadSubcategories();
      }
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSubcategory) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setSubcategories((prev) =>
          prev.filter((s) => s._id !== selectedSubcategory._id)
        );
        toast.success(`Subcategory "${selectedSubcategory.name}" deleted`);
      } else {
        await subcategoryApi.delete(selectedSubcategory._id);
        toast.success(`Subcategory deleted successfully`);
        await loadSubcategories();
      }
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete subcategory');
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
            Subcategory Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage granular product classifications linked to parent categories
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate} size="md">
          Create Subcategory
        </Button>
      </div>

      {/* Parent Category Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Parent Category Filter Dropdown */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Parent Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full rounded-xl py-2.5 px-3.5 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Search Subcategories
          </label>
          <Input
            icon={Search}
            placeholder="Search by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Status Filter
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['all', 'active', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === st
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

      {/* Subcategories Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : filteredSubcategories.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Subcategories Found"
          description={`No subcategories found under "${currentCategory?.name || 'this category'}".`}
          actionLabel="Create Subcategory"
          onAction={handleOpenCreate}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Subcategory</TableCell>
              <TableCell isHeader>Slug</TableCell>
              <TableCell isHeader>Parent Category</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader className="text-right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredSubcategories.map((sub) => (
              <TableRow key={sub._id || sub.slug}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img
                        src={sub.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80'}
                        alt={sub.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {sub.name}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1">
                        {sub.description || 'No description provided'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                    /{sub.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {currentCategory?.name || 'Parent Category'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={sub.isActive !== false ? 'success' : 'default'} size="sm">
                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Subcategory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Subcategory"
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

      {/* CREATE SUBCATEGORY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Subcategory"
        description="Add a specific product group under a parent category."
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
              form="create-subcategory-form"
              isLoading={isSubmitting}
            >
              Save Subcategory
            </Button>
          </>
        }
      >
        <form
          id="create-subcategory-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Parent Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full rounded-xl py-2.5 px-3.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Subcategory Name"
            placeholder="e.g. Standard Matte Visiting Cards"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText={
              formData.name
                ? `Generated URL slug: /${slugify(formData.name)}`
                : 'URL slug generated automatically'
            }
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Paper weight, finish specifications, minimum quantities..."
              className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <ImageUploader
            label="Subcategory Image"
            onFileSelect={(file) => setFormData({ ...formData, imageFile: file })}
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Active Status
              </span>
              <span className="text-xs text-slate-500">
                Visible for customer selection in store
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

      {/* EDIT SUBCATEGORY MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Subcategory"
        description="Update subcategory specifications or image."
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
              form="edit-subcategory-form"
              isLoading={isSubmitting}
            >
              Update Subcategory
            </Button>
          </>
        }
      >
        <form
          id="edit-subcategory-form"
          onSubmit={handleEditSubmit}
          className="space-y-4"
        >
          <Input
            label="Subcategory Name"
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
            label="Replace Subcategory Image"
            initialUrl={selectedSubcategory?.image}
            onFileSelect={(file) => setFormData({ ...formData, imageFile: file })}
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Active Status
              </span>
              <span className="text-xs text-slate-500">
                Customer visibility toggle
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
        title="Delete Subcategory?"
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
              Delete Subcategory
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              "{selectedSubcategory?.name}"
            </strong>
            ?
          </p>
          <p className="text-xs text-slate-400">
            This subcategory and its Cloudflare R2 image will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
