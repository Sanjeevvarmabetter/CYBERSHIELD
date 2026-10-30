import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from backend.app.database.models.models import Incident

def generate_evidence_assistance_pdf(incident: Incident) -> bytes:
    """
    Generate an official Evidence Assistance PDF Report for a citizen incident.
    Contains incident metadata, narrative, evidence inventory with SHA-256 hashes,
    and authoritative Indian reporting instructions (1930 / cybercrime.gov.in).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0B132B'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#3A506B'),
        spaceAfter=15
    )

    heading2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1C2541'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#222222')
    )

    mono_style = ParagraphStyle(
        'MonoText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#333333')
    )

    notice_style = ParagraphStyle(
        'NoticeText',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#555555')
    )

    story = []

    # Header / Title
    story.append(Paragraph("CYBERSHIELD DIGITAL CRIME INTELLIGENCE PLATFORM", title_style))
    story.append(Paragraph("OFFICIAL INCIDENT EVIDENCE & ASSISTANCE REPORT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#00B4D8'), spaceAfter=12))

    # Incident Overview Table
    meta = incident.metadata_json or {}
    overview_data = [
        [
            Paragraph("<b>Reference Code:</b>", body_style),
            Paragraph(f"<font color='#0077B6'><b>{incident.reference_code}</b></font>", body_style)
        ],
        [
            Paragraph("<b>Category:</b>", body_style),
            Paragraph(incident.category.replace('_', ' '), body_style)
        ],
        [
            Paragraph("<b>Submission Date:</b>", body_style),
            Paragraph(incident.created_at.strftime('%Y-%m-%d %H:%M:%S UTC'), body_style)
        ],
        [
            Paragraph("<b>Triage Status:</b>", body_style),
            Paragraph(incident.status, body_style)
        ],
        [
            Paragraph("<b>Reporting Mode:</b>", body_style),
            Paragraph("Anonymous Citizen Submission" if incident.is_anonymous else "Registered Citizen", body_style)
        ]
    ]
    t_overview = Table(overview_data, colWidths=[130, 400])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 12))

    # Narrative / Description
    story.append(Paragraph("INCIDENT CHRONOLOGY & NARRATIVE", heading2_style))
    story.append(Paragraph(f"<b>Title:</b> {incident.title}", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(incident.description.replace('\n', '<br/>'), body_style))
    story.append(Spacer(1, 14))

    # Evidence Inventory Table (with SHA-256 hashes)
    story.append(Paragraph("DIGITAL EVIDENCE INVENTORY & CRYPTOGRAPHIC HASHES", heading2_style))
    evidence_rows = [
        [
            Paragraph("<b>File / Item Name</b>", body_style),
            Paragraph("<b>Size</b>", body_style),
            Paragraph("<b>SHA-256 Cryptographic Hash</b>", body_style)
        ]
    ]

    if incident.evidence_items:
        for ev in incident.evidence_items:
            size_kb = f"{ev.file_size / 1024:.1f} KB"
            evidence_rows.append([
                Paragraph(ev.file_name, body_style),
                Paragraph(size_kb, body_style),
                Paragraph(ev.sha256_hash, mono_style)
            ])
    else:
        evidence_rows.append([
            Paragraph("No uploaded binary files attached.", body_style),
            Paragraph("—", body_style),
            Paragraph("Incident text and metadata preserved in database.", body_style)
        ])

    t_evidence = Table(evidence_rows, colWidths=[150, 60, 320])
    t_evidence.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_evidence)
    story.append(Spacer(1, 14))

    # Suspicious Indicators Involved
    indicators = meta.get("indicators_involved", [])
    if indicators:
        story.append(Paragraph("RECORDED THREAT INDICATORS", heading2_style))
        for ind in indicators:
            story.append(Paragraph(f"• <font face='Courier'>{ind}</font>", body_style))
        story.append(Spacer(1, 10))

    # Legal Disclaimer & Emergency Guidance
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=10, spaceAfter=10))
    story.append(Paragraph("OFFICIAL REPORTING ASSISTANCE & LEGAL DISCLAIMER", heading2_style))
    disclaimer_text = (
        "<b>Important Notice:</b> CYBERSHIELD is an educational and analytical assistance platform. "
        "This document is an assistance summary containing evidence integrity hashes (SHA-256) intended to "
        "aid victims in submitting formal complaints to official law enforcement agencies.<br/><br/>"
        "• <b>National Cyber Crime Reporting Portal:</b> https://cybercrime.gov.in<br/>"
        "• <b>National Financial Cyber Fraud Helpline (Immediate Fund Freeze):</b> Dial <b>1930</b><br/>"
        "• <b>Emergency Police Services:</b> Dial <b>112</b><br/><br/>"
        "This report is generated automatically by CYBERSHIELD based on citizen input. "
        "It does not constitute a judicial certificate or legal determination of guilt."
    )
    story.append(Paragraph(disclaimer_text, notice_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
