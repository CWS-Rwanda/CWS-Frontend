import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    farmersAPI,
    deliveriesAPI,
    lotsAPI,
    storageAPI,
    expensesAPI,
    revenuesAPI,
    assetsAPI,
    seasonsAPI,
    laborLogsAPI,
    workersAPI,
    complianceLogsAPI,
    auditLogsAPI,
} from '../services/api';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    // State management with loading and error states
    const [farmers, setFarmers] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [lots, setLots] = useState([]);
    const [bags, setBags] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [laborCosts, setLaborCosts] = useState([]);
    const [assets, setAssets] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [users, setUsers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [qualityChecks, setQualityChecks] = useState([]);
    const [sustainabilityChecks, setSustainabilityChecks] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    
    // Loading states
    const [loading, setLoading] = useState({
        farmers: false,
        deliveries: false,
        lots: false,
        bags: false,
        expenses: false,
        laborCosts: false,
        assets: false,
        revenue: false,
        users: false,
        seasons: false,
        qualityChecks: false,
        sustainabilityChecks: false,
        auditLogs: false,
    });

    // Helper function to transform snake_case to camelCase
    const transformDelivery = (delivery) => ({
        id: delivery.id,
        farmerId: delivery.farmer_id,
        farmerName: delivery.farmer?.name || '',
        receptionistId: delivery.receptionist_id,
        seasonId: delivery.season_id,
        lotId: delivery.lot_id,
        date: delivery.delivery_date?.split('T')[0] || '',
        time: delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
        weight: parseFloat(delivery.weight_kg) || 0,
        unitPrice: parseFloat(delivery.unit_price) || 0,
        totalAmount: parseFloat(delivery.total_amount) || 0,
        qualityScore: delivery.quality_score || 0,
        paymentStatus: delivery.paid?.toLowerCase() || 'pending',
        season: delivery.season?.name || '',
    });

    const transformFarmer = (farmer) => ({
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone_number || '',
        sector: farmer.location?.sector || '',
        cell: farmer.location?.cell || '',
        village: farmer.location?.village || '',
        farmType: farmer.location?.farm_type || '',
        registeredDate: farmer.created_at?.split('T')[0] || '',
        active: farmer.active,
    });

    const transformLot = (lot) => ({
        id: lot.id,
        lotName: lot.lot_name,
        processingMethod: lot.process_type,
        grade: lot.grade || '',
        status: lot.status?.toLowerCase().replace('_', ' ') || 'created',
        seasonId: lot.season_id,
        totalWeight: 0, // Will be calculated from deliveries
        timeline: [], // Will be populated from processing logs
    });

    // Fetch functions
    const fetchFarmers = async () => {
        try {
            setLoading(prev => ({ ...prev, farmers: true }));
            const response = await farmersAPI.getAll();
            const transformed = response.data.data.map(transformFarmer);
            setFarmers(transformed);
        } catch (error) {
            console.error('Error fetching farmers:', error);
            setFarmers([]);
        } finally {
            setLoading(prev => ({ ...prev, farmers: false }));
        }
    };

    const fetchDeliveries = async () => {
        try {
            setLoading(prev => ({ ...prev, deliveries: true }));
            const response = await deliveriesAPI.getAll();
            const transformed = response.data.data.map(transformDelivery);
            setDeliveries(transformed);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            setDeliveries([]);
        } finally {
            setLoading(prev => ({ ...prev, deliveries: false }));
        }
    };

    const fetchLots = async () => {
        try {
            setLoading(prev => ({ ...prev, lots: true }));
            const response = await lotsAPI.getAll();
            const transformed = response.data.data.map(transformLot);
            setLots(transformed);
        } catch (error) {
            console.error('Error fetching lots:', error);
            setLots([]);
        } finally {
            setLoading(prev => ({ ...prev, lots: false }));
        }
    };

    const fetchSeasons = async () => {
        try {
            setLoading(prev => ({ ...prev, seasons: true }));
            const response = await seasonsAPI.getAll();
            setSeasons(response.data.data || []);
        } catch (error) {
            console.error('Error fetching seasons:', error);
            setSeasons([]);
        } finally {
            setLoading(prev => ({ ...prev, seasons: false }));
        }
    };

    const fetchExpenses = async () => {
        try {
            setLoading(prev => ({ ...prev, expenses: true }));
            const response = await expensesAPI.getAll();
            setExpenses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setExpenses([]);
        } finally {
            setLoading(prev => ({ ...prev, expenses: false }));
        }
    };

    const fetchRevenues = async () => {
        try {
            setLoading(prev => ({ ...prev, revenue: true }));
            const response = await revenuesAPI.getAll();
            setRevenue(response.data.data || []);
        } catch (error) {
            console.error('Error fetching revenues:', error);
            setRevenue([]);
        } finally {
            setLoading(prev => ({ ...prev, revenue: false }));
        }
    };

    const fetchAssets = async () => {
        try {
            setLoading(prev => ({ ...prev, assets: true }));
            const response = await assetsAPI.getAll();
            setAssets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching assets:', error);
            setAssets([]);
        } finally {
            setLoading(prev => ({ ...prev, assets: false }));
        }
    };

    const fetchStorageBags = async () => {
        try {
            setLoading(prev => ({ ...prev, bags: true }));
            const response = await storageAPI.getAll();
            setBags(response.data.data || []);
        } catch (error) {
            console.error('Error fetching storage bags:', error);
            setBags([]);
        } finally {
            setLoading(prev => ({ ...prev, bags: false }));
        }
    };

    const fetchLaborLogs = async () => {
        try {
            setLoading(prev => ({ ...prev, laborCosts: true }));
            const response = await laborLogsAPI.getAll();
            setLaborCosts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching labor logs:', error);
            setLaborCosts([]);
        } finally {
            setLoading(prev => ({ ...prev, laborCosts: false }));
        }
    };

    const fetchAuditLogs = async (params = {}) => {
        try {
            setLoading(prev => ({ ...prev, auditLogs: true }));
            const response = await auditLogsAPI.getAll(params);
            setAuditLogs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setAuditLogs([]);
        } finally {
            setLoading(prev => ({ ...prev, auditLogs: false }));
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchFarmers();
        fetchDeliveries();
        fetchLots();
        fetchSeasons();
        fetchExpenses();
        fetchRevenues();
        fetchAssets();
        fetchStorageBags();
        fetchLaborLogs();
    }, []);

    const value = {
        // Data
        farmers,
        deliveries,
        lots,
        bags,
        expenses,
        laborCosts,
        assets,
        revenue,
        users,
        seasons,
        qualityChecks,
        sustainabilityChecks,
        auditLogs,
        // Setters (for optimistic updates)
        setFarmers,
        setDeliveries,
        setLots,
        setBags,
        setExpenses,
        setLaborCosts,
        setAssets,
        setRevenue,
        setUsers,
        setSeasons,
        setQualityChecks,
        setSustainabilityChecks,
        setAuditLogs,
        // Fetch functions (for refresh)
        fetchFarmers,
        fetchDeliveries,
        fetchLots,
        fetchSeasons,
        fetchExpenses,
        fetchRevenues,
        fetchAssets,
        fetchStorageBags,
        fetchLaborLogs,
        fetchAuditLogs,
        // Loading states
        loading,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
