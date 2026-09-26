import { SampleContract } from '../types';

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'commercial-lease',
    title: 'Commercial Office Lease Agreement',
    category: 'Real Estate / Commercial',
    riskExpectation: 'high',
    description: 'Contains predatory landlord terms: uncapped indemnity, automatic 3-year renewal, immediate lockout without notice, and undefined common area expenses.',
    text: `COMMERCIAL OFFICE LEASE AGREEMENT

This Commercial Lease Agreement ("Lease") is entered into as of October 1, 2024, by and between APEX REALTY HOLDINGS LLC ("Landlord") and NEXUS DIGITAL INNOVATIONS INC. ("Tenant").

1. PREMISES & TERM. Landlord leases to Tenant Suite 400 located at 100 Financial Tower. The initial term is thirty-six (36) months commencing November 1, 2024.

2. BASE RENT & ESCALATIONS. Tenant shall pay base monthly rent of $12,500.00 in advance on the first day of each calendar month. Rent shall automatically escalate by 8% annually without notice or landlord justification.

3. SECURITY DEPOSIT & FORFEITURE. Tenant shall deposit $37,500.00 as security. In the event Tenant commits any breach of this Lease, Landlord may retain the entire security deposit as liquidated damages without prejudice to any additional damage claims.

4. INDEMNIFICATION & LIABILITY. Tenant agrees to indemnify, defend, protect, and hold harmless Landlord, its agents, contractors, and employees from and against any and all claims, liabilities, losses, damages, costs, and expenses (including unlimited legal fees) arising from or relating to the Premises, regardless of whether caused in whole or in part by the negligence or willful misconduct of Landlord.

5. MAINTENANCE & REPAIRS. Tenant shall, at its sole cost, maintain, repair, and replace all HVAC, plumbing, structural beams, and roof membranes servicing the Premises. Major repairs are subject to Clause 17.

6. ADDITIONAL OPERATING EXPENSES. Tenant shall pay its proportionate share of Common Area Charges, Administrative Handling Premiums, and Unallocated Capital Surcharges as billed monthly by Landlord at Landlord's sole unreviewed discretion.

7. DEFAULT & IMMEDIATE RE-ENTRY. If Tenant fails to pay rent within twenty-four (24) hours of due date, Landlord may immediately re-enter, change door locks, seize Tenant's equipment and trade fixtures, and declare all remaining rent for the entire 36-month term immediately due and payable without judicial process or notice.

8. ASSIGNMENT & SUBLETTING. Tenant shall not assign, sublet, or transfer this Lease under any circumstances. Any change in Tenant's corporate ownership exceeding 10% shall be deemed a material breach entitling Landlord to immediate lease termination.

9. AUTOMATIC RENEWAL. Unless Tenant gives written notice of non-renewal by certified mail at least one hundred eighty (180) days prior to lease expiration, this Lease shall automatically renew for a successive three (3) year term at 150% of the then-current monthly rent.

10. GOVERNING LAW & JURISDICTION. This Lease shall be governed by the laws of the State of Delaware. Tenant waives all rights to trial by jury, class action participation, and counterclaims in any dispute arising under this Agreement.`
  },
  {
    id: 'freelance-services',
    title: 'Master Independent Contractor Agreement',
    category: 'Consulting / Tech / IP',
    riskExpectation: 'critical',
    description: 'Extreme IP overreach claiming all past and future inventions, 24-month worldwide non-compete, pay-when-paid clause, and uncapped liability.',
    text: `MASTER INDEPENDENT CONTRACTOR & IP ASSIGNMENT AGREEMENT

This Agreement is entered into between VELOCITY GLOBAL ENTERPRISES ("Company") and JANE DOE ("Contractor").

1. SERVICES & MILESTONES. Contractor shall perform software engineering, architecture, and consulting services as set forth in written statements of work.

2. PAYMENT & PAY-WHEN-PAID. Company shall pay Contractor $95.00 per hour. However, payment to Contractor is strictly contingent upon Company receiving full payment from its end client. In no event shall Company be liable to Contractor if the end client delays or refuses payment for any reason whatsoever.

3. INTELLECTUAL PROPERTY & ALL INVENTIONS ASSIGNMENT. Contractor irrevocably transfers and assigns to Company all right, title, and interest in and to any and all inventions, code, designs, algorithms, patents, and copyrights authored or conceived by Contractor at any time in Contractor's life, whether created during or outside business hours, and whether or not related to Company's business.

4. NON-COMPETE & RESTRICTIVE COVENANTS. For a period of twenty-four (24) months following termination of this Agreement for any reason, Contractor shall not directly or indirectly engage in, advise, consult with, or be employed by any entity operating in the software, digital, or technology industries anywhere in the world.

5. UNLIMITED INDEMNIFICATION. Contractor agrees to defend and hold harmless Company from any third-party claims, bugs, security vulnerabilities, or code defects arising from the services, and shall bear all legal costs and damages with no limitation of liability.

6. TERMINATION AT WILL. Company may terminate this Agreement at any time with immediate effect without cause and without payment for unbilled hours. Contractor must give ninety (90) days advance written notice prior to terminating this Agreement.`
  },
  {
    id: 'residential-tenancy',
    title: 'Residential Tenancy Agreement',
    category: 'Residential Lease',
    riskExpectation: 'high',
    description: 'Planted trap clauses: forfeiture of security deposit for ordinary wear, unrestricted landlord entry, automatic renewal without notice, and silent waiver of statutory habitability.',
    text: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement is entered into between SUNSET PROPERTY MANAGEMENT ("Landlord") and JOHN DOE ("Tenant").

1. TERM OF LEASE. The lease begins on January 1, 2025 and ends December 31, 2025.

2. RENT PAYMENTS. Tenant agrees to pay $2,400 per month, payable strictly on the first of each month. Late payments past the 2nd day incur a $250 late penalty plus $25 per additional day.

3. SECURITY DEPOSIT. Tenant provides a deposit of $4,800. Landlord reserves the right to withhold the entire deposit for any repainting, carpet cleaning, or standard wear-and-tear upon move-out at Landlord's sole appraisal.

4. LANDLORD ACCESS & INSPECTIONS. Landlord or its designees may enter the leased premises at any time, 24 hours a day, without prior notice, for inspections, showings, or maintenance.

5. MAINTENANCE RESPONSIBILITY. Tenant is solely responsible for all maintenance, repairs, heating equipment, hot water systems, and pest extermination regardless of cause or pre-existing conditions.

6. GUESTS & OCCUPANCY. No overnight guest may stay in the premises for more than one (1) consecutive night or three (3) total nights per year without prior written consent of Landlord and payment of an overnight guest surcharge of $50 per night.

7. AUTOMATIC ROLLOVER. If neither party provides 60 days notice, this lease automatically converts into a binding 12-month fixed renewal at an escalated rate determined by Landlord.`
  },
  {
    id: 'mutual-nda',
    title: 'Standard Mutual Non-Disclosure Agreement',
    category: 'Corporate / Confidentiality',
    riskExpectation: 'low',
    description: 'A standard, well-balanced mutual NDA with bilateral protections, standard exclusions, a 2-year sunset term, and balanced dispute resolution.',
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made and entered into as of January 15, 2025, by and between ACME VENTURES INC. and STARLIGHT SYSTEMS CORP.

1. PURPOSE. The parties wish to explore a potential business relationship and may exchange confidential technical, financial, and business information.

2. DEFINITION OF CONFIDENTIAL INFORMATION. "Confidential Information" means all non-public information disclosed by one party ("Disclosing Party") to the other ("Receiving Party") that is marked as confidential or would reasonably be understood as confidential given the nature of the information.

3. EXCLUSIONS FROM CONFIDENTIALITY. Confidential Information does not include information that: (a) is or becomes publicly known through no breach of Receiving Party; (b) was already in Receiving Party's possession prior to disclosure without confidentiality restriction; (c) is independently developed without reference to Disclosing Party's information; or (d) is received rightfully from a third party.

4. OBLIGATIONS & STANDARD OF CARE. Each party agrees to protect the other's Confidential Information with the same degree of care it uses for its own confidential information of like nature, but no less than reasonable care.

5. TERM & SUNSET. This Agreement and the confidentiality obligations herein shall remain in effect for a period of two (2) years from the date of disclosure.

6. RETURN OR DESTRUCTION OF MATERIALS. Upon written request of Disclosing Party, Receiving Party shall promptly return or certify destruction of all copies of Confidential Information.

7. REMEDIES & GOVERNING LAW. The parties acknowledge that unauthorized disclosure may cause irreparable harm for which damages would be inadequate. This Agreement is governed by the laws of the State of New York, without regard to conflicts of law principles.`
  }
];
