// Dummy Data for CWS System

export const dummyFarmers = [
    { id: 'F001', name: 'Jean Baptiste Nkurunziza', phone: '+250788123456', sector: 'Huye', cell: 'Tumba', village: 'Karama', farmType: 'outgrower', registeredDate: '2024-01-15' },
    { id: 'F002', name: 'Marie Claire Uwase', phone: '+250788234567', sector: 'Huye', cell: 'Tumba', village: 'Gikundamvura', farmType: 'outgrower', registeredDate: '2024-01-18' },
    { id: 'F003', name: 'Emmanuel Habimana', phone: '+250788345678', sector: 'Huye', cell: 'Rango', village: 'Cyarwa', farmType: 'outgrower', registeredDate: '2024-02-01' },
    { id: 'F004', name: 'Josephine Mukamana', phone: '+250788456789', sector: 'Huye', cell: 'Rango', village: 'Ruhashya', farmType: 'nucleus', registeredDate: '2024-02-10' },
    { id: 'F005', name: 'Samuel Nsengimana', phone: '+250788567890', sector: 'Huye', cell: 'Tumba', village: 'Karama', farmType: 'outgrower', registeredDate: '2024-03-05' },
];

export const dummyDeliveries = [
    { id: 'D001', farmerId: 'F001', farmerName: 'Jean Baptiste Nkurunziza', date: '2025-04-15', time: '08:30', weight: 125, unitPrice: 350, totalAmount: 43750, lotId: 'LOT001', paymentStatus: 'paid', qualityScore: 85, operatorName: 'Reception Staff', season: '2025A' },
    { id: 'D002', farmerId: 'F002', farmerName: 'Marie Claire Uwase', date: '2025-04-15', time: '09:15', weight: 98, unitPrice: 350, totalAmount: 34300, lotId: 'LOT001', paymentStatus: 'paid', qualityScore: 82, operatorName: 'Reception Staff', season: '2025A' },
    { id: 'D003', farmerId: 'F003', farmerName: 'Emmanuel Habimana', date: '2025-04-16', time: '07:45', weight: 156, unitPrice: 350, totalAmount: 54600, lotId: 'LOT002', paymentStatus: 'pending', qualityScore: 88, operatorName: 'Reception Staff', season: '2025A' },
    { id: 'D004', farmerId: 'F001', farmerName: 'Jean Baptiste Nkurunziza', date: '2025-04-17', time: '08:00', weight: 110, unitPrice: 350, totalAmount: 38500, lotId: 'LOT002', paymentStatus: 'paid', qualityScore: 86, operatorName: 'Reception Staff', season: '2025A' },
    { id: 'D005', farmerId: 'F004', farmerName: 'Josephine Mukamana', date: '2025-04-18', time: '09:30', weight: 205, unitPrice: 350, totalAmount: 71750, lotId: 'LOT003', paymentStatus: 'pending', qualityScore: 90, operatorName: 'Reception Staff', season: '2025A' },
];

export const dummyLots = [
    {
        id: 'LOT001',
        createdDate: '2025-04-15',
        processingMethod: 'washed',
        grade: 'A',
        status: 'stored',
        deliveries: ['D001', 'D002'],
        totalWeight: 223,
        qualityScore: 84,
        sustainabilityScore: 88,
        approved: true,
        timeline: [
            { stage: 'received', date: '2025-04-15', time: '10:00', operator: 'Processing Operator' },
            { stage: 'pulped', date: '2025-04-15', time: '14:30', operator: 'Processing Operator' },
            { stage: 'fermented', date: '2025-04-16', time: '16:00', operator: 'Processing Operator' },
            { stage: 'washed', date: '2025-04-17', time: '08:00', operator: 'Processing Operator' },
            { stage: 'dried', date: '2025-04-25', time: '17:00', operator: 'Processing Operator' },
            { stage: 'stored', date: '2025-04-26', time: '09:00', operator: 'Processing Operator' },
        ]
    },
    {
        id: 'LOT002',
        createdDate: '2025-04-16',
        processingMethod: 'washed',
        grade: 'A',
        status: 'dried',
        deliveries: ['D003', 'D004'],
        totalWeight: 266,
        qualityScore: 87,
        sustainabilityScore: 85,
        approved: true,
        timeline: [
            { stage: 'received', date: '2025-04-16', time: '11:00', operator: 'Processing Operator' },
            { stage: 'pulped', date: '2025-04-16', time: '15:00', operator: 'Processing Operator' },
            { stage: 'fermented', date: '2025-04-17', time: '17:00', operator: 'Processing Operator' },
            { stage: 'washed', date: '2025-04-18', time: '09:00', operator: 'Processing Operator' },
            { stage: 'dried', date: '2025-04-26', time: '18:00', operator: 'Processing Operator' },
        ]
    },
    {
        id: 'LOT003',
        createdDate: '2025-04-18',
        processingMethod: 'honey',
        grade: 'A',
        status: 'fermented',
        deliveries: ['D005'],
        totalWeight: 205,
        qualityScore: 90,
        sustainabilityScore: 92,
        approved: false,
        timeline: [
            { stage: 'received', date: '2025-04-18', time: '12:00', operator: 'Processing Operator' },
            { stage: 'pulped', date: '2025-04-18', time: '16:00', operator: 'Processing Operator' },
            { stage: 'fermented', date: '2025-04-19', time: '18:00', operator: 'Processing Operator' },
        ]
    },
];

export const dummyBags = [
    { id: 'BAG001', lotId: 'LOT001', weight: 60, moisture: 12.5, storedDate: '2025-04-26', dispatched: false },
    { id: 'BAG002', lotId: 'LOT001', weight: 58, moisture: 12.3, storedDate: '2025-04-26', dispatched: false },
    { id: 'BAG003', lotId: 'LOT001', weight: 62, moisture: 12.4, storedDate: '2025-04-26', dispatched: false },
    { id: 'BAG004', lotId: 'LOT002', weight: 65, moisture: 11.8, storedDate: '2025-04-27', dispatched: false },
    { id: 'BAG005', lotId: 'LOT002', weight: 63, moisture: 12.0, storedDate: '2025-04-27', dispatched: false },
];

export const dummyExpenses = [
    { id: 'EXP001', date: '2025-04-10', category: 'Energy & Utilities', description: 'Electricity bill - April', amount: 180000, season: '2025A', receipt: null },
    { id: 'EXP002', date: '2025-04-12', category: 'Maintenance', description: 'Pulper machine repairs', amount: 75000, season: '2025A', receipt: null },
    { id: 'EXP003', date: '2025-04-14', category: 'Consumables', description: 'Cleaning supplies', amount: 25000, season: '2025A', receipt: null },
    { id: 'EXP004', date: '2025-04-20', category: 'Administration', description: 'Office supplies', amount: 35000, season: '2025A', receipt: null },
];

export const dummyLaborCosts = [
    { id: 'LAB001', date: '2025-04-15', workerName: 'Pierre Mugabo', workerType: 'seasonal', hours: 8, rate: 2500, totalCost: 20000, task: 'Cherry sorting' },
    { id: 'LAB002', date: '2025-04-15', workerName: 'Grace Uwera', workerType: 'seasonal', hours: 8, rate: 2500, totalCost: 20000, task: 'Pulping operation' },
    { id: 'LAB003', date: '2025-04-16', workerName: 'Pierre Mugabo', workerType: 'seasonal', hours: 8, rate: 2500, totalCost: 20000, task: 'Washing' },
    { id: 'LAB004', date: '2025-04-20', workerName: 'David Niyonzima', workerType: 'permanent', hours: 8, rate: 3500, totalCost: 28000, task: 'Quality control' },
];

export const dummyAssets = [
    { id: 'AST001', name: 'Pulping Machine', category: 'Equipment', purchaseDate: '2020-03-15', purchaseValue: 15000000, depreciationYears: 10, currentValue: 9000000 },
    { id: 'AST002', name: 'Fermentation Tanks (3 units)', category: 'Equipment', purchaseDate: '2020-04-01', purchaseValue: 8000000, depreciationYears: 10, currentValue: 4800000 },
    { id: 'AST003', name: 'Drying Tables', category: 'Infrastructure', purchaseDate: '2020-05-10', purchaseValue: 5000000, depreciationYears: 10, currentValue: 3000000 },
    { id: 'AST004', name: 'Warehouse Building', category: 'Infrastructure', purchaseDate: '2019-12-01', purchaseValue: 25000000, depreciationYears: 20, currentValue: 21875000 },
];

export const dummyRevenue = [
    { id: 'REV001', date: '2025-05-10', lotId: 'LOT001', grade: 'A', quantity: 180, pricePerKg: 8500, totalRevenue: 1530000, buyer: 'Rwanda Trading Company' },
];

export const dummyUsers = [
    { id: 1, email: 'admin@cws.rw', role: 'admin', name: 'Admin User', status: 'active' },
    { id: 2, email: 'receptionist@cws.rw', role: 'receptionist', name: 'Reception Staff', status: 'active' },
    { id: 3, email: 'operator@cws.rw', role: 'operator', name: 'Processing Operator', status: 'active' },
    { id: 4, email: 'sustainability@cws.rw', role: 'sustainability', name: 'Quality Manager', status: 'active' },
    { id: 5, email: 'finance@cws.rw', role: 'finance', name: 'Finance Officer', status: 'active' },
];

export const dummySeasons = [
    { id: 'S001', name: '2024A', startDate: '2024-03-01', endDate: '2024-06-30', status: 'closed', totalCherries: 15000, totalRevenue: 8500000 },
    { id: 'S002', name: '2024B', startDate: '2024-09-01', endDate: '2024-12-31', status: 'closed', totalCherries: 18500, totalRevenue: 10200000 },
    { id: 'S003', name: '2025A', startDate: '2025-03-01', endDate: '2025-06-30', status: 'active', totalCherries: 694, totalRevenue: 1530000 },
];

export const dummyQualityChecks = [
    {
        id: 'QC001',
        lotId: 'LOT001',
        date: '2025-04-16',
        fermentationDuration: 36,
        moisture: 12.4,
        defects: 2,
        cpqiScore: 84,
        compliant: true,
        notes: 'Good fermentation, minimal defects'
    },
    {
        id: 'QC002',
        lotId: 'LOT002',
        date: '2025-04-17',
        fermentationDuration: 38,
        moisture: 12.0,
        defects: 1,
        cpqiScore: 87,
        compliant: true,
        notes: 'Excellent quality, proper processing'
    },
];

export const dummySustainabilityChecks = [
    {
        id: 'SC001',
        date: '2025-04-15',
        ppeUsage: 'compliant',
        wastewaterManagement: 'compliant',
        laborStandards: 'compliant',
        cpsiScore: 88,
        correctiveActions: [],
        notes: 'All standards met'
    },
    {
        id: 'SC002',
        date: '2025-04-20',
        ppeUsage: 'compliant',
        wastewaterManagement: 'needs-improvement',
        laborStandards: 'compliant',
        cpsiScore: 75,
        correctiveActions: ['Install additional wastewater filters'],
        notes: 'Wastewater pH slightly high'
    },
];

export const dummyAuditLogs = [
    { id: 'AUD001', timestamp: '2025-04-15 08:30:15', user: 'Reception Staff', action: 'create', entity: 'delivery', entityId: 'D001', details: 'Created delivery for farmer F001' },
    { id: 'AUD002', timestamp: '2025-04-15 09:15:22', user: 'Reception Staff', action: 'create', entity: 'delivery', entityId: 'D002', details: 'Created delivery for farmer F002' },
    { id: 'AUD003', timestamp: '2025-04-15 10:00:45', user: 'Processing Operator', action: 'update', entity: 'lot', entityId: 'LOT001', details: 'Updated lot status to received' },
    { id: 'AUD004', timestamp: '2025-04-16 08:00:12', user: 'Quality Manager', action: 'create', entity: 'quality_check', entityId: 'QC001', details: 'Completed quality check for LOT001' },
    { id: 'AUD005', timestamp: '2025-04-20 14:30:00', user: 'Finance Officer', action: 'create', entity: 'expense', entityId: 'EXP004', details: 'Recorded office supplies expense' },
];

// Helper function to generate IDs
export const generateId = (prefix) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
};
