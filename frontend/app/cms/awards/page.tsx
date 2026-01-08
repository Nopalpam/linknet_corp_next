'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, AwardFormData } from '@/types/award.types';
import { awardApi } from '@/lib/api/award.api';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiAward
} from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AwardFormModal } from '@/components/cms/awards/AwardFormModal';
import { AwardCard } from '@/components/cms/awards/AwardCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function AwardsManagementPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [deletingAward, setDeletingAward] = useState<Award | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchAwards = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'ALL' ? undefined : filterStatus;
      const data = await awardApi.getAwards(status);
      setAwards(data);
    } catch (error) {
      toast.error('Failed to load awards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  const handleCreate = () => {
    setEditingAward(null);
    setIsModalOpen(true);
  };

  const handleEdit = (award: Award) => {
    setEditingAward(award);
    setIsModalOpen(true);
  };

  const handleDelete = (award: Award) => {
    setDeletingAward(award);
  };

  const confirmDelete = async () => {
    if (!deletingAward) return;

    try {
      await awardApi.deleteAward(deletingAward.id);
      toast.success('Award deleted successfully');
      setDeletingAward(null);
      fetchAwards();
    } catch (error) {
      toast.error('Failed to delete award');
      console.error(error);
    }
  };

  const handleSubmit = async (data: AwardFormData) => {
    try {
      if (editingAward) {
        await awardApi.updateAward(editingAward.id, data);
        toast.success('Award updated successfully');
      } else {
        await awardApi.createAward(data);
        toast.success('Award created successfully');
      }
      setIsModalOpen(false);
      fetchAwards();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save award';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleToggleStatus = async (award: Award) => {
    try {
      const newStatus = award.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await awardApi.updateAward(award.id, { status: newStatus });
      toast.success(`Award ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      fetchAwards();
    } catch (error) {
      toast.error('Failed to update award status');
      console.error(error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = awards.findIndex((a) => a.id === active.id);
    const newIndex = awards.findIndex((a) => a.id === over.id);

    const newAwards = arrayMove(awards, oldIndex, newIndex);
    setAwards(newAwards);

    try {
      const updates = newAwards.map((award, index) => ({
        id: award.id,
        order: index + 1,
      }));

      await awardApi.updateAwardsOrder(updates);
      toast.success('Award order updated');
    } catch (error) {
      toast.error('Failed to update award order');
      fetchAwards();
    }
  };

  const filteredAwards = awards;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiAward className="text-blue-600" />
            Awards Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage awards, achievements, and recognitions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAwards}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus />
            Add Award
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Total: {filteredAwards.length} award(s)
          </div>
        </div>
      </div>

      {/* Awards List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAwards.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiAward className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No awards found</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first award
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <FiPlus />
            Add Award
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredAwards.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAwards.map((award) => (
                <AwardCard
                  key={award.id}
                  award={award}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Form Modal */}
      <AwardFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingAward}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAward}
        onClose={() => setDeletingAward(null)}
        onConfirm={confirmDelete}
        title="Delete Award"
        message={`Are you sure you want to delete "${deletingAward?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
