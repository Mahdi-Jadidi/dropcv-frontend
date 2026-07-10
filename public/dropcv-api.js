const API_BASE = (() => {
  const configured = window.dropCVConfig && typeof window.dropCVConfig.apiBaseUrl === 'string'
    ? window.dropCVConfig.apiBaseUrl.trim().replace(/\/$/, '')
    : '';

  if (configured) {
    return configured;
  }

  const host = window.location.hostname || '';
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return '';
  }

  return '';
})();

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
        error: 'Network error â€” is the server running?',
      };
    }
  },

  // Auth
  async getMe() {
    return this.request('GET', '/api/users/me');
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
  async getPlans() {
    return this.request('GET', '/api/plans');
  },

  // Upload
  async uploadCV(file, options = {}) {
    const form = new FormData();
    form.append('cv', file);
    const mode = String(options.mode || 'convert').toLowerCase() === 'regenerate' ? 'regenerate' : 'convert';
    return this.request('POST', `/api/upload/cv?mode=${encodeURIComponent(mode)}`, form, true);
  },
  async uploadStory(storyData, options = {}) {
    const mode = String(options.mode || 'convert').toLowerCase() === 'regenerate' ? 'regenerate' : 'convert';
    return this.request('POST', `/api/upload/story?mode=${encodeURIComponent(mode)}`, storyData);
  },
  async uploadSite(input, extraFields = {}) {
    const form = new FormData();

    let files = [];
    let fields = extraFields || {};

    if (input && typeof input === 'object' && !Array.isArray(input) && !(typeof File !== 'undefined' && input instanceof File) && !(typeof Blob !== 'undefined' && input instanceof Blob)) {
      if (input.file) {
        files = [input.file];
      } else if (input.files) {
        files = Array.from(input.files);
      }

      if (input.fields && typeof input.fields === 'object') {
        fields = input.fields;
      } else if (Object.keys(extraFields || {}).length === 0) {
        fields = input.fields || {};
      }
    } else if (Array.isArray(input)) {
      files = input;
    } else if (input) {
      files = [input];
    }

    files.filter(Boolean).forEach((file) => {
      form.append('site', file, file?.name || undefined);
    });

    Object.entries(fields || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        form.append(key, value.join(', '));
        return;
      }

      form.append(key, String(value));
    });

    return this.request('POST', '/api/sites/upload', form, true);
  },
  async getDeploymentStatus(deploymentId) {
    return this.request('GET', `/api/upload/status/${deploymentId}`);
  },
  async getPreview(deploymentId) {
    return this.request('GET', `/api/preview/${deploymentId}`);
  },
  async updatePreview(deploymentId, data) {
    return this.request('PATCH', `/api/preview/${deploymentId}`, data);
  },
  async requestPayment(plan) {
    return this.request('POST', '/api/payments/request', { plan });
  },
  getDashboardUrl(plan) {
    return String(plan) === 'Premium'
      ? 'dashboard-premium.html'
      : 'dashboard-standard.html';
  },
  async unpublishSite(deploymentId) {
    return this.request('POST', `/api/sites/${deploymentId}/unpublish`);
  },
  async publishSite(deploymentId) {
    return this.request('POST', `/api/sites/${deploymentId}/publish`);
  },
  async getConversionUsage() {
    return this.request('GET', '/api/users/conversion-usage');
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
    const hostMatch = host.match(/^([a-z0-9\-]+)\.drop\.cv$/i);
    if (hostMatch) {
      return hostMatch[1];
    }

    const pathMatch = window.location.pathname.match(/^\/site\/([a-z0-9-]+)(?:\/|$)/i);
    return pathMatch ? pathMatch[1] : null;
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

  // Auth state helper
  async getCurrentUser() {
    const res = await this.getMe();
    if (res.ok && res.data?.user) {
      return res.data.user;
    }
    return null;
  },
};
