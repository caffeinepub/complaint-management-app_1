import { Complaint } from '../backend';
import { formatComplaintNumber, formatTimestamp, getStatusLabel } from './utils';

export function generateComplaintPDF(complaint: Complaint, officerName?: string): void {
  const complaintNumStr = formatComplaintNumber(complaint.complaintNumber);
  const statusStr =
    complaint.status === 'pending' ? 'pending' :
    complaint.status === 'inProgress' ? 'inProgress' : 'resolved';

  const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Complaint Receipt - ${complaintNumStr}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          font-size: 13px;
          color: #1a1a2e;
          background: #fff;
          padding: 0;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 20mm 18mm;
          background: #fff;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 3px solid #1a4a7a;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-box {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-box img {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }
        .header-text { flex: 1; }
        .header-text h1 {
          font-size: 20px;
          font-weight: bold;
          color: #1a4a7a;
          letter-spacing: 0.5px;
        }
        .header-text h2 {
          font-size: 14px;
          font-weight: 600;
          color: #2d6a9f;
          margin-top: 2px;
        }
        .header-text p {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
        .receipt-title {
          text-align: center;
          background: #1a4a7a;
          color: #fff;
          padding: 10px 0;
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 1px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .complaint-number-box {
          border: 2px solid #1a4a7a;
          border-radius: 8px;
          padding: 14px 20px;
          margin-bottom: 20px;
          background: #f0f6ff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .complaint-number-box .label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .complaint-number-box .number {
          font-size: 22px;
          font-weight: bold;
          color: #1a4a7a;
          font-family: monospace;
          letter-spacing: 2px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pending { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
        .status-inProgress { background: #cce5ff; color: #004085; border: 1px solid #b8daff; }
        .status-resolved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .section {
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #1a4a7a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #dde4f0;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 20px;
        }
        .field { margin-bottom: 6px; }
        .field-label {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 2px;
        }
        .field-value {
          font-size: 13px;
          color: #1a1a2e;
          font-weight: 500;
        }
        .complaint-text {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 10px 12px;
          font-size: 13px;
          line-height: 1.6;
          color: #333;
          white-space: pre-wrap;
        }
        .officer-box {
          background: #f0fff4;
          border: 1px solid #b2dfdb;
          border-radius: 6px;
          padding: 10px 14px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #dde4f0;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .footer-left { font-size: 11px; color: #888; }
        .signature-box {
          text-align: center;
          font-size: 11px;
          color: #555;
        }
        .signature-line {
          width: 140px;
          border-top: 1px solid #333;
          margin: 30px auto 4px;
        }
        .watermark {
          text-align: center;
          font-size: 10px;
          color: #bbb;
          margin-top: 20px;
          letter-spacing: 1px;
        }
        @media print {
          body { padding: 0; }
          .page { padding: 15mm 15mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="logo-box">
            <img src="${window.location.origin}/assets/generated/up-police-logo.dim_128x128.png" alt="UP Police Logo" />
          </div>
          <div class="header-text">
            <h1>PS SADAR BAZAR APPLICATION BOX</h1>
            <h2>Uttar Pradesh Police</h2>
            <p>Complaint Receipt / शिकायत रसीद</p>
          </div>
        </div>

        <!-- Receipt Title -->
        <div class="receipt-title">COMPLAINT RECEIVING RECEIPT</div>

        <!-- Complaint Number -->
        <div class="complaint-number-box">
          <div>
            <div class="label">Complaint Number / शिकायत संख्या</div>
            <div class="number">${complaintNumStr}</div>
          </div>
          <div>
            <span class="status-badge status-${statusStr}">${getStatusLabel(statusStr)}</span>
          </div>
        </div>

        <!-- Applicant Information -->
        <div class="section">
          <div class="section-title">Applicant Information / आवेदक की जानकारी</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Applicant Name / आवेदक का नाम</div>
              <div class="field-value">${complaint.applicantName}</div>
            </div>
            <div class="field">
              <div class="field-label">Father's Name / पिता का नाम</div>
              <div class="field-value">${complaint.fatherName}</div>
            </div>
            <div class="field">
              <div class="field-label">Mobile Number / मोबाइल नंबर</div>
              <div class="field-value">${complaint.mobileNumber}</div>
            </div>
            <div class="field">
              <div class="field-label">Submission Date / दर्ज तिथि</div>
              <div class="field-value">${formatTimestamp(complaint.submissionTimestamp)}</div>
            </div>
            <div class="field" style="grid-column: 1 / -1;">
              <div class="field-label">Address / पता</div>
              <div class="field-value">${complaint.address}</div>
            </div>
          </div>
        </div>

        <!-- Complaint Details -->
        <div class="section">
          <div class="section-title">Complaint Details / शिकायत विवरण</div>
          <div class="complaint-text">${complaint.complaintDetail}</div>
        </div>

        <!-- Assigned Officer -->
        <div class="section">
          <div class="section-title">Assigned Officer / नियुक्त अधिकारी</div>
          ${officerName
            ? `<div class="officer-box">
                <div class="field-label">Officer Name / अधिकारी का नाम</div>
                <div class="field-value">${officerName}</div>
               </div>`
            : `<div class="field-value" style="color:#888; font-style:italic;">Not yet assigned / अभी नियुक्त नहीं</div>`
          }
        </div>

        <!-- Attendance Log -->
        ${complaint.attendanceLog && complaint.attendanceLog.length > 0 ? `
        <div class="section">
          <div class="section-title">Attendance Log / उपस्थिति लॉग</div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1a4a7a; color:#fff;">
                <th style="padding:6px 8px; text-align:left;">Attended By</th>
                <th style="padding:6px 8px; text-align:left;">Date</th>
                <th style="padding:6px 8px; text-align:left;">Time</th>
                <th style="padding:6px 8px; text-align:left;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${complaint.attendanceLog.map((log, i) => `
                <tr style="background:${i % 2 === 0 ? '#f8f9fa' : '#fff'};">
                  <td style="padding:5px 8px; border-bottom:1px solid #eee;">${log.attendedBy}</td>
                  <td style="padding:5px 8px; border-bottom:1px solid #eee;">${log.attendanceDate}</td>
                  <td style="padding:5px 8px; border-bottom:1px solid #eee;">${log.attendanceTime}</td>
                  <td style="padding:5px 8px; border-bottom:1px solid #eee;">${log.remarks ?? '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="footer-left">
            <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
            <div>Ref: ${complaint.complaintNumber.toString()}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Authorized Signature</div>
            <div style="font-size:10px; color:#888;">PS Sadar Bazar</div>
          </div>
        </div>

        <div class="watermark">PS SADAR BAZAR APPLICATION BOX · UTTAR PRADESH POLICE</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
}
