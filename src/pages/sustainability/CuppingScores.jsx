import React, { useState } from 'react';
import CuppingScoreForm from '../../components/quality/CuppingScoreForm';
import './CuppingScores.css';

const CuppingScores = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedLot, setSelectedLot] = useState('');

    const handleFormSubmit = async (cuppingData) => {
        try {
            // In real app, this would save to API
            console.log('Saving cupping score:', cuppingData);
            alert('Cupping score saved successfully!');
            setShowForm(false);
        } catch (error) {
            console.error('Error saving cupping score:', error);
            alert('Failed to save cupping score. Please try again.');
        }
    };

    return (
        <div className="cupping-scores">
            <div className="page-header">
                <h1>SCA Cupping Scores</h1>
                <p>Record and manage professional coffee cupping evaluations</p>
            </div>

            {!showForm ? (
                <div className="cupping-home">
                    <div className="intro-card">
                        <h2>🏆 SCA Cupping Protocol</h2>
                        <p>
                            The Specialty Coffee Association (SCA) cupping protocol is the industry standard 
                            for evaluating coffee quality. Each coffee is evaluated across 10 criteria, 
                            with a maximum score of 100 points.
                        </p>
                        
                        <div className="quality-levels">
                            <h3>Quality Classification</h3>
                            <div className="levels-grid">
                                <div className="level-item competition">
                                    <div className="score-range">89+ points</div>
                                    <div className="level-name">Competition Level</div>
                                </div>
                                <div className="level-item excellent">
                                    <div className="score-range">86-88 points</div>
                                    <div className="level-name">Excellent</div>
                                </div>
                                <div className="level-item good">
                                    <div className="score-range">83-85 points</div>
                                    <div className="level-name">Good Specialty</div>
                                </div>
                                <div className="level-item commercial">
                                    <div className="score-range">80-82 points</div>
                                    <div className="level-name">Commercial Specialty</div>
                                </div>
                            </div>
                        </div>

                        <div className="scoring-criteria">
                            <h3>Evaluation Criteria</h3>
                            <div className="criteria-grid">
                                <div className="criterion-item">
                                    <strong>Fragrance/Aroma</strong>
                                    <p>Dry and wet aroma evaluation (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Flavor</strong>
                                    <p>Taste characteristics and intensity (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Aftertaste</strong>
                                    <p>Lingering flavors after swallowing (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Acidity</strong>
                                    <p>Brightness and quality of acidity (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Body</strong>
                                    <p> Mouthfeel and texture (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Uniformity</strong>
                                    <p>Consistency across cups (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Cleanliness</strong>
                                    <p>Absence of defects or off-flavors (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Sweetness</strong>
                                    <p>Pleasant sweet character (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Overall</strong>
                                    <p>Overall impression and rating (10 points)</p>
                                </div>
                                <div className="criterion-item">
                                    <strong>Defects</strong>
                                    <p>Deductions for cup defects (-2 points each)</p>
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            <button 
                                className="btn btn-primary btn-lg"
                                onClick={() => setShowForm(true)}
                            >
                                + Start New Cupping Evaluation
                            </button>
                        </div>
                    </div>

                    <div className="recent-scores">
                        <h3>Recent Cupping Scores</h3>
                        <div className="scores-preview">
                            <div className="score-card">
                                <div className="score-header">
                                    <h4>LOT001 - Washed A</h4>
                                    <div className="score-value excellent">86.5</div>
                                </div>
                                <div className="score-details">
                                    <p><strong>Date:</strong> 2025-04-20</p>
                                    <p><strong>Cupper:</strong> Jean Mugabo</p>
                                    <p><strong>Quality:</strong> Excellent</p>
                                </div>
                            </div>
                            <div className="score-card">
                                <div className="score-header">
                                    <h4>LOT002 - Washed A</h4>
                                    <div className="score-value competition">89.0</div>
                                </div>
                                <div className="score-details">
                                    <p><strong>Date:</strong> 2025-04-22</p>
                                    <p><strong>Cupper:</strong> Marie Uwase</p>
                                    <p><strong>Quality:</strong> Competition Level</p>
                                </div>
                            </div>
                            <div className="score-card">
                                <div className="score-header">
                                    <h4>LOT003 - Honey A</h4>
                                    <div className="score-value good">82.5</div>
                                </div>
                                <div className="score-details">
                                    <p><strong>Date:</strong> 2025-04-24</p>
                                    <p><strong>Cupper:</strong> Jean Mugabo</p>
                                    <p><strong>Quality:</strong> Good Specialty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="form-container">
                    <div className="form-header">
                        <button 
                            className="back-btn"
                            onClick={() => setShowForm(false)}
                        >
                            ← Back to Overview
                        </button>
                        <h2>New Cupping Evaluation</h2>
                    </div>
                    <CuppingScoreForm 
                        lotId={selectedLot}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default CuppingScores;
