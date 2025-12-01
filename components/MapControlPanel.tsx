import { MapIcon, ListIcon, XIcon } from 'lucide-react';

interface MapControlPanelProps {
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  hasActiveFilter: boolean;
  filterCount: number;
  totalCount: number;
  onClearFilter: () => void;
}

export default function MapControlPanel({
  viewMode,
  onViewModeChange,
  hasActiveFilter,
  filterCount,
  totalCount,
  onClearFilter
}: MapControlPanelProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onViewModeChange('list')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: viewMode === 'list' ? '2px solid #3b82f6' : '1px solid #d1d5db',
            background: viewMode === 'list' ? '#eff6ff' : 'white',
            color: viewMode === 'list' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <ListIcon size={18} />
          Vista Lista
        </button>

        <button
          onClick={() => onViewModeChange('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: viewMode === 'map' ? '2px solid #3b82f6' : '1px solid #d1d5db',
            background: viewMode === 'map' ? '#eff6ff' : 'white',
            color: viewMode === 'map' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <MapIcon size={18} />
          Vista Mapa
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {hasActiveFilter && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#eff6ff',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <span style={{ fontWeight: '600', color: '#3b82f6' }}>
              {filterCount} {filterCount === 1 ? 'propiedad' : 'propiedades'}
            </span>
            <span style={{ color: '#6b7280' }}>en área seleccionada</span>
          </div>
        )}

        {!hasActiveFilter && (
          <div style={{
            padding: '0.5rem 1rem',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {totalCount} {totalCount === 1 ? 'propiedad' : 'propiedades'} en total
          </div>
        )}

        {hasActiveFilter && (
          <button
            onClick={onClearFilter}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ef4444',
              background: 'white',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <XIcon size={18} />
            Limpiar Área
          </button>
        )}
      </div>
    </div>
  );
}
