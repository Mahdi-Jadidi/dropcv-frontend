const API_BASE = 'https://drop-rfrnac6z3-dropcv.vercel.app';

const MOCK_DISCOVERY_PROFILES = [
  {
    userId: 101,
    slug: 'mahdi-jadidi',
    fullName: 'Mahdi Jadidi',
    headline: 'Senior Cardiologist',
    jobTitle: 'Cardiologist',
    company: 'Tehran Heart Center',
    city: 'Tehran',
    country: 'United States',
    industry: 'Medicine',
    seniority: 'Senior',
    years_of_experience: '10+ years',
    skills: ['Cardiology', 'Patient Care', 'Diagnostics', 'Clinical Research'],
    open_to_work: true,
    contactLocked: true,
    email: 'mahdi@example.com',
    phone: '+1 (555) 010-1101',
  },
  {
    userId: 102,
    slug: 'lina-haddad',
    fullName: 'Lina Haddad',
    headline: 'UX Designer',
    jobTitle: 'Product Designer',
    company: 'Northstar Studio',
    city: 'Dubai',
    country: 'United Arab Emirates',
    industry: 'Design',
    seniority: 'Mid-Level',
    years_of_experience: '5-10 years',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'Research'],
    open_to_work: true,
    contactLocked: true,
    email: 'lina@example.com',
    phone: '+971 50 555 0192',
  },
  {
    userId: 103,
    slug: 'alex-chen',
    fullName: 'Alex Chen',
    headline: 'Staff Software Engineer',
    jobTitle: 'Engineering Lead',
    company: 'Cloud Atlas',
    city: 'San Francisco',
    country: 'United States',
    industry: 'Technology',
    seniority: 'Lead/Principal',
    years_of_experience: '10+ years',
    skills: ['TypeScript', 'Distributed Systems', 'Node.js', 'React'],
    open_to_work: false,
    contactLocked: true,
    email: 'alex@example.com',
    phone: '+1 (555) 010-1103',
  },
  {
    userId: 104,
    slug: 'sara-rahimi',
    fullName: 'Sara Rahimi',
    headline: 'Architectural Project Manager',
    jobTitle: 'Architect',
    company: 'Blueprint Atelier',
    city: 'Tehran',
    country: 'Iran',
    industry: 'Architecture',
    seniority: 'Senior',
    years_of_experience: '5-10 years',
    skills: ['BIM', 'Project Planning', 'AutoCAD', 'Client Presentations'],
    open_to_work: true,
    contactLocked: true,
    email: 'sara@example.com',
    phone: '+98 21 5555 0194',
  },
  {
    userId: 105,
    slug: 'omar-saleh',
    fullName: 'Omar Saleh',
    headline: 'Finance Director',
    jobTitle: 'Finance Director',
    company: 'Summit Ventures',
    city: 'London',
    country: 'United Kingdom',
    industry: 'Finance',
    seniority: 'Executive',
    years_of_experience: '10+ years',
    skills: ['FP&A', 'Forecasting', 'M&A', 'Leadership'],
    open_to_work: false,
    contactLocked: true,
    email: 'omar@example.com',
    phone: '+44 20 7946 0105',
  },
  {
    userId: 106,
    slug: 'aya-nakamura',
    fullName: 'Aya Nakamura',
    headline: 'Education Program Manager',
    jobTitle: 'Program Manager',
    company: 'BrightPath Academy',
    city: 'Singapore',
    country: 'Singapore',
    industry: 'Education',
    seniority: 'Senior',
    years_of_experience: '3-5 years',
    skills: ['Curriculum Design', 'Operations', 'Community Building'],
    open_to_work: true,
    contactLocked: true,
    email: 'aya@example.com',
    phone: '+65 6123 4567',
  },
];

function toLower(value) {
  return String(value || '').toLowerCase();
}

function getMockDiscoveryProfiles() {
  const user = window.currentUser || null;
  const userProfile = user && user.profile ? user.profile : null;
  const currentUserProfile = user ? {
    userId: user.userId || user.id || 100,
    slug: user.slug || 'you',
    fullName: user.fullName || user.name || 'You',
    headline: userProfile?.headline || userProfile?.jobTitle || user.headline || '',
    jobTitle: userProfile?.jobTitle || user.jobTitle || user.role || '',
    company: userProfile?.company || user.company || '',
    city: userProfile?.city || user.city || '',
    country: userProfile?.country || user.country || '',
    industry: userProfile?.industry || user.industry || '',
    seniority: userProfile?.seniority || user.seniority || '',
    years_of_experience: userProfile?.years_of_experience || userProfile?.yearsOfExperience || user.yearsOfExperience || '',
    skills: Array.isArray(userProfile?.skills) ? userProfile.skills : [],
    open_to_work: userProfile?.open_to_work !== false,
    contactLocked: true,
    email: user.email || '',
    phone: user.phone || '',
  } : null;

  return currentUserProfile ? [currentUserProfile, ...MOCK_DISCOVERY_PROFILES] : MOCK_DISCOVERY_PROFILES.slice();
}

function profileMatchesQuery(profile, params) {
  const query = toLower(params.q);
  if (query) {
    const haystack = [
      profile.fullName,
      profile.headline,
      profile.jobTitle,
      profile.company,
      profile.city,
      profile.country,
      profile.industry,
      profile.seniority,
      (profile.skills || []).join(' '),
    ].join(' ');
    if (!toLower(haystack).includes(query)) {
      return false;
    }
  }

  const filters = [
    ['industry', 'industry'],
    ['seniority', 'seniority'],
    ['country', 'country'],
  ];

  for (const [key, field] of filters) {
    const value = params[key];
    if (value && toLower(profile[field]) !== toLower(value)) {
      return false;
    }
  }

  const openToWork = params.openToWork;
  if (openToWork !== undefined && openToWork !== null && openToWork !== '') {
    const desired = String(openToWork).toLowerCase() === 'true';
    if (!!profile.open_to_work !== desired) return false;
  }

  const availability = params.availability;
  if (availability && toLower(availability) === 'immediately' && !profile.open_to_work) {
    return false;
  }

  return true;
}

function sortMockProfiles(profiles, sortBy) {
  const value = toLower(sortBy || 'newest');
  const list = profiles.slice();
  if (value === 'alphabetical') {
    list.sort((a, b) => String(a.fullName || '').localeCompare(String(b.fullName || '')));
  } else if (value === 'open to work first' || value === 'opentoworkfirst') {
    list.sort((a, b) => Number(!!b.open_to_work) - Number(!!a.open_to_work) || String(a.fullName || '').localeCompare(String(b.fullName || '')));
  } else if (value === 'most experienced first') {
    list.sort((a, b) => {
      const experienceRank = (profile) => {
        const years = toLower(profile.years_of_experience);
        if (years.includes('10+')) return 4;
        if (years.includes('5-10')) return 3;
        if (years.includes('3-5')) return 2;
        if (years.includes('1-3')) return 1;
        return 0;
      };
      return experienceRank(b) - experienceRank(a) || String(a.fullName || '').localeCompare(String(b.fullName || ''));
    });
  } else {
    list.sort((a, b) => Number(b.userId || 0) - Number(a.userId || 0));
  }
  return list;
}

function paginateMockProfiles(params = {}) {
  const limit = Math.max(1, Math.min(48, Number(params.limit || 12) || 12));
  const page = Math.max(1, Number(params.page || 1) || 1);
  const filtered = sortMockProfiles(
    getMockDiscoveryProfiles().filter((profile) => profileMatchesQuery(profile, params)),
    params.sortBy
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    profiles: filtered.slice(start, start + limit),
    total,
    totalPages,
  };
}

function getMockDiscoveryProfile(slug) {
  const profile = getMockDiscoveryProfiles().find((item) => String(item.slug || '').toLowerCase() === String(slug || '').toLowerCase());
  return profile || null;
}

window.dropCVApi = {
  // Core request method
  async request(method, path, body = null, isFormData = false) {
    const options = {
      method,
      credentials: 'include',
      headers: {},
    };

    if (body && !isFormData) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    if (body && isFormData) {
      options.body = body;
    }

    try {
      const res = await fetch(API_BASE + path, options);
      const data = await res.json().catch(() => null);

      return {
        ok: res.ok,
        status: res.status,
        data,
        error: !res.ok ? (data?.error || 'Request failed') : null,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'Network error — is the server running?',
      };
    }
  },

  // Auth
  async getMe() {
    return this.request('GET', '/api/auth/me');
  },
  async login(email, password) {
    return this.request('POST', '/api/auth/login', { email, password });
  },
  async register(payload) {
    return this.request('POST', '/api/auth/register', payload);
  },
  async logout() {
    return this.request('POST', '/api/auth/logout');
  },

  // Upload
  async uploadSiteFiles(file) {
    const form = new FormData();
    form.append('site', file);
    return this.request('POST', '/api/upload/files', form, true);
  },
  async uploadCV(file) {
    const form = new FormData();
    form.append('cv', file);
    return this.request('POST', '/api/upload/cv', form, true);
  },
  async uploadStory(storyData) {
    return this.request('POST', '/api/upload/story', storyData);
  },
  async getDeploymentStatus(deploymentId) {
    return this.request('GET', `/api/upload/status/${deploymentId}`);
  },

  // Discovery
  async searchProfiles(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        qs.set(key, value);
      }
    });
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.request('GET', `/api/discovery/search${query}`);
  },
  async getProfile(slug) {
    return this.request('GET', `/api/discovery/profile/${slug}`);
  },
  async unlockContact(candidateUserId) {
    return this.request('POST', `/api/discovery/unlock/${candidateUserId}`);
  },

  // Analytics
  async trackPageView(domainSlug) {
    return this.request('POST', '/api/analytics/track', {
      domainSlug,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
    });
  },
  async getContextSlug() {
    const host = window.location.hostname || '';
    const match = host.match(/^([a-z0-9\-]+)\.drop\.cv$/i);
    return match ? match[1] : null;
  },
  async trackVisitFromContext() {
    const slug = await this.getContextSlug();
    if (!slug) {
      return { ok: true, skipped: true };
    }

    return this.trackPageView(slug);
  },
  async getAnalyticsDashboard() {
    return this.request('GET', '/api/analytics/dashboard');
  },

  // Recruiter
  async getProjects() {
    return this.request('GET', '/api/recruiter/projects');
  },
  async createProject(data) {
    return this.request('POST', '/api/recruiter/projects', data);
  },
  async getProject(id) {
    return this.request('GET', `/api/recruiter/projects/${id}`);
  },
  async updateProject(id, data) {
    return this.request('PATCH', `/api/recruiter/projects/${id}`, data);
  },
  async deleteProject(id) {
    return this.request('DELETE', `/api/recruiter/projects/${id}`);
  },
  async addToShortlist(projectId, candidateUserId) {
    return this.request('POST', '/api/recruiter/shortlist', {
      projectId,
      candidateUserId,
    });
  },
  async removeFromShortlist(projectId, candidateUserId) {
    return this.request('DELETE', `/api/recruiter/shortlist/${projectId}/${candidateUserId}`);
  },
  async getShortlist(projectId) {
    return this.request('GET', `/api/recruiter/shortlist/${projectId}`);
  },

  // Auth state helper
  async getCurrentUser() {
    const res = await this.getMe();
    if (res.ok && res.data?.user) {
      return res.data.user;
    }
    return null;
  },
};

Object.assign(window.dropCVApi, {
  async searchProfiles(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        qs.set(key, value);
      }
    });
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await window.dropCVApi.request('GET', `/api/discovery/search${query}`);
    if (res.ok || res.status !== 404) {
      return res;
    }

    return {
      ok: true,
      status: 200,
      data: paginateMockProfiles(params),
      error: null,
    };
  },

  async getProfile(slug) {
    const res = await window.dropCVApi.request('GET', `/api/discovery/profile/${slug}`);
    if (res.ok || res.status !== 404) {
      return res;
    }

    const profile = getMockDiscoveryProfile(slug);
    if (!profile) {
      return {
        ok: false,
        status: 404,
        data: null,
        error: 'Profile not found',
      };
    }

    return {
      ok: true,
      status: 200,
      data: { profile },
      error: null,
    };
  },

  async unlockContact(candidateUserId) {
    const res = await window.dropCVApi.request('POST', `/api/discovery/unlock/${candidateUserId}`);
    if (res.ok || res.status !== 404) {
      return res;
    }

    const profile = getMockDiscoveryProfiles().find((item) => String(item.userId) === String(candidateUserId));
    if (!profile) {
      return {
        ok: false,
        status: 404,
        data: null,
        error: 'Candidate not found',
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        contact: {
          name: profile.fullName,
          email: profile.email || '',
          phone: profile.phone || '',
          linkedin: '',
        },
      },
      error: null,
    };
  },
});
