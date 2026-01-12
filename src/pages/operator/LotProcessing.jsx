import React from 'react';
import { useData } from '../../context/DataContext';

const LotProcessing = () => {
    const { lots } = useData();

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'received': 'badge-warning',
            'pulped': 'badge-info',
            'fermented': 'badge-info',
            'washed': 'badge-info',
            'dried': 'badge-success',
            'stored': 'badge-success',
        };
        return statusMap[status] || 'badge-info';
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Lot Processing</h1>
                <p className="page-description">Track coffee processing stages</p>
            </div>

            {lots.map(lot => (
                <div key={lot.id} className="content-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">{lot.id}</h2>
                            <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                                {lot.processingMethod} - Grade {lot.grade} - {lot.totalWeight} kg
                            </p>
                        </div>
                        <span className={`badge ${getStatusBadgeClass(lot.status)}`} style={{ fontSize: '0.875rem' }}>
                            Current: {lot.status}
                        </span>
                    </div>

                    <div className="timeline">
                        {lot.timeline.map((stage, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <strong>{stage.stage}</strong>
                                        <span className="timeline-date">{stage.date} {stage.time}</span>
                                    </div>
                                    <p className="timeline-operator">Operator: {stage.operator}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <style>{`
        .timeline {
          position: relative;
          padding-left: var(--spacing-xl);
          margin-top: var(--spacing-lg);
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-gray-300);
        }

        .timeline-item {
          position: relative;
          margin-bottom: var(--spacing-lg);
        }

        .timeline-marker {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-secondary);
          border: 3px solid var(--color-white);
          box-shadow: 0 0 0 2px var(--color-secondary);
        }

        .timeline-content {
          padding-left: var(--spacing-md);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xs);
        }

        .timeline-date {
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }

        .timeline-operator {
          color: var(--color-gray-600);
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
        </div>
    );
};

export default LotProcessing;
