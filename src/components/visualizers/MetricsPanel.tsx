import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import styles from './MetricsPanel.module.css';

interface MetricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ isOpen, onClose }) => {
  const stats = useSimulationStore(state => state.stats);
  const experts = useSimulationStore(state => state.experts);

  const getAuxLossStatus = (value: number) => {
    if (value < 1.2) return { color: '#10b981', label: 'Excellent' };
    if (value < 1.5) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#ef4444', label: 'Poor' };
  };

  const getImbalanceStatus = (value: number) => {
    if (value < 0.3) return { color: '#10b981', label: 'Excellent' };
    if (value < 0.6) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#ef4444', label: 'Poor' };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Metrics</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close metrics panel"
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          {/* Load Balancing Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Load Balancing</h3>
            
            {/* Auxiliary Loss */}
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Auxiliary Loss</span>
                <span 
                  className={styles.metricValueBadge}
                  style={{ backgroundColor: getAuxLossStatus(stats.auxiliaryLoss).color }}
                >
                  {stats.auxiliaryLoss.toFixed(4)}
                </span>
              </div>
              <div className={styles.metricDescription}>
                N × Σ(f<sub>e</sub> × P<sub>e</sub>) - Routing-dispatch mismatch. Ideal = 1.0
              </div>
            </div>

            {/* Load Imbalance Factor */}
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Load Imbalance Factor</span>
                <span 
                  className={styles.metricValueBadge}
                  style={{ backgroundColor: getImbalanceStatus(stats.loadImbalanceFactor).color }}
                >
                  {stats.loadImbalanceFactor.toFixed(3)}
                </span>
              </div>
              <div className={styles.metricDescription}>
                Coefficient of Variation (CV) = σ / μ. Ideal = 0.0
              </div>
            </div>
          </div>

          {/* Expert Utilization Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Expert Utilization %</h3>
            <div className={styles.expertBars}>
              {experts.map((expert, idx) => (
                <div key={expert.id} className={styles.expertBar}>
                  <div className={styles.expertBarHeader}>
                    <span 
                      className={styles.expertDot}
                      style={{ backgroundColor: expert.color }}
                    />
                    <span className={styles.expertName}>E{expert.id}</span>
                    <span className={styles.expertValue}>
                      {stats.expertUtilization[idx]?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className={styles.expertBarTrack}>
                    <div 
                      className={styles.expertBarFill}
                      style={{ 
                        width: `${stats.expertUtilization[idx] || 0}%`,
                        backgroundColor: expert.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

