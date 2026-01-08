import React from 'react';
import { Award } from '@/types/award.types';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiGripVertical, FiImage } from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AwardCardProps {
  award: Award;
  onEdit: (award: Award) => void;
  onDelete: (award: Award) => void;
  onToggleStatus: (award: Award) => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({
  award,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: award.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {award.image ? (
          <img
            src={award.image}
            alt={award.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiImage className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              award.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {award.status}
          </span>
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 left-3 cursor-grab active:cursor-grabbing bg-white rounded p-2 shadow-sm hover:bg-gray-50"
        >
          <FiGripVertical className="text-gray-600" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {award.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{award.year}</span>
              <span>•</span>
              <span>{award.issuer}</span>
            </div>
          </div>
        </div>

        {award.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {award.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onToggleStatus(award)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
            title={award.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          >
            {award.status === 'ACTIVE' ? (
              <>
                <FiEyeOff className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <FiEye className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => onEdit(award)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(award)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
