import React, { useState, useEffect } from 'react';
import { getMyRewards } from '../api/rewards.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const TYPE_CONFIG = {
  booking_completed: { label: 'Match Played',   color: '#22CC66', icon: 'sports_cricket'   },
  payment_success:   { label: 'Payment Bonus',  color: '#BFFF00', icon: 'payments'         },
  redeemed:          { label: 'Points Redeemed',color: '#FF4444', icon: 'card_giftcard'    },
  bonus:             { label: 'Bonus Points',   color: '#7B61FF', icon: 'workspace_premium'},
  referral:          { label: 'Referral Bonus', color: '#FFD700', icon: 'handshake'        },
  expired:           { label: 'Points Expired', color: '#555',    icon: 'timer_off'        },
};

export default function Rewards() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRewards().then(({ data: d }) => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const S = {
    page:  { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
    body:  { padding: 16 },
    card:  { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
  };

  const balance = data?.balance;
  const transactions = data?.transactions || [];

  return (
    <div style={S.page}>
      <TopBar title="MY REWARDS" />
      <div style={S.body}>

        {/* Balance Card */}
        <div style={{ background: 'linear-gradient(135deg, #1a2a0a, #0D1A00)', border: '1px solid #BFFF0044', borderRadius: 16, padding: 24, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>EAGLE POINTS</div>
          {loading ? (
            <div style={{ color: '#555', fontSize: 14 }}>Loading...</div>
          ) : (
            <>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#BFFF00', lineHeight: 1 }}>
                {balance?.total_points || 0}
              </div>
              <div style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>
                Lifetime earned: {balance?.lifetime_points || 0} pts
              </div>
              <div style={{ marginTop: 16, background: '#BFFF0022', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: '#BFFF00' }}>
                Earn 10 pts per ₹100 spent
              </div>
            </>
          )}
        </div>

        {/* Stats Row */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total Points', value: balance?.total_points || 0, color: '#BFFF00' },
              { label: 'Transactions', value: data?.total || 0, color: '#7B61FF' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#aaa' }}>TRANSACTION HISTORY</div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading history...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#BFFF00', display: 'block', marginBottom: 8 }}>workspace_premium</span>
            No reward transactions yet. Book a slot to start earning!
          </div>
        ) : (
          transactions.map(txn => {
            const cfg = TYPE_CONFIG[txn.type] || { label: txn.type, color: '#aaa', icon: '•' };
            const isEarn = txn.points > 0;
            return (
              <div key={txn.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cfg.label}</div>
                    <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{txn.description}</div>
                    <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>{new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: isEarn ? '#22CC66' : '#FF4444', whiteSpace: 'nowrap' }}>
                  {isEarn ? '+' : ''}{txn.points} pts
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
