import React, { useState } from 'react';
import { Store } from '../types';
import { Store as StoreIcon, PlusCircle, Edit3, Trash2, Search } from 'lucide-react';

interface Props {
  stores: Store[];
  onAddStore: (data: any) => Promise<void>;
  onUpdateStore: (id: string, data: any) => Promise<void>;
  onDeleteStore: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const StoreMasterScreen: React.FC<Props> = ({
  stores,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingStore(null);
    setId(`STR-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setLocation('');
    setStatus('ACTIVE');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setId(store.id);
    setName(store.name);
    setLocation(store.location);
    setStatus(store.status || 'ACTIVE');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !location) {
      setError('ID, Name, and Location are required');
      return;
    }

    try {
      if (editingStore) {
        await onUpdateStore(editingStore.id, { name, location, status });
        showToast('Store updated successfully!');
      } else {
        await onAddStore({ id, name, location, status });
        showToast('Store added successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save store');
    }
  };

  const handleDelete = async (storeId: string, storeName: string) => {
    if (window.confirm(`Are you sure you want to delete store "${storeName}"?`)) {
      try {
        await onDeleteStore(storeId);
        showToast('Store deleted successfully!');
      } catch (err: any) {
        alert(err.message || 'Failed to delete store');
      }
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Store Master</h2>
          <p style={{ fontSize: '11px', color: '#64748B' }}>Manage retail store locations and operational status</p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={16} />
          Add Store
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by store name, location or ID..."
          style={{
            width: '100%',
            padding: '10px 12px 10px 34px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '12px',
            backgroundColor: '#FFFFFF',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredStores.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', textAlign: 'center', borderRadius: '12px', color: '#64748B', fontSize: '12px', border: '1px solid #E2E8F0' }}>
            No stores found.
          </div>
        ) : (
          filteredStores.map(store => {
            const isActive = store.status !== 'INACTIVE';
            return (
              <div
                key={store.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{store.name}</h4>
                    <span style={{
                      backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
                      color: isActive ? '#059669' : '#DC2626',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    ID: {store.id} • Location: {store.location}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(store)}
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: 'none',
                      color: '#2563EB',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(store.id, store.name)}
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: 'none',
                      color: '#DC2626',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              {editingStore ? 'Edit Store Location' : 'Add New Store'}
            </h3>

            {error && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Store ID *</label>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  readOnly={Boolean(editingStore)}
                  required
                  style={{ ...inputStyle, backgroundColor: editingStore ? '#F8FAFC' : '#FFFFFF' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Store Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mumbai - Phoenix Palladium"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Lower Parel, Mumbai"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={inputStyle}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '2px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '13px',
  outline: 'none'
};
