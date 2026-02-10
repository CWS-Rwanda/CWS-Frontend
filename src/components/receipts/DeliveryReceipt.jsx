import React, { useRef } from 'react';
import './DeliveryReceipt.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DeliveryReceipt = ({ delivery }) => {

    const receiptRef = useRef(null);


    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
            // Create a temporary element with optimized styling for PDF
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = `
                width: 400px;
                padding: 30px;
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                line-height: 1.4;
                color: #333;
                background: white;
                margin: 0 auto;
            `;
            
            tempDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">☕</div>
                    <h2 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: bold;">Coffee Washing Station</h2>
                    <p style="margin: 5px 0; color: #666; font-size: 16px;">Delivery Receipt</p>
                </div>
                
                <div style="border-bottom: 2px solid #e0e0e0; margin: 20px 0;"></div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Delivery ID:</span>
                        <span style="font-weight: bold;">${delivery.id}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Farmer Name:</span>
                        <span style="font-weight: bold;">${delivery.farmerName}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Farmer ID:</span>
                        <span>${delivery.farmerId}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Date & Time:</span>
                        <span>${delivery.date} ${delivery.time}</span>
                    </div>
                </div>
                
                <div style="border-bottom: 2px solid #e0e0e0; margin: 20px 0;"></div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Weight:</span>
                        <span style="font-weight: bold;">${delivery.weight} kg</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Unit Price:</span>
                        <span>RWF ${delivery.unitPrice}/kg</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #f8f9fa; margin: 10px 0; border-radius: 8px; font-size: 16px;">
                        <span style="color: #666; font-weight: bold;">Total Amount:</span>
                        <span style="font-weight: bold; color: #2c3e50;">RWF ${delivery.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                <div style="border-bottom: 2px solid #e0e0e0; margin: 20px 0;"></div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Payment Status:</span>
                        <span style="font-weight: bold; color: ${delivery.paymentStatus === 'paid' ? '#28a745' : '#ffc107'};">
                            ${delivery.paymentStatus.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Lot ID:</span>
                        <span>${delivery.lotId || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Quality Score:</span>
                        <span>${delivery.qualityScore}%</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-weight: 500;">Operator:</span>
                        <span>${delivery.operatorName}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span style="color: #666; font-weight: 500;">Season:</span>
                        <span>${delivery.season}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #2c3e50;">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Thank you for your delivery!</p>
                    <p style="margin: 0; color: #666; font-size: 12px; font-style: italic;">Please keep this receipt for your records</p>
                </div>
            `;
            
            // Temporarily add to DOM
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 400,
                height: tempDiv.scrollHeight
            }).then((canvas) => {
                // Remove temporary element
                document.body.removeChild(tempDiv);
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a5');
                const imgWidth = 148; // A5 width in mm
                const pageHeight = 210; // A5 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
    
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
    
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
    
                pdf.save(`delivery-receipt-${delivery.id}.pdf`);
            }).catch((error) => {
                console.error('Error generating PDF:', error);
                // Clean up on error
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
            });
        }
    

    return (
        <div className="receipt-container">
            <div 
                ref={receiptRef}
                className="receipt-container"
                style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    maxWidth: '500px', 
                    margin: '0 auto' 
                }}
            >
            <div className="receipt-header">
                <div className="receipt-logo">☕</div>
                <h2>Coffee Washing Station</h2>
                <p>Delivery Receipt</p>
            </div>
                
            <div className="receipt-divider"></div>

            <div className="receipt-body">
                <div className="receipt-row">
                    <span className="receipt-label">Delivery ID:</span>
                    <span className="receipt-value"><strong>{delivery.id}</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Farmer Name:</span>
                    <span className="receipt-value"><strong>{delivery.farmerName}</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Farmer ID:</span>
                    <span className="receipt-value">{delivery.farmerId}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Date & Time:</span>
                    <span className="receipt-value">{delivery.date} {delivery.time}</span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                    <span className="receipt-label">Weight:</span>
                    <span className="receipt-value"><strong>{delivery.weight} kg</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Unit Price:</span>
                    <span className="receipt-value">RWF {delivery.unitPrice}/kg</span>
                </div>

                <div className="receipt-row receipt-total">
                    <span className="receipt-label">Total Amount:</span>
                    <span className="receipt-value"><strong>RWF {delivery.totalAmount.toLocaleString()}</strong></span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                    <span className="receipt-label">Payment Status:</span>
                    <span className={`receipt-value ${delivery.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                        <strong>{delivery.paymentStatus.toUpperCase()}</strong>
                    </span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Lot ID:</span>
                    <span className="receipt-value">{delivery.lotId}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Quality Score:</span>
                    <span className="receipt-value">{delivery.qualityScore}%</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Operator:</span>
                    <span className="receipt-value">{delivery.operatorName}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Season:</span>
                    <span className="receipt-value">{delivery.season}</span>
                </div>
            </div>

            <div className="receipt-footer">
                <p>Thank you for your delivery!</p>
                <p className="receipt-note">Please keep this receipt for your records</p>
            </div>
            </div>
            <div className="receipt-actions" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                marginTop: '20px' 
            }}>
                <button onClick={handlePrint} className="btn btn-primary">
                    🖨️ Print Receipt
                </button>
                <button onClick={handleDownload} className="btn btn-secondary">
                    📄 Download PDF
                </button>
            </div>
        </div>
    );
};

export default DeliveryReceipt;
