import React, { useState } from 'react';
import { Staff, Store } from '../types';
import { UserPlus, Edit3, Trash2, Search } from 'lucide-react';

interface Props {
  staffList: Staff[];
  stores: Store[];
  onAddStaff: (data: any) => Promise<void>;
  onUpdateStaff: (id: string, data: any) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const StaffMasterScreen: React.FC<Props> = ({
  staffList,
  stores,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [saleTarget, setSaleTarget] = useState('25000');
  const [qtyTarget, setQtyTarget] = useState('20');
  const [ffTarget, setFFTarget] = useState('5');
  const [bigBillTarget, setBigBillTarget] = useState('2');
  const [monthlyTarget, setMonthlyTarget] = useState('750000');
  const [annualAop, setAnnualAop] = useState('9000000');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const activeStores = stores.filter(s => s.status === 'ACTIVE');

  const filteredStaff = staffList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchStore = !storeFilter || s.store_name === storeFilter;
    return matchSearch && matchStore;
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setId(`STF-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setStoreName(activeStores[0]?.name || '');
    setSaleTarget('25000');
    setQtyTarget('20');
    setFFTarget('5');
    setBigBillTarget('2');
    setMonthlyTarget('750000');
    setAnnualAop('9000000');
    setStatus('ACTIVE');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setId(staff.id);
    setName(staff.name);
    setStoreName(staff.store_name);
    setSaleTarget((staff.daily_sale_target || staff.daily_target || 25000).toString());
    setQtyTarget((staff.daily_qty_target || 20).toString());
    setFFTarget((staff.daily_ff_target || 5).toString());
    setBigBillTarget((staff.daily_big_bill_target || 2).toString());
    setMonthlyTarget((staff.monthly_target || 750000).toString());
    setAnnualAop((staff.annual_aop || 9000000).toString());
    setStatus(staff.status || 'ACTIVE');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !storeName) {
      setError('ID, Name, and Store are required');
      return;
    }

    const storeObj = stores.find(s => s.name === storeName);
    const payload = {
      id,
      name,
      store_name: storeName,
      store_id: storeObj?.id || '',
      daily_sale_target: parseFloat(saleTarget) || 25000,
      daily_qty_target: parseInt(qtyTarget, 10) || 20,
      daily_ff_target: parseInt(ffTarget, 10) || 5,
      daily_big_bill_target: parseInt(bigBillTarget, 10) || 2,
      monthly_target: parseFloat(monthlyTarget) || 750000,
      annual_aop: parseFloat(annualAop) || 9000000,
      status
    };

    try {
      if (editingStaff) {
        await onUpdateStaff(editingStaff.id, payload);
        showToast('Staff updated successfully!');
      } else {
        await onAddStaff(payload);
        showToast('Staff added successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save staff');
    }
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete staff "${staffName}"?`)) {
      try {
        await onDeleteStaff(staffId);
        showToast('Staff deleted successfully!');
      } catch (err: any) {
        alert(err.message || 'Failed to delete staff');
      }
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Staff Master & Targets</h2>
          <p style={{ fontSize: '11px', color: '#64748B' }}>Configure Sale, Qty, FF, Big Bill targets and AOP</p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#2563EB',
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
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
          />
        </div>

        <select
          value={storeFilter}
          onChange={e => setStoreFilter(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
        >
          <option value="">All Stores</option>
          {stores.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredStaff.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', textAlign: 'center', borderRadius: '12px', color: '#64748B', fontSize: '12px', border: '1px solid #E2E8F0' }}>
            No staff records found.
          </div>
        ) : (
          filteredStaff.map(staff => {
            const isActive = staff.status !== 'INACTIVE';
            return (
              <div
                key={staff.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{staff.name}</h4>
                    <span style={{ backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2', color: isActive ? '#059669' : '#DC2626', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    ID: {staff.id} • Store: {staff.store_name}
                  </p>
                  <p style={{ fontSize: '10px', color: '#2563EB', marginTop: '4px' }}>
                    Daily Targets → Sale: ₹{staff.daily_sale_target || staff.daily_target || 25000} | Qty: {staff.daily_qty_target || 20} | FF: {staff.daily_ff_target || 5} | BB: {staff.daily_big_bill_target || 2}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEditModal(staff)} style={{ backgroundColor: '#EFF6FF', border: 'none', color: '#2563EB', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    <Edit3 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(staff.id, staff.name)} style={{ backgroundColor: '#FEF2F2', border: 'none', color: '#DC2626', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              {editingStaff ? 'Edit Staff & Targets' : 'Add Staff & Targets'}
            </h3>

            {error && <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Staff ID *</label>
                <input type="text" value={id} onChange={e => setId(e.target.value)} readOnly={Boolean(editingStaff)} required style={{ ...inputStyle, backgroundColor: editingStaff ? '#F8FAFC' : '#FFFFFF' }} />
              </div>

              <div>
                <label style={labelStyle}>Staff Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Store *</label>
                <select value={storeName} onChange={e => setStoreName(e.target.value)} required style={inputStyle}>
                  <option value="">-- Choose Store --</option>
                  {activeStores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Daily Sale Target (₹)</label>
                  <input type="number" value={saleTarget} onChange={e => setSaleTarget(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Daily Qty Target</label>
                  <input type="number" value={qtyTarget} onChange={e => setQtyTarget(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Daily FF Target</label>
                  <input type="number" value={ffTarget} onChange={e => setFFTarget(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Daily Big Bill Target</label>
                  <input type="number" value={bigBillTarget} onChange={e => setBigBillTarget(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Monthly Target (₹)</label>
                  <input type="number" value={monthlyTarget} onChange={e => setMonthlyTarget(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Annual AOP (₹)</label>
                  <input type="number" value={annualAop} onChange={e => setAnnualAop(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' };
