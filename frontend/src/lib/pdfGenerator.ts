import { Complaint, Officer } from '../backend';
import { formatComplaintNumber, formatTimestamp, getStatusLabel } from './utils';

export function generateReceiptPDF(complaint: Complaint, officer?: Officer | null) {
  const complaintNum = formatComplaintNumber(complaint.complaintNumber);
  const submittedOn = formatTimestamp(complaint.submissionTimestamp);
  const statusLabel = getStatusLabel(String(complaint.status));

  const hearingEntry = complaint.statusLog
    .slice()
    .reverse()
    .find((s) => (s as any).hearingDate);

  const attendanceRows = complaint.attendanceLog
    .map(
      (a) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${a.attendedBy}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${a.attendanceDate}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${a.attendanceTime}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${a.remarks ?? '-'}</td>
      </tr>`
    )
    .join('');

  const statusRows = complaint.statusLog
    .map(
      (s) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${getStatusLabel(String(s.status))}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatTimestamp(s.updatedAt)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${s.updatedBy}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${s.details}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Complaint Receipt - ${complaintNum}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #222; }
    .header { background: #1a237e; color: white; padding: 20px; display: flex; align-items: center; gap: 20px; border-radius: 4px 4px 0 0; }
    .header img { width: 80px; height: 80px; object-fit: contain; }
    .header-text h1 { margin: 0; font-size: 20px; }
    .header-text h2 { margin: 4px 0 0; font-size: 14px; font-weight: normal; opacity: 0.85; }
    .receipt-title { background: #ff9800; color: #1a237e; text-align: center; padding: 10px; font-size: 18px; font-weight: bold; letter-spacing: 1px; }
    .complaint-number { background: #e8eaf6; border: 2px solid #1a237e; border-radius: 4px; padding: 12px 20px; margin: 16px 0; text-align: center; }
    .complaint-number span { font-size: 22px; font-weight: bold; color: #1a237e; letter-spacing: 2px; }
    .section { margin: 16px 0; }
    .section-title { background: #1a237e; color: white; padding: 8px 14px; font-size: 14px; font-weight: bold; border-radius: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #ddd; }
    .info-item { padding: 8px 14px; border-bottom: 1px solid #ddd; }
    .info-item:nth-child(odd) { border-right: 1px solid #ddd; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; font-weight: 500; margin-top: 2px; }
    .complaint-text { padding: 12px 14px; border: 1px solid #ddd; background: #fafafa; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #e8eaf6; padding: 8px 10px; border: 1px solid #ddd; text-align: left; font-weight: 600; color: #1a237e; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-inProgress { background: #cce5ff; color: #004085; }
    .status-resolved { background: #d4edda; color: #155724; }
    .footer { margin-top: 30px; border-top: 2px solid #1a237e; padding-top: 16px; display: flex; justify-content: space-between; }
    .signature-box { border: 1px solid #999; width: 180px; height: 60px; display: flex; align-items: flex-end; padding: 6px; font-size: 11px; color: #666; }
    .watermark { text-align: center; color: #ccc; font-size: 11px; margin-top: 20px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${window.location.origin}/logo.png" alt="UP Police Logo" onerror="this.style.display='none'"/>
    <div class="header-text">
      <h1>PS Sadar Bazar Application Box - UP Police</h1>
      <h2>पीएस सदर बाजार एप्लीकेशन बॉक्स - उत्तर प्रदेश पुलिस</h2>
    </div>
  </div>
  <div class="receipt-title">COMPLAINT RECEIPT / शिकायत रसीद</div>

  <div class="complaint-number">
    <div style="font-size:12px;color:#666;margin-bottom:4px;">Complaint Number / शिकायत संख्या</div>
    <span>${complaintNum}</span>
  </div>

  <div class="section">
    <div class="section-title">Applicant Information / आवेदक की जानकारी</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name / नाम</div>
        <div class="info-value">${complaint.applicantName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Father's Name / पिता का नाम</div>
        <div class="info-value">${complaint.fatherName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Mobile No. / मोबाइल नंबर</div>
        <div class="info-value">${complaint.mobileNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Submitted On / दर्ज तिथि</div>
        <div class="info-value">${submittedOn}</div>
      </div>
      <div class="info-item" style="grid-column: span 2;">
        <div class="info-label">Address / पता</div>
        <div class="info-value">${complaint.address}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Complaint Detail / शिकायत विवरण</div>
    <div class="complaint-text">${complaint.complaintDetail}</div>
  </div>

  <div class="section">
    <div class="section-title">Status & Officer / स्थिति और अधिकारी</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Current Status / वर्तमान स्थिति</div>
        <div class="info-value">
          <span class="status-badge status-${String(complaint.status)}">${statusLabel}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Assigned Officer / नियुक्त अधिकारी</div>
        <div class="info-value">${officer ? `${officer.name} (${officer.designation})` : 'Not Assigned / नियुक्त नहीं'}</div>
      </div>
      ${officer ? `
      <div class="info-item">
        <div class="info-label">Officer Mobile / अधिकारी मोबाइल</div>
        <div class="info-value">${officer.mobileNumber}</div>
      </div>` : ''}
      <div class="info-item">
        <div class="info-label">Attached File / संलग्न फ़ाइल</div>
        <div class="info-value">${complaint.attachedFile ? 'File Attached / फ़ाइल संलग्न है' : 'No Attachment / कोई संलग्नक नहीं'}</div>
      </div>
    </div>
  </div>

  ${complaint.statusLog.length > 0 ? `
  <div class="section">
    <div class="section-title">Status History / स्थिति इतिहास</div>
    <table>
      <thead>
        <tr>
          <th>Status / स्थिति</th>
          <th>Date & Time / तिथि और समय</th>
          <th>Updated By / अपडेट किया</th>
          <th>Details / विवरण</th>
        </tr>
      </thead>
      <tbody>${statusRows}</tbody>
    </table>
  </div>` : ''}

  ${complaint.attendanceLog.length > 0 ? `
  <div class="section">
    <div class="section-title">Attendance Log / उपस्थिति लॉग</div>
    <table>
      <thead>
        <tr>
          <th>Attended By / उपस्थित</th>
          <th>Date / तिथि</th>
          <th>Time / समय</th>
          <th>Remarks / टिप्पणी</th>
        </tr>
      </thead>
      <tbody>${attendanceRows}</tbody>
    </table>
  </div>` : ''}

  <div class="footer">
    <div>
      <div class="signature-box">Applicant Signature / आवेदक हस्ताक्षर</div>
    </div>
    <div>
      <div class="signature-box">Officer Signature / अधिकारी हस्ताक्षर</div>
    </div>
    <div>
      <div class="signature-box">Station Seal / थाना मुहर</div>
    </div>
  </div>

  <div class="watermark">
    Generated on ${new Date().toLocaleString('en-IN')} | PS Sadar Bazar Application Box - UP Police
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
