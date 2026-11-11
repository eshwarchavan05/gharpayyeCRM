import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { MOCK_LEADS, MOCK_VISITS, MOCK_USERS } from '../utils/mockData';

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const { isAuthenticated, isGuest, user } = useAuth();

  // Separate states for Guest Mode and Authenticated Mode
  const [guestLeads, setGuestLeads] = useState(MOCK_LEADS);
  const [guestVisits, setGuestVisits] = useState(MOCK_VISITS);

  const [realLeads, setRealLeads] = useState([]);
  const [realVisits, setRealVisits] = useState([]);
  const [realAgents, setRealAgents] = useState([]);
  const [realStats, setRealStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  // Fetch real data when authenticated
  const fetchRealData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      // 1. Fetch leads
      const leadsRes = await api.get('/leads?limit=100');
      if (leadsRes.data?.leads) {
        setRealLeads(leadsRes.data.leads);
      }

      // 2. Fetch visits
      try {
        const visitsRes = await api.get('/visits');
        if (Array.isArray(visitsRes.data)) {
          setRealVisits(visitsRes.data);
        }
      } catch (e) {
        console.warn('Visits fetch failed:', e.message);
      }

      // 3. Fetch users/agents
      try {
        const usersRes = await api.get('/users');
        if (Array.isArray(usersRes.data)) {
          setRealAgents(usersRes.data);
        }
      } catch (e) {
        console.warn('Users fetch failed:', e.message);
      }

      // 4. Fetch stats
      try {
        const statsRes = await api.get('/leads/stats');
        if (statsRes.data) {
          setRealStats(statsRes.data);
        }
      } catch (e) {
        console.warn('Stats fetch failed:', e.message);
      }

      setDbConnected(true);
    } catch (err) {
      console.error('Failed to load authenticated CRM data:', err);
      if (err.response?.status === 503 || !err.response) {
        setDbConnected(false);
        toast.error('Live database is unavailable. Showing local offline data.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRealData();
    } else {
      // Clean up real state on logout so no mix-up occurs
      setRealLeads([]);
      setRealVisits([]);
      setRealAgents([]);
      setRealStats(null);
    }
  }, [isAuthenticated, fetchRealData]);

  // Current active datasets based on mode
  const leads = isAuthenticated ? realLeads : guestLeads;
  const visits = isAuthenticated ? realVisits : guestVisits;
  const agents = isAuthenticated && realAgents.length > 0 ? realAgents : MOCK_USERS;

  // Add Lead
  const addLead = async (form) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.post('/leads', form);
        setRealLeads((prev) => [data, ...prev]);
        toast.success('Lead added to live database!');
        return data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add lead to database';
        toast.error(msg);
        throw err;
      }
    } else {
      // Guest mode: update local guest state
      const agentUser = MOCK_USERS.find((u) => u._id === form.assignedTo);
      const score = Number(form.score) || 50;
      const newLead = {
        _id: `guest-${Date.now()}`,
        ...form,
        score,
        leadTemperature: score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD',
        assignedTo: agentUser ? { _id: agentUser._id, name: agentUser.name, email: agentUser.email } : null,
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGuestLeads((prev) => [newLead, ...prev]);
      toast.success('Lead added (Demo Mode)!');
      return newLead;
    }
  };

  // Update Lead
  const updateLead = async (id, form) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.put(`/leads/${id}`, form);
        setRealLeads((prev) => prev.map((l) => (l._id === id ? data : l)));
        toast.success('Lead updated in live database!');
        return data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update lead';
        toast.error(msg);
        throw err;
      }
    } else {
      // Guest mode
      const agentUser = MOCK_USERS.find((u) => u._id === form.assignedTo);
      const score = typeof form.score !== 'undefined' ? Number(form.score) : undefined;
      setGuestLeads((prev) =>
        prev.map((x) => {
          if (x._id !== id) return x;
          const updatedScore = score ?? x.score;
          return {
            ...x,
            ...form,
            score: updatedScore,
            leadTemperature: updatedScore >= 70 ? 'HOT' : updatedScore >= 40 ? 'WARM' : 'COLD',
            assignedTo: agentUser ? { _id: agentUser._id, name: agentUser.name, email: agentUser.email } : x.assignedTo,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      toast.success('Lead updated (Demo Mode)!');
    }
  };

  // Delete Lead
  const deleteLead = async (id) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/leads/${id}`);
        setRealLeads((prev) => prev.filter((l) => l._id !== id));
        toast.success('Lead deleted from live database');
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete lead';
        toast.error(msg);
        throw err;
      }
    } else {
      // Guest mode
      setGuestLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success('Lead deleted (Demo Mode)');
    }
  };

  // Add Visit
  const addVisit = async (form) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.post('/visits', form);
        setRealVisits((prev) => [data, ...prev]);
        toast.success('Visit scheduled in live database!');
        return data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to schedule visit';
        toast.error(msg);
        throw err;
      }
    } else {
      const lead = guestLeads.find((l) => l._id === form.leadId);
      const agent = MOCK_USERS.find((u) => u._id === form.agentId);
      const newVisit = {
        _id: `guest-v-${Date.now()}`,
        leadId: lead ? { _id: lead._id, name: lead.name, phone: lead.phone } : { name: 'Unknown' },
        agentId: agent ? { _id: agent._id, name: agent.name } : { name: 'Unknown' },
        visitDate: new Date(form.visitDate).toISOString(),
        propertyAddress: form.propertyAddress,
        remarks: form.remarks,
        status: 'Scheduled',
      };
      setGuestVisits((prev) => [newVisit, ...prev]);
      toast.success('Visit scheduled (Demo Mode)!');
      return newVisit;
    }
  };

  // Update Visit Status
  const updateVisitStatus = async (id, status) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.put(`/visits/${id}`, { status });
        setRealVisits((prev) => prev.map((v) => (v._id === id ? data : v)));
        toast.success(`Visit marked ${status.toLowerCase()}`);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update visit status';
        toast.error(msg);
      }
    } else {
      setGuestVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status } : v)));
      toast.success(`Visit ${status.toLowerCase()} (Demo Mode)`);
    }
  };

  return (
    <CrmContext.Provider
      value={{
        leads,
        visits,
        agents,
        realStats,
        loading,
        dbConnected,
        isLiveMode: isAuthenticated,
        isGuestMode: isGuest,
        addLead,
        updateLead,
        deleteLead,
        addVisit,
        updateVisitStatus,
        refreshData: fetchRealData,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export const useCrm = () => useContext(CrmContext);
