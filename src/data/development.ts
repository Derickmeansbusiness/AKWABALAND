/**
 * Development framework — the auxiliary page. Deliberately free of dates,
 * areas, capital values and returns: none are verified. See sources.ts.
 */
export const development = {
  title: 'Development Framework',
  intro: 'Akwaba-Land is at concept development stage. The framework below describes how the proposition is intended to move from concept to delivery. Every step is subject to feasibility, approvals and the decisions of the relevant authorities and partners.',
  stages: [
    {
      id: 'concept',
      label: 'Concept development',
      status: 'current' as const,
      body: 'Vision, experience architecture, cultural programme and this presentation. Engagement with potential UAE and African stakeholders begins here.',
    },
    {
      id: 'feasibility',
      label: 'Feasibility',
      status: 'next' as const,
      body: 'Market, site, operational and financial studies by independent advisers. Nothing in this presentation pre-empts their findings.',
    },
    {
      id: 'masterplan',
      label: 'Masterplanning & design',
      status: 'future' as const,
      body: 'Appointment of an international design team. Site-specific masterplan, cultural content strategy and sustainability framework.',
    },
    {
      id: 'approvals',
      label: 'Approvals & partnerships',
      status: 'future' as const,
      body: 'Land, planning and operating approvals in the UAE; participation agreements with African nations and cultural institutions.',
    },
    {
      id: 'delivery',
      label: 'Phased delivery',
      status: 'future' as const,
      body: 'A phased programme opening the core destination first, with pavilion, hospitality and network expansion to follow.',
    },
  ],
  components: [
    'Pan-African Heritage Hall',
    'Hall of Heroes & Kingdoms',
    'African Nations Pavilion District',
    'African Literature & Comics Library',
    'Children’s Fortress',
    'Living Traditions district',
    'Afro-Culinary District',
    'Grand Cultural Performance Arena',
    'Hospitality & diplomatic reception',
    'Ceremonial axis, water and landscape',
  ],
  principles: [
    { label: 'Cultural integrity', body: 'Content developed with African institutions, scholars and practitioners. Nothing is staged as stereotype.' },
    { label: 'Architectural quality', body: 'A contemporary, climate-responsive language built to the standard of the UAE’s leading cultural developments.' },
    { label: 'Commercial resilience', body: 'Diversified revenue across admissions, hospitality, events, education, publishing and IP, so no single stream carries the destination.' },
    { label: 'Inclusive participation', body: 'Every African nation invited on equal terms; the pavilion model grows as nations join.' },
  ],
  disclaimer: 'Concept development. Confidential presentation. Subject to feasibility, approvals and development. No statement here constitutes an offer, a commitment or an indication of endorsement by any government or institution.',
} as const;

export const briefing = {
  title: 'Private Briefing',
  intro: 'Akwaba-Land is being introduced through private briefings to UAE leadership offices, sovereign and family investors, developers, tourism and cultural authorities, and African ministries of culture and tourism.',
  formats: ['In-person presentation', 'Boardroom walkthrough of this experience', 'Written concept note'],
  fields: ['Name', 'Organisation', 'Role', 'Email', 'Nature of interest'],
  interestOptions: ['UAE leadership / government', 'Sovereign or family investment', 'Development partner', 'Tourism or cultural authority', 'African ministry or institution', 'Other'],
  note: 'Requests are reviewed personally. No material is sent without a conversation first.',
} as const;

export const downloads = {
  title: 'Downloads',
  intro: 'Documents are released to briefed parties only.',
  items: [
    { id: 'concept-note', label: 'Concept note', status: 'on-request' as const, description: 'Twelve pages. The proposition, the cultural programme, the development framework.' },
    { id: 'presentation', label: 'Boardroom presentation', status: 'on-request' as const, description: 'The visual sequence of this site, for offline use.' },
  ],
  note: 'Nothing on this page is publicly downloadable by design.',
} as const;
