import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    dummyFarmers,
    dummyDeliveries,
    dummyLots,
    dummyBags,
    dummyExpenses,
    dummyLaborCosts,
    dummyAssets,
    dummyRevenue,
    dummyUsers,
    dummySeasons,
    dummyQualityChecks,
    dummySustainabilityChecks,
    dummyAuditLogs,
} from '../utils/dummyData';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    // Initialize state from localStorage or use dummy data
    const [farmers, setFarmers] = useState(() => {
        const stored = localStorage.getItem('cws_farmers');
        return stored ? JSON.parse(stored) : dummyFarmers;
    });

    const [deliveries, setDeliveries] = useState(() => {
        const stored = localStorage.getItem('cws_deliveries');
        return stored ? JSON.parse(stored) : dummyDeliveries;
    });

    const [lots, setLots] = useState(() => {
        const stored = localStorage.getItem('cws_lots');
        return stored ? JSON.parse(stored) : dummyLots;
    });

    const [bags, setBags] = useState(() => {
        const stored = localStorage.getItem('cws_bags');
        return stored ? JSON.parse(stored) : dummyBags;
    });

    const [expenses, setExpenses] = useState(() => {
        const stored = localStorage.getItem('cws_expenses');
        return stored ? JSON.parse(stored) : dummyExpenses;
    });

    const [laborCosts, setLaborCosts] = useState(() => {
        const stored = localStorage.getItem('cws_labor_costs');
        return stored ? JSON.parse(stored) : dummyLaborCosts;
    });

    const [assets, setAssets] = useState(() => {
        const stored = localStorage.getItem('cws_assets');
        return stored ? JSON.parse(stored) : dummyAssets;
    });

    const [revenue, setRevenue] = useState(() => {
        const stored = localStorage.getItem('cws_revenue');
        return stored ? JSON.parse(stored) : dummyRevenue;
    });

    const [users, setUsers] = useState(() => {
        const stored = localStorage.getItem('cws_users');
        return stored ? JSON.parse(stored) : dummyUsers;
    });

    const [seasons, setSeasons] = useState(() => {
        const stored = localStorage.getItem('cws_seasons');
        return stored ? JSON.parse(stored) : dummySeasons;
    });

    const [qualityChecks, setQualityChecks] = useState(() => {
        const stored = localStorage.getItem('cws_quality_checks');
        return stored ? JSON.parse(stored) : dummyQualityChecks;
    });

    const [sustainabilityChecks, setSustainabilityChecks] = useState(() => {
        const stored = localStorage.getItem('cws_sustainability_checks');
        return stored ? JSON.parse(stored) : dummySustainabilityChecks;
    });

    const [auditLogs, setAuditLogs] = useState(() => {
        const stored = localStorage.getItem('cws_audit_logs');
        return stored ? JSON.parse(stored) : dummyAuditLogs;
    });

    // Persist to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('cws_farmers', JSON.stringify(farmers));
    }, [farmers]);

    useEffect(() => {
        localStorage.setItem('cws_deliveries', JSON.stringify(deliveries));
    }, [deliveries]);

    useEffect(() => {
        localStorage.setItem('cws_lots', JSON.stringify(lots));
    }, [lots]);

    useEffect(() => {
        localStorage.setItem('cws_bags', JSON.stringify(bags));
    }, [bags]);

    useEffect(() => {
        localStorage.setItem('cws_expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('cws_labor_costs', JSON.stringify(laborCosts));
    }, [laborCosts]);

    useEffect(() => {
        localStorage.setItem('cws_assets', JSON.stringify(assets));
    }, [assets]);

    useEffect(() => {
        localStorage.setItem('cws_revenue', JSON.stringify(revenue));
    }, [revenue]);

    useEffect(() => {
        localStorage.setItem('cws_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('cws_seasons', JSON.stringify(seasons));
    }, [seasons]);

    useEffect(() => {
        localStorage.setItem('cws_quality_checks', JSON.stringify(qualityChecks));
    }, [qualityChecks]);

    useEffect(() => {
        localStorage.setItem('cws_sustainability_checks', JSON.stringify(sustainabilityChecks));
    }, [sustainabilityChecks]);

    useEffect(() => {
        localStorage.setItem('cws_audit_logs', JSON.stringify(auditLogs));
    }, [auditLogs]);

    const value = {
        farmers,
        setFarmers,
        deliveries,
        setDeliveries,
        lots,
        setLots,
        bags,
        setBags,
        expenses,
        setExpenses,
        laborCosts,
        setLaborCosts,
        assets,
        setAssets,
        revenue,
        setRevenue,
        users,
        setUsers,
        seasons,
        setSeasons,
        qualityChecks,
        setQualityChecks,
        sustainabilityChecks,
        setSustainabilityChecks,
        auditLogs,
        setAuditLogs,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
