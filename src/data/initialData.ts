import {
  UserProfile,
  FriendRequest,
  ChatThread,
  ChatMessage,
  AppNotification,
  AlumniEvent,
  EventReservation,
  Announcement,
  Opportunity,
  JobApplication,
  Chapter,
  CareerMilestone,
  GalleryItem,
  AuditLogEntry,
  AutomationJob,
  CareerSurveyResponse,
  DatabaseBackupSnapshot,
  InstitutionalFeedPost
} from '../types';

/**
 * Official Seed Accounts for St. Cecilia's College Deployment
 * Pristine, verified credentials for every system role.
 */
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'usr_superadmin_cecilia',
    name: 'Dr. Emmanuel C. Salcedo',
    email: 'superadmin@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'superadmin',
    batch: '2010',
    course: 'PhD in Educational Technology & Systems Administration',
    location: 'St. Cecilia’s Executive Complex, Minglanilla, Cebu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'Executive Systems Administrator & Chief Information Officer',
    about: 'Chief system architect overseeing data governance, emergency administrative controls, platform security, and digital longevity for the St. Cecilia’s College network.',
    phone: '+63 917 111 2001',
    employeeId: 'SCC-SUP-001',
    department: 'Office of the Executive President & IT Directorate',
    isVerified: true,
    followersCount: 28,
    followingCount: 14,
    connectionsCount: 12,
    experience: [
      {
        id: 'exp_exec_1',
        title: 'Executive Director of Institutional Technology',
        company: 'St. Cecilia’s College - Cebu, Inc.',
        location: 'Executive Campus',
        startDate: '2015-06',
        current: true,
        description: 'Directing enterprise infrastructure, multi-role RBAC architecture, and centenary archives.'
      }
    ],
    education: [
      {
        id: 'edu_exec_1',
        degree: 'Doctor of Philosophy in Educational Technology & Systems',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Educational Systems',
        startYear: '2006',
        endYear: '2010',
        honors: 'Summa Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_admin_cecilia',
    name: 'Prof. Teresa B. Carreon',
    email: 'admin@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'admin',
    batch: '2014',
    course: 'Master of Arts in Educational Management',
    location: 'St. Cecilia’s Campus, Administration Hall',
    profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'Director of Alumni Affairs & Institutional Advancement',
    about: 'Leading global alumni engagement, campus reunions, regional chapter charters, and institutional endowments at St. Cecilia’s College.',
    phone: '+63 917 222 3002',
    employeeId: 'SCC-ADM-002',
    department: 'Institutional Advancement & Alumni Operations',
    isVerified: true,
    followersCount: 45,
    followingCount: 26,
    connectionsCount: 24,
    experience: [
      {
        id: 'exp_adm_1',
        title: 'Director of Alumni Relations',
        company: 'St. Cecilia’s College',
        location: 'Administration Hall',
        startDate: '2017-04',
        current: true,
        description: 'Managing alumni engagement initiatives, corporate accreditation, and institutional development.'
      }
    ],
    education: [
      {
        id: 'edu_adm_1',
        degree: 'Master of Arts in Educational Management',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Educational Management',
        startYear: '2010',
        endYear: '2014',
        honors: 'Magna Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_registrar_cecilia',
    name: 'Atty. Dominic R. Villacarlos',
    email: 'registrar@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'registrar',
    batch: '2015',
    course: 'Bachelor of Laws (LL.B.) / Records Management',
    location: 'St. Cecilia’s Campus, Office of the University Registrar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'University Registrar • Academic Masterlist & Verification Authority',
    about: 'Primary authority for graduation archives, student ID verifications, academic masterlist maintenance, commencement diplomas, and registration dispute resolutions.',
    phone: '+63 917 333 4003',
    employeeId: 'SCC-REG-003',
    department: 'Office of the University Registrar',
    isVerified: true,
    followersCount: 32,
    followingCount: 18,
    connectionsCount: 16,
    experience: [
      {
        id: 'exp_reg_1',
        title: 'Head University Registrar',
        company: 'St. Cecilia’s College',
        location: 'Registrar Hall',
        startDate: '2018-02',
        current: true,
        description: 'Directing the academic registry, student record verifications, and graduation certifications.'
      }
    ],
    education: [
      {
        id: 'edu_reg_1',
        degree: 'Bachelor of Laws (LL.B.) & Records Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Law & Records',
        startYear: '2011',
        endYear: '2015',
        honors: 'Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_staff_cecilia',
    name: 'Bernadette M. Castro',
    email: 'staff@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'staff',
    batch: '2019',
    course: 'BS in Hospitality Management',
    location: 'St. Cecilia’s Campus, Student & Alumni Activity Center',
    profilePictureUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    headline: 'Alumni Affairs Logistics Officer & Campus Event Coordinator',
    about: 'Coordinating event logistics for grand reunions, campus assemblies, attendee check-ins, regional chapter meetups, and campus gallery curation.',
    phone: '+63 917 444 5004',
    employeeId: 'SCC-STF-004',
    department: 'Campus Operations, Logistics & Regional Chapters',
    isVerified: true,
    followersCount: 48,
    followingCount: 32,
    connectionsCount: 30,
    experience: [
      {
        id: 'exp_stf_1',
        title: 'Events & Logistics Coordinator',
        company: 'St. Cecilia’s College',
        location: 'Campus Activity Center',
        startDate: '2020-01',
        current: true,
        description: 'Managing alumni reunions, operational announcements, and regional chapter coordination.'
      }
    ],
    education: [
      {
        id: 'edu_stf_1',
        degree: 'Bachelor of Science in Hospitality Management',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Hospitality Management',
        startYear: '2015',
        endYear: '2019'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_moderator_cecilia',
    name: 'Engr. Christian Dave Oporto',
    email: 'moderator@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'moderator',
    batch: '2020',
    course: 'BS in Information Technology',
    location: 'Minglanilla / Talisay City, Cebu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    headline: 'Community Standards & Career Placement Review Officer',
    about: 'Dedicated to community safety, reviewing job opportunities and employer listings, ensuring compliance with institutional standards, and moderating public discussions.',
    phone: '+63 917 555 6005',
    employeeId: 'SCC-MOD-005',
    department: 'Community Standards & Career Placement Bureau',
    isVerified: true,
    followersCount: 35,
    followingCount: 22,
    connectionsCount: 20,
    experience: [
      {
        id: 'exp_mod_1',
        title: 'Community Standards Officer',
        company: 'St. Cecilia’s College Alumni Council',
        location: 'Minglanilla, Cebu',
        startDate: '2021-03',
        current: true,
        description: 'Reviewing job postings, moderating discussion forums, and resolving community reports.'
      }
    ],
    education: [
      {
        id: 'edu_mod_1',
        degree: 'Bachelor of Science in Information Technology',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Information Technology',
        startYear: '2016',
        endYear: '2020'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_employer_cecilia',
    name: 'Celeste V. Ramirez',
    email: 'employer@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'employer',
    batch: 'N/A',
    course: 'Corporate Industry Partner',
    location: 'Cebu IT Park, Lahug, Cebu City',
    profilePictureUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    headline: 'VP of Global Talent Acquisition • MetroCebu InnovateCorp',
    about: 'Official accredited recruitment partner actively hiring St. Cecilia’s College graduates in engineering, cloud infrastructure, and business development.',
    phone: '+63 32 388 9200',
    company: 'MetroCebu InnovateCorp',
    industry: 'Software Engineering & Digital Transformation',
    employerVerificationStatus: 'verified',
    employerStatus: 'active',
    employerExpirationDate: '2028-12-31T23:59:59.000Z',
    canPostJobs: true,
    isVerified: true,
    followersCount: 62,
    followingCount: 15,
    connectionsCount: 30,
    experience: [],
    education: [],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_alumni_cecilia_01',
    name: 'Julian Marc S. Villareal',
    email: 'alumni@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'alumni',
    batch: '2023',
    course: 'BS in Information Technology',
    studentId: 'SCC-2019-1082',
    alumniId: 'SCC-ALUM-2023-1082',
    location: 'Cebu City, Philippines',
    profilePictureUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    headline: 'Lead Full-Stack Cloud Engineer • Archipelagic Systems • Class of 2023',
    about: 'BSIT 2023 Magna Cum Laude graduate specializing in distributed cloud infrastructure, microservices, and Kubernetes. Passionate mentor in the Cecilian coding community.',
    phone: '+63 917 777 8007',
    company: 'Archipelagic Cloud Systems',
    currentPosition: 'Lead Full-Stack Cloud Engineer',
    industry: 'Cloud Computing & IT',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 52,
    followingCount: 38,
    connectionsCount: 35,
    experience: [
      {
        id: 'exp_julian_1',
        title: 'Lead Full-Stack Cloud Engineer',
        company: 'Archipelagic Cloud Systems',
        location: 'Cebu Business Park',
        startDate: '2023-08',
        current: true,
        description: 'Architecting scalable cloud architectures, multi-region database clusters, and automated DevOps workflows.'
      }
    ],
    education: [
      {
        id: 'edu_julian_1',
        degree: 'Bachelor of Science in Information Technology',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Information Technology',
        startYear: '2019',
        endYear: '2023',
        honors: 'Magna Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_alumni_cecilia_02',
    name: 'Patricia Mae G. Solon',
    email: 'patricia.solon@alumni.stcecilia.edu.ph',
    password: 'Password123!',
    role: 'alumni',
    batch: '2022',
    course: 'BS in Business Administration',
    studentId: 'SCC-2018-0541',
    alumniId: 'SCC-ALUM-2022-0541',
    location: 'Talisay City, Cebu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    headline: 'Senior Investment Portfolio Analyst • Metro Cebu Capital • Class of 2022',
    about: 'BSBA 2022 alumna leading financial modeling, regional venture capital appraisals, and enterprise portfolio analysis.',
    phone: '+63 928 888 9008',
    company: 'Metro Cebu Capital Partners',
    currentPosition: 'Senior Financial Analyst',
    industry: 'Finance & Investment',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 40,
    followingCount: 30,
    connectionsCount: 26,
    experience: [
      {
        id: 'exp_patricia_1',
        title: 'Senior Financial Analyst',
        company: 'Metro Cebu Capital Partners',
        location: 'Cebu City',
        startDate: '2022-09',
        current: true,
        description: 'Conducting valuation models and investment portfolio tracking for infrastructure and tech investments.'
      }
    ],
    education: [
      {
        id: 'edu_patricia_1',
        degree: 'Bachelor of Science in Business Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Business Administration (Financial Management)',
        startYear: '2018',
        endYear: '2022',
        honors: 'Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr_alumni_cecilia_03',
    name: 'Anton Luis K. Del Rosario',
    email: 'anton.delrosario@alumni.stcecilia.edu.ph',
    password: 'Password123!',
    role: 'alumni',
    batch: '2024',
    course: 'BS in Computer Engineering',
    studentId: 'SCC-2020-0319',
    alumniId: 'SCC-ALUM-2024-0319',
    location: 'Cebu City, Philippines',
    profilePictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    headline: 'Firmware & Robotics Systems Engineer • Lexmark R&D • Class of 2024',
    about: 'BSCpE 2024 graduate working on low-power IoT microcontrollers, firmware security, and robotic device drivers.',
    phone: '+63 930 999 0009',
    company: 'Lexmark Research & Development',
    currentPosition: 'Embedded Firmware Engineer',
    industry: 'Hardware & Embedded Systems',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 32,
    followingCount: 24,
    connectionsCount: 22,
    experience: [
      {
        id: 'exp_anton_1',
        title: 'Embedded Firmware Engineer',
        company: 'Lexmark Research & Development',
        location: 'Cebu Business Park',
        startDate: '2024-05',
        current: true,
        description: 'Writing low-level C/C++ firmware and real-time operating system kernel modules.'
      }
    ],
    education: [
      {
        id: 'edu_anton_1',
        degree: 'Bachelor of Science in Computer Engineering',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Computer Engineering',
        startYear: '2020',
        endYear: '2024',
        honors: 'With Honors'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];
export const INITIAL_CHATS: ChatThread[] = [];
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_EVENTS: AlumniEvent[] = [
  {
    id: 'evt_grand_homecoming_2026',
    title: 'ALUMNI HOMECOMING 2026',
    tagline: 'Reconnect. Remember. Rebuild the Alumni Community.',
    type: 'reunion',
    startDate: '2026-12-12T17:00:00.000Z',
    endDate: '2026-12-12T22:00:00.000Z',
    startTime: '5:00 PM',
    endTime: '10:00 PM',
    heroImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    eventImages: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
    ],
    isVirtual: false,
    isImportant: true,
    isFeaturedReservation: true,
    location: 'University Alumni Center, Minglanilla Campus',
    venue: 'University Alumni Center',
    description: 'The premier annual gathering of all Cecilian graduates! Reconnect with classmates, honor jubilarians, celebrate milestone achievements, and participate in the grand alumni banquet with live orchestral performances.',
    organizerId: 'usr_admin_cecilia',
    organizerName: 'Office of Alumni Affairs',
    maxParticipants: 200,
    reservedSeatsCount: 147,
    maxGuestsPerAlumni: 2,
    registrationOpenDate: '2026-11-01T00:00:00.000Z',
    registrationCloseDaysBefore: 11,
    calculatedDeadline: '2026-12-01T23:59:59.000Z',
    reservationNotice: 'Reservations are open until December 1, 2026. Please complete your reservation before the deadline. Registration may close earlier if all available seats are reserved.',
    enableWaitingList: true,
    autoConfirm: true,
    emailNotificationEnabled: true,
    attendeesCount: 147,
    attendees: [
      {
        uid: 'usr_alumni_cecilia_01',
        name: 'Julian Marc S. Villareal',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        batch: '2023',
        course: 'BS in Information Technology',
        role: 'alumni',
        registeredAt: '2026-09-10T14:20:00.000Z'
      },
      {
        uid: 'usr_alumni_cecilia_02',
        name: 'Patricia Mae G. Solon',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        batch: '2022',
        course: 'BS in Business Administration',
        role: 'alumni',
        registeredAt: '2026-09-12T09:15:00.000Z'
      },
      {
        uid: 'usr_alumni_cecilia_03',
        name: 'Anton Luis K. Del Rosario',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        batch: '2024',
        course: 'BS in Computer Engineering',
        role: 'alumni',
        registeredAt: '2026-09-15T11:00:00.000Z'
      }
    ],
    likes: ['usr_alumni_cecilia_01', 'usr_alumni_cecilia_02'],
    comments: [
      {
        id: 'cmt_evt_1',
        authorId: 'usr_alumni_cecilia_01',
        authorName: 'Julian Marc S. Villareal',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        text: 'Excited to see Batch 2023 and reunite with faculty mentors!',
        timestamp: '2026-09-16T08:30:00.000Z'
      }
    ]
  },
  {
    id: 'evt_sports_festival_2026',
    title: 'Alumni Sports Festival',
    tagline: 'Friendship, Athletics, and Cecilian Camaraderie',
    type: 'social',
    startDate: '2026-11-20T08:00:00.000Z',
    endDate: '2026-11-20T17:00:00.000Z',
    startTime: '8:00 AM',
    endTime: '5:00 PM',
    heroImageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    isVirtual: false,
    location: 'University Sports Complex',
    venue: 'University Sports Complex & Gymnasium',
    description: 'An action-packed day of basketball, volleyball, badminton, and friendly campus athletics between alumni batches, faculty, and graduating seniors.',
    organizerId: 'usr_staff_cecilia',
    organizerName: 'Alumni Sports & Recreation Committee',
    maxParticipants: 150,
    reservedSeatsCount: 125,
    maxGuestsPerAlumni: 1,
    registrationOpenDate: '2026-10-15T00:00:00.000Z',
    registrationCloseDaysBefore: 8,
    calculatedDeadline: '2026-11-12T23:59:59.000Z',
    reservationNotice: 'Reservations close 8 days before the event. Less than 20% of capacity remains.',
    enableWaitingList: true,
    autoConfirm: true,
    emailNotificationEnabled: true,
    attendeesCount: 125,
    attendees: [
      {
        uid: 'usr_alumni_cecilia_01',
        name: 'Julian Marc S. Villareal',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        batch: '2023',
        course: 'BS in Information Technology',
        role: 'alumni',
        registeredAt: '2026-09-20T10:00:00.000Z'
      }
    ],
    likes: ['usr_alumni_cecilia_02'],
    comments: []
  },
  {
    id: 'evt_tech_leadership_2026',
    title: 'Cecilian Tech Leadership & AI Forum',
    tagline: 'Navigating Next-Gen Technology, Engineering, and Innovation',
    type: 'workshop',
    startDate: '2026-11-15T13:00:00.000Z',
    endDate: '2026-11-15T18:00:00.000Z',
    startTime: '1:00 PM',
    endTime: '6:00 PM',
    heroImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    isVirtual: true,
    location: 'SCC Innovation Center & Virtual Hybrid',
    venue: 'SCC Innovation Center',
    description: 'Senior tech leads, CTOs, and founders from Silicon Valley, Singapore, and Manila share cutting-edge strategies in artificial intelligence, cloud architecture, and technical leadership.',
    organizerId: 'usr_admin_cecilia',
    organizerName: 'SCC Alumni Tech Council',
    maxParticipants: 100,
    reservedSeatsCount: 100,
    maxGuestsPerAlumni: 1,
    registrationOpenDate: '2026-10-01T00:00:00.000Z',
    registrationCloseDaysBefore: 5,
    calculatedDeadline: '2026-11-10T23:59:59.000Z',
    reservationNotice: 'Event is at 100% capacity. You may join the waiting list to automatically receive an alert if seats open.',
    enableWaitingList: true,
    autoConfirm: false,
    emailNotificationEnabled: true,
    attendeesCount: 100,
    attendees: [],
    likes: ['usr_alumni_cecilia_01'],
    comments: []
  },
  {
    id: 'evt_legacy_breakfast_2026',
    title: 'Senior Alumni Legacy Breakfast & Fellowship',
    tagline: 'Honoring Generations of Cecilian Pioneers and Leaders',
    type: 'networking',
    startDate: '2026-10-02T07:30:00.000Z',
    endDate: '2026-10-02T10:30:00.000Z',
    startTime: '7:30 AM',
    endTime: '10:30 AM',
    heroImageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80',
    isVirtual: false,
    location: 'St. Cecilia Executive Dining Hall',
    venue: 'St. Cecilia Executive Dining Hall',
    description: 'An intimate morning banquet dedicated to pioneer graduates, legacy donors, and institutional founders. Registration deadline was September 22, 2026.',
    organizerId: 'usr_admin_cecilia',
    organizerName: 'Office of the President & Alumni Affairs',
    maxParticipants: 60,
    reservedSeatsCount: 52,
    maxGuestsPerAlumni: 1,
    registrationOpenDate: '2026-08-15T00:00:00.000Z',
    registrationCloseDaysBefore: 10,
    calculatedDeadline: '2026-09-22T23:59:59.000Z',
    reservationNotice: 'Registration is closed. The deadline of September 22, 2026 has passed.',
    enableWaitingList: false,
    autoConfirm: true,
    emailNotificationEnabled: true,
    attendeesCount: 52,
    attendees: [],
    likes: [],
    comments: []
  },
  {
    id: 'evt_networking_cebu_2026',
    title: 'Cebu IT Park & Metro Professionals Mixer',
    tagline: 'High-Impact Networking Across Industries and Generations',
    type: 'networking',
    startDate: '2026-11-28T18:30:00.000Z',
    endDate: '2026-11-28T21:30:00.000Z',
    startTime: '6:30 PM',
    endTime: '9:30 PM',
    heroImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
    isVirtual: false,
    location: 'Sky Lounge, Cebu Business Park, Cebu City',
    venue: 'Sky Lounge, Cebu Business Park',
    description: 'Casual networking evening for Cecilian professionals in technology, corporate management, entrepreneurship, and public service. Free cocktails and alumni directory networking.',
    organizerId: 'usr_staff_cecilia',
    organizerName: 'Metro Cebu Alumni Chapter',
    maxParticipants: 80,
    reservedSeatsCount: 42,
    maxGuestsPerAlumni: 1,
    registrationOpenDate: '2026-10-01T00:00:00.000Z',
    registrationCloseDaysBefore: 3,
    calculatedDeadline: '2026-11-25T23:59:59.000Z',
    reservationNotice: 'Reservations open until November 25, 2026. Complimentary badge and drink tickets provided upon check-in.',
    enableWaitingList: true,
    autoConfirm: true,
    emailNotificationEnabled: true,
    attendeesCount: 42,
    attendees: [],
    likes: ['usr_alumni_cecilia_01'],
    comments: []
  }
];

export const INITIAL_RESERVATIONS: EventReservation[] = [
  {
    id: 'ALM-2026-00125',
    eventId: 'evt_grand_homecoming_2026',
    eventTitle: 'ALUMNI HOMECOMING 2026',
    eventDate: '2026-12-12T17:00:00.000Z',
    eventTime: '5:00 PM – 10:00 PM',
    eventVenue: 'University Alumni Center, Minglanilla Campus',
    userId: 'usr_alumni_cecilia_01',
    alumniName: 'Julian Marc S. Villareal',
    email: 'alumni@stcecilia.edu.ph',
    contactNumber: '+63 917 777 8007',
    alumniId: 'SCC-ALUM-2023-1082',
    graduationYear: '2023',
    course: 'BS in Information Technology',
    numberOfGuests: 1,
    totalSeats: 2,
    dietaryRequirements: 'Vegetarian Option Preferred',
    specialRequests: 'Seating near Batch 2023 IT table',
    status: 'confirmed',
    reservedAt: '2026-09-10T14:20:00.000Z',
    qrCodeData: 'SCC-PASS-ALM-2026-00125-EVT-HOMECOMING-2026'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_homecoming_official_2026',
    title: 'Official 2026 Grand Alumni Homecoming & Jubilarian Honors',
    content: 'St. Cecilia’s College cordially invites all batches to the 2026 Grand Alumni Homecoming on October 24, 2026. Special commemorative medals will be conferred upon the Silver and Pearl Jubilarians. Register your batch delegation via the Events tab.',
    category: 'Institutional',
    authorId: 'usr_admin_cecilia',
    authorName: 'Office of Alumni Affairs',
    authorRole: 'admin',
    publishedAt: '2026-09-20T08:00:00.000Z',
    urgent: true,
    important: true,
    likes: 42,
    commentsCount: 9,
    pinned: true,
    views: 310
  },
  {
    id: 'ann_tracer_study_ched_2026',
    title: 'CHED & PACUCOA Graduate Tracer Study: Update Your Trajectory',
    content: 'All verified Cecilian graduates are requested to complete the CHED Institutional Tracer Record. Your prompt response helps St. Cecilia’s College maintain PACUCOA Level III accreditation and secure national student scholarship grants.',
    category: 'Academic',
    authorId: 'usr_registrar_cecilia',
    authorName: 'Office of the Registrar',
    authorRole: 'registrar',
    publishedAt: '2026-09-18T10:30:00.000Z',
    urgent: false,
    important: true,
    likes: 28,
    commentsCount: 4,
    pinned: true,
    views: 245
  },
  {
    id: 'ann_innovation_grants_2026',
    title: 'Call for Proposals: SCC Alumni Innovation & Startup Seed Fund',
    content: 'The St. Cecilia’s College Endowment Foundation has launched a ₱250,000 seed grant program for alumni-led tech ventures, educational platforms, and community social enterprises. Applications close on November 15, 2026.',
    category: 'Career',
    authorId: 'usr_admin_cecilia',
    authorName: 'College Administration & Research Board',
    authorRole: 'admin',
    publishedAt: '2026-09-14T09:15:00.000Z',
    urgent: false,
    important: false,
    likes: 35,
    commentsCount: 6,
    pinned: false,
    views: 189
  },
  {
    id: 'ann_library_archive_access',
    title: 'Lifetime Campus Library & Online Research Portal Access for Alumni',
    content: 'Active alumni are granted lifetime digital access to EBSCO, IEEE Xplore, and the St. Cecilia’s College Virtual Research Repository. Simply activate your digital alumni credential on the Profile page.',
    category: 'Campus Advisories',
    authorId: 'usr_registrar_cecilia',
    authorName: 'Library & Archival Records',
    authorRole: 'registrar',
    publishedAt: '2026-09-10T11:00:00.000Z',
    urgent: false,
    important: false,
    likes: 19,
    commentsCount: 2,
    pinned: false,
    views: 160
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_fullstack_lexmark',
    title: 'Senior Full-Stack Web Application Engineer',
    type: 'Full-time',
    company: 'Lexmark Research & Development Corp.',
    location: 'Cebu Business Park, Cebu City (Hybrid)',
    description: 'Join our cloud platforms team building enterprise-grade print management and cloud microservices using React, Node.js, and TypeScript. Cecilian alumni referrals given priority screening.',
    requirements: [
      '3+ years professional experience with TypeScript, React, and REST APIs',
      'Knowledge of cloud containerization (Docker, Kubernetes)',
      'BS in Computer Engineering, Computer Science, or Information Technology'
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    salaryOrStipend: '₱55,000 - ₱85,000 / month',
    postedByUid: 'usr_admin_cecilia',
    postedByName: 'Lexmark Alumni Partner Network',
    postedAt: '2026-09-18T08:00:00.000Z',
    deadline: '2026-10-31T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'careers@lexmark-cebu.com'
  },
  {
    id: 'opp_systems_analyst_accenture',
    title: 'Business Systems & Operations Analyst',
    type: 'Full-time',
    company: 'Accenture Technology Solutions',
    location: 'Cebu IT Park, Lahug, Cebu City',
    description: 'Seeking proactive analysts to evaluate financial workflows, streamline ERP integrations, and present predictive dashboards to multinational clients.',
    requirements: [
      'Degree in BSBA, Information Systems, or related field',
      'Strong proficiency in data analytics and process mapping',
      'Excellent verbal and written English communication skills'
    ],
    skills: ['Business Analysis', 'Excel / PowerBI', 'Process Optimization', 'ERP'],
    salaryOrStipend: '₱42,000 - ₱65,000 / month',
    postedByUid: 'usr_employer_cecilia',
    postedByName: 'Celeste V. Ramirez (MetroCebu InnovateCorp)',
    postedAt: '2026-09-16T10:00:00.000Z',
    deadline: '2026-11-15T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'talent@metrocebu.ph'
  },
  {
    id: 'opp_junior_frontend_appcraft',
    title: 'Junior Cloud & Web Platform Developer',
    type: 'Full-time',
    company: 'Archipelagic Cloud Systems',
    location: 'Minglanilla / Cebu City (Flexible Hybrid)',
    description: 'Fast-growing cloud software studio founded by SCC graduates hiring motivated junior developers to craft clean web apps with Tailwind CSS, React, and TypeScript.',
    requirements: [
      'Demonstrated portfolio or capstone projects in React / JavaScript',
      'Enthusiasm for UI craftsmanship, responsive layouts, and user experience',
      'BSIT or BSCpE fresh graduates encouraged to apply'
    ],
    skills: ['React', 'Tailwind CSS', 'TypeScript', 'Git'],
    salaryOrStipend: '₱35,000 - ₱48,000 / month',
    postedByUid: 'usr_alumni_cecilia_01',
    postedByName: 'Julian Marc S. Villareal (Alumni Referral)',
    postedAt: '2026-09-19T14:30:00.000Z',
    deadline: '2026-10-25T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'careers@archipelagic.ph'
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap_cebu_south',
    name: 'Southern Cebu Regional Chapter',
    region: 'Minglanilla, Talisay, Naga & San Fernando',
    leadName: 'Bernadette M. Castro',
    leadEmail: 'staff@stcecilia.edu.ph',
    memberCount: 84,
    meetingFrequency: 'Quarterly',
    description: 'Active chapter supporting community outreach, high school mentorship, and regional alumni get-togethers in Southern Cebu.'
  },
  {
    id: 'chap_metro_cebu',
    name: 'Metro Cebu Professional Chapter',
    region: 'Cebu City, Mandaue & Lapu-Lapu',
    leadName: 'Patricia Mae G. Solon',
    leadEmail: 'patricia.solon@alumni.stcecilia.edu.ph',
    memberCount: 142,
    meetingFrequency: 'Bi-monthly',
    description: 'Network of Cecilians working across Cebu IT Park, Cebu Business Park, and BPO/tech industries.'
  },
  {
    id: 'chap_overseas',
    name: 'Global Cecilians Diaspora Chapter',
    region: 'International (North America, Middle East, Asia-Pacific)',
    leadName: 'Prof. Teresa B. Carreon',
    leadEmail: 'admin@stcecilia.edu.ph',
    memberCount: 56,
    meetingFrequency: 'Semi-annual Virtual',
    description: 'Global chapter connecting overseas Filipino Cecilians, sponsoring scholarship endowments, and international study partnerships.'
  }
];
export const INITIAL_MILESTONES: CareerMilestone[] = [];
export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_deploy_init',
    timestamp: new Date().toISOString(),
    action: 'System Initialized for Production',
    actorId: 'usr_superadmin_cecilia',
    actorName: 'Dr. Emmanuel C. Salcedo',
    actorRole: 'superadmin',
    category: 'admin',
    details: 'St. Cecilia’s College Alumni Portal initialized with fresh official accounts for each role.',
    severity: 'success',
    ipAddress: '127.0.0.1'
  }
];

export const INITIAL_AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: 'job_reg_verifier',
    name: 'Automatic Alumni Registrar Verification & Approval',
    category: 'alumni',
    description: 'Matches incoming registrations against accredited St. Cecilia’s College registrar records and auto-approves verified graduates.',
    lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'active',
    triggerCount: 1,
    frequency: 'Instant / Event-Driven',
    nextRun: 'Listening on new registration'
  },
  {
    id: 'job_profile_completer',
    name: 'Missing Profile & Employment Update Reminders',
    category: 'alumni',
    description: 'Identifies accounts with missing employment data and delivers automated completion prompts.',
    lastRun: new Date(Date.now() - 3600000 * 26).toISOString(),
    status: 'active',
    triggerCount: 0,
    frequency: 'Weekly on Mondays',
    nextRun: new Date(Date.now() + 3600000 * 48).toISOString()
  }
];

export const INITIAL_CAREER_SURVEYS: CareerSurveyResponse[] = [];
export const INITIAL_BACKUPS: DatabaseBackupSnapshot[] = [];

export const INITIAL_FEED_POSTS: InstitutionalFeedPost[] = [
  {
    id: 'post_alumni_launch_2026',
    authorId: 'usr_alumni_cecilia_01',
    authorName: 'Julian Marc S. Villareal',
    authorRole: 'alumni',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    postType: 'milestone',
    title: 'Hybrid Cloud Architecture Milestone & Gratitude to CCS Faculty',
    content: 'Proud to announce that our team at Archipelagic Cloud Systems successfully deployed the nationwide distributed cloud infrastructure! Forever grateful to St. Cecilia’s College CCS mentors for instilling rigorous engineering principles and hands-on laboratory discipline. Looking forward to catching up with Batch 2023 at the Homecoming!',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    milestoneBadge: 'Cloud Architecture Launch',
    likes: ['usr_alumni_cecilia_02', 'usr_alumni_cecilia_03', 'usr_admin_cecilia'],
    hearts: ['usr_alumni_cecilia_02', 'usr_alumni_cecilia_03', 'usr_admin_cecilia'],
    comments: [
      {
        id: 'comm_init_1',
        authorId: 'usr_admin_cecilia',
        authorName: 'Prof. Teresa B. Carreon',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        authorRole: 'admin',
        text: 'Congratulations, Julian! St. Cecilia’s is proud of your engineering leadership in the national tech ecosystem.',
        createdAt: '2026-09-21T09:30:00.000Z'
      },
      {
        id: 'comm_init_2',
        authorId: 'usr_alumni_cecilia_02',
        authorName: 'Patricia Mae G. Solon',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorRole: 'alumni',
        text: 'So inspiring Julian! See you at the alumni gala in December! 🎉',
        createdAt: '2026-09-21T11:15:00.000Z'
      }
    ],
    sharesCount: 5,
    isPinned: true,
    tags: ['ClassOf2023', 'TechInnovation', 'CecilianPride'],
    createdAt: '2026-09-21T08:00:00.000Z'
  },
  {
    id: 'post_alumni_finance_award',
    authorId: 'usr_alumni_cecilia_02',
    authorName: 'Patricia Mae G. Solon',
    authorRole: 'alumni',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    postType: 'milestone',
    title: 'Senior Portfolio Analyst of the Year Award',
    content: 'Honored to receive the 2026 Regional Investment Analyst Excellence Award at Metro Cebu Capital Partners. A warm shout-out to my College of Business Administration mentors who taught us ethical financial modeling and value investing principles.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    milestoneBadge: 'Industry Excellence Award',
    likes: ['usr_alumni_cecilia_01', 'usr_admin_cecilia'],
    hearts: ['usr_alumni_cecilia_01', 'usr_admin_cecilia'],
    comments: [],
    sharesCount: 3,
    isPinned: false,
    tags: ['Finance', 'Batch2022', 'Leadership'],
    createdAt: '2026-09-19T14:20:00.000Z'
  },
  {
    id: 'post_homecoming_heritage_hall',
    authorId: 'usr_staff_cecilia',
    authorName: 'Bernadette M. Castro',
    authorRole: 'staff',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    postType: 'gallery',
    title: 'Grand Alumni Homecoming 2026 Preparations Underway!',
    content: 'The renovated Alumni Heritage Complex and Centennial Courtyard are officially ready to welcome alumni batches home this December. Early check-in badges and commemorative souvenir tokens are now prepared. Make sure to reserve your entry pass in the events tab!',
    imageUrl: '/assets/landing-building-1.jpg',
    milestoneBadge: 'Campus Homecoming',
    likes: ['usr_alumni_cecilia_01', 'usr_alumni_cecilia_02', 'usr_alumni_cecilia_03'],
    hearts: ['usr_alumni_cecilia_01', 'usr_alumni_cecilia_02', 'usr_alumni_cecilia_03'],
    comments: [
      {
        id: 'comm_init_3',
        authorId: 'usr_alumni_cecilia_03',
        authorName: 'Anton Luis K. Del Rosario',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorRole: 'alumni',
        text: 'The new campus lighting looks stunning. Batch 2024 is definitely attending!',
        createdAt: '2026-09-18T16:45:00.000Z'
      }
    ],
    sharesCount: 8,
    isPinned: false,
    tags: ['Homecoming2026', 'CampusHeritage', 'CecilianAlumni'],
    createdAt: '2026-09-18T10:00:00.000Z'
  }
];

