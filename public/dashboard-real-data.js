  function currentFile() {
    return location.pathname.split('/').pop();
  }

  function isDashboardFile() {
    return /dashboard-(basic|pro|premium|recruiter)\.html$/.test(currentFile());
  }

  function getPrimaryDomain(user) {
    var domains = Array.isArray(user && user.domains) ? user.domains : [];
    return domains.find(function (d) { return d.is_primary; }) || domains[0] || null;
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function setHref(selector, href) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.setAttribute('href', href);
    });
  }

  function setDashboardReady() {
    var content = document.getElementById('dashboardContent');
    if (!content) return;
    content.classList.remove('auth-pending');
    content.classList.add('auth-ready');
  }

  function getUserUrl(user) {
    var domain = getPrimaryDomain(user);
    return (domain && domain.full_url) || (user && user.slug ? user.slug + '.drop.cv' : '');
  }

  async function getCurrentUserFromSharedAuth() {
    if (window.dropCV && typeof window.dropCV.initAuth === 'function') {
      return await window.dropCV.initAuth();
    }
    if (typeof initAuth === 'function') {
      return await initAuth();
    }
    return null;
  }

  function renderDomainRows(domains) {
    var domainList = document.getElementById('domainList');
    if (!domainList) return;

    if (!domains.length) {
      domainList.innerHTML = '<div class="empty-state"><p>No active domains yet.</p></div>';
      return;
    }

    domainList.innerHTML = domains.map(function (d) {
      var fullUrl = d.full_url || (d.slug ? d.slug + '.drop.cv' : '');
      return [
        '<div class="domain-row">',
          '<span class="domain-url">' + fullUrl + '</span>',
          d.is_primary ? '<span class="badge badge-green">Primary</span>' : '',
          '<span class="live-dot-green"></span>',
          '<button class="btn-sm" type="button" data-copy-domain="' + fullUrl + '">Copy</button>',
          '<a href="https://' + fullUrl + '" target="_blank" rel="noreferrer" class="btn-sm">Visit →</a>',
        '</div>',
      ].join('');
    }).join('');

    domainList.querySelectorAll('[data-copy-domain]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-copy-domain');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(function () {});
        }
      });
    });
  }

  async function loadAnalytics() {
    var chartCanvas = document.getElementById('page-views-chart');
    if (!chartCanvas && !document.getElementById('totalViews') && !document.getElementById('viewsThisWeek')) {
      return;
    }

    var res = await window.dropCVApi.getAnalyticsDashboard();
    if (!res.ok || !res.data) {
      return;
    }

    var data = res.data;
    var totals = {
      totalViews: data.totalViews,
      viewsThisWeek: data.viewsThisWeek,
      uniqueVisitors: data.uniqueVisitors,
      bestDay: data.bestDay || '—'
    };

    Object.keys(totals).forEach(function (key) {
      var el = document.getElementById(key);
      if (el) {
        var val = totals[key];
        el.textContent = (val === null || val === undefined) ? '0' : String(val);
      }
    });

    var referrerTable = document.getElementById('referrerTable');
    if (referrerTable && Array.isArray(data.topReferrers)) {
      referrerTable.innerHTML = data.topReferrers.map(function (row) {
        return '<tr><td>' + (row.referrer || 'Direct') + '</td><td>' + row.count + '</td></tr>';
      }).join('');
    }

    var countriesList = document.getElementById('countriesList');
    if (countriesList && Array.isArray(data.topCountries)) {
      countriesList.innerHTML = data.topCountries.map(function (row) {
        return '<div class="country-row"><span>' + row.country + '</span><span>' + row.count + ' views</span></div>';
      }).join('');
    }

    if (chartCanvas && window.Chart && Array.isArray(data.viewsLast7Days)) {
      var labels = data.viewsLast7Days.map(function (row) {
        return new Date(row.date).toLocaleDateString('en', { weekday: 'short' });
      });
      var counts = data.viewsLast7Days.map(function (row) { return row.count; });

      if (window.__dropcvViewsChart) {
        window.__dropcvViewsChart.destroy();
      }

      window.__dropcvViewsChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Page Views',
            data: counts,
            backgroundColor: 'rgba(15, 110, 86, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#E0E0E0' }, ticks: { precision: 0 } },
            x: { grid: { display: false } },
          },
        },
      });
    }
  }

  function loadDeploymentStatus(user) {
    var statusHost = document.querySelector('[data-dropcv-status]');
    var currentStatusBlock = document.getElementById('site-current-status');
    var url = getUserUrl(user);

    if (document.getElementById('user-url')) {
      setText('#user-url, #userUrlChip, .user-url-chip', url);
    }
    if (url) {
      setHref('[data-user-url]', 'https://' + url);
    }

    if (statusHost && window.dropcvUpload) {
      window.dropcvUpload.renderStatusCard(statusHost, {
        visitHref: 'https://' + url,
        onGoToSite: function () {
          var siteLink = document.querySelector('.nav-link[data-section="site"]');
          if (siteLink) siteLink.click();
        }
      });
    }

    if (currentStatusBlock) {
      currentStatusBlock.style.display = url ? '' : 'none';
      var urlEl = document.getElementById('current-status-url');
      if (urlEl) urlEl.textContent = url;
      var updatedEl = document.getElementById('current-status-updated');
      if (updatedEl) updatedEl.textContent = 'Last updated: just now';
      var visitEl = document.getElementById('current-status-visit');
      if (visitEl) visitEl.href = url ? ('https://' + url) : '#';
    }
  }

  async function initProfessionalDashboard() {
    var user = await getCurrentUserFromSharedAuth();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    var allowedPlans = {
      'dashboard-basic.html': ['Basic'],
      'dashboard-pro.html': ['Pro'],
      'dashboard-premium.html': ['Premium']
    };
    var allowed = allowedPlans[currentFile()] || [];
    if (allowed.length && allowed.indexOf(user.plan) === -1) {
      window.location.href = window.dropCV.getDashboardUrl(user.plan);
      return;
    }

    window.currentUser = user;
    loadDeploymentStatus(user);

    var domains = Array.isArray(user.domains) ? user.domains : [];
    renderDomainRows(domains);

    if (typeof loadAnalytics === 'function') {
      await loadAnalytics();
    }

    if (typeof window.__dropcvAnalyticsLoaded === 'undefined') {
      window.__dropcvAnalyticsLoaded = true;
      window.loadAnalytics = loadAnalytics;
      window.initChart = loadAnalytics;
    }

    setDashboardReady();

    var siteLink = document.querySelector('.nav-link[data-section="site"]');
    if (siteLink) {
      siteLink.addEventListener('click', function () {
        setTimeout(function () { loadDeploymentStatus(window.currentUser || user); }, 0);
      });
    }
  }

  function mapRecruiterProject(row) {
    return {
      id: row.id,
      name: row.name,
      roleTitle: row.roleTitle || row.role_title || '',
      industry: row.industry || '',
      seniorityLevels: row.seniorityLevels || row.seniority_levels || [],
      skillsRequired: row.skillsRequired || row.skills_required || [],
      city: row.city || '',
      isRemote: !!row.isRemote,
      countries: row.countries || [],
      notes: row.notes || '',
      status: row.status || 'active',
      candidateCount: row.candidateCount || row.candidate_count || 0,
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
    };
  }

  function mapCandidate(row) {
    return {
      userId: row.userId || row.user_id,
      id: row.userId || row.user_id,
      name: row.fullName || row.full_name || row.name || '',
      title: row.jobTitle || row.job_title || row.headline || '',
      city: row.city || '',
      email: row.email || '',
      phone: row.phone || '',
      slug: row.slug || '',
      skills: row.skills || [],
      level: row.seniority || '',
      shortlistedAt: row.shortlistedAt || row.shortlisted_at || '',
      shortlistNotes: row.shortlistNotes || row.shortlist_notes || '',
      country: row.country || '',
    };
  }

  async function loadRecruiterProjects() {
    var res = await window.dropCVApi.getProjects();
    if (!res.ok) return [];
    return (res.data && res.data.projects) ? res.data.projects.map(mapRecruiterProject) : [];
  }

  async function loadRecruiterShortlists(projects) {
    var shortlists = {};
    await Promise.all((projects || []).map(async function (project) {
      var res = await window.dropCVApi.getShortlist(project.id);
      if (!res.ok) return;
      shortlists[project.id] = (res.data && res.data.candidates ? res.data.candidates : []).map(mapCandidate);
    }));
    return shortlists;
  }

  async function loadRecruiterCandidates() {
    var res = await window.dropCVApi.searchProfiles({ page: 1, limit: 48, sortBy: 'newest' });
    if (!res.ok) return [];
    return (res.data && res.data.profiles) ? res.data.profiles.map(function (row) {
      return {
        userId: row.userId,
        id: row.userId,
        name: row.fullName,
        title: row.headline || row.jobTitle || '',
        city: [row.city, row.country].filter(Boolean).join(', '),
        skills: row.skills || [],
        level: row.seniority || '',
      };
    }) : [];
  }

  async function initRecruiterDashboard() {
    var user = await getCurrentUserFromSharedAuth();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    if (user.plan !== 'Recruiter') {
      window.location.href = window.dropCV.getDashboardUrl(user.plan);
      return;
    }

    window.currentUser = user;
    loadDeploymentStatus(user);

    var projects = await loadRecruiterProjects();
    var shortlists = await loadRecruiterShortlists(projects);
    var candidates = await loadRecruiterCandidates();

    window.__dropcvProjects = projects;
    window.__dropcvShortlists = shortlists;
    window.__dropcvCandidates = candidates;

    window.loadProjects = function () {
      var grid = document.getElementById('projects-grid');
      if (!grid) return;
      if (!projects.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><p>No projects yet</p></div>';
        return;
      }
      grid.innerHTML = projects.map(function (project) {
        return '<div class="project-card" onclick="openProjectDetail(' + project.id + ')">' +
          '<div class="project-header">' +
            '<div class="project-name">' + project.name + '</div>' +
            '<span class="status-badge ' + project.status + '">' + project.status + '</span>' +
          '</div>' +
          '<div class="project-meta">' +
            '<div class="project-meta-item">📍 ' + (project.city || 'Remote') + '</div>' +
            '<div class="project-meta-item">💼 ' + (project.isRemote ? 'Remote' : 'On-site') + '</div>' +
          '</div>' +
          '<div class="project-date">Created: ' + (project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—') + '</div>' +
          '<div class="project-footer">' +
            '<span style="font-size: 14px; color: var(--color-gray-text);">' + project.candidateCount + ' candidates</span>' +
            '<span style="color: var(--color-purple); font-weight: 500;">Open →</span>' +
          '</div>' +
        '</div>';
      }).join('');
    };

    window.loadDiscoveryCandidates = function () {
      var container = document.getElementById('discovery-candidates');
      if (!container) return;
      if (!candidates.length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔎</div><p>No candidates found</p></div>';
        return;
      }
      container.innerHTML = candidates.map(function (candidate) {
        return '<div class="candidate-card">' +
          '<div class="candidate-avatar">' + (candidate.name ? candidate.name.split(' ').map(function (part) { return part[0] || ''; }).slice(0, 2).join('').toUpperCase() : '?') + '</div>' +
          '<div class="candidate-info">' +
            '<div class="candidate-name">' + candidate.name + '</div>' +
            '<div class="candidate-title">' + candidate.title + '</div>' +
            '<div class="candidate-location">📍 ' + candidate.city + '</div>' +
            '<div style="margin-top: 4px;">' + (candidate.skills || []).slice(0, 3).map(function (skill) {
              return '<span style="background: rgba(139, 92, 246, 0.1); color: var(--color-purple); padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">' + skill + '</span>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="candidate-actions">' +
            '<button class="btn btn-outline btn-sm" onclick="viewCandidateProfile(' + candidate.id + ')">View Profile</button>' +
          '</div>' +
        '</div>';
      }).join('');
    };

    window.loadShortlists = function () {
      var container = document.getElementById('shortlists-container');
      if (!container) return;
      if (!Object.keys(shortlists).length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⭐</div><p>No shortlisted candidates yet</p></div>';
        return;
      }
      container.innerHTML = Object.entries(shortlists).map(function (entry) {
        var projectId = entry[0];
        var candidatesForProject = entry[1];
        var project = projects.find(function (p) { return String(p.id) === String(projectId); });
        if (!project || !candidatesForProject.length) return '';
        return '<div class="shortlist-group">' +
          '<div class="shortlist-group-header">' +
            '<h3>' + project.name + '</h3>' +
            '<span style="color: var(--color-gray-text);">' + candidatesForProject.length + ' candidates</span>' +
          '</div>' +
          '<table class="shortlist-table">' +
            '<thead><tr><th>Candidate</th><th>Title</th><th>Location</th><th>Actions</th></tr></thead>' +
            '<tbody>' + candidatesForProject.map(function (candidate) {
              return '<tr>' +
                '<td><strong>' + candidate.name + '</strong></td>' +
                '<td>' + candidate.title + '</td>' +
                '<td>' + candidate.city + '</td>' +
                '<td><button class="btn btn-outline btn-sm" onclick="removeFromShortlist(' + project.id + ', ' + candidate.userId + ')">Remove</button></td>' +
              '</tr>';
            }).join('') + '</tbody>' +
          '</table>' +
        '</div>';
      }).join('');
    };

    window.openProjectDetail = async function (projectId) {
      var res = await window.dropCVApi.getProject(projectId);
      if (!res.ok || !res.data || !res.data.project) return;
      var project = mapRecruiterProject(res.data.project);
      var candidates = (res.data.candidates || []).map(mapCandidate);
      window.__dropcvCurrentProjectId = projectId;

      document.getElementById('project-detail-name').textContent = project.name || 'Project';
      document.getElementById('project-detail-status').textContent = project.status || 'active';
      document.getElementById('project-detail-status').className = 'status-badge ' + (project.status || 'active');
      document.getElementById('project-detail-dept').textContent = project.industry || '—';
      document.getElementById('project-detail-type').textContent = project.isRemote ? 'Remote' : 'Hybrid';
      document.getElementById('project-detail-location').textContent = project.city || 'Remote';
      document.getElementById('project-detail-level').textContent = (project.seniorityLevels && project.seniorityLevels[0]) || '—';
      document.getElementById('project-detail-salary').textContent = 'Not specified';
      document.getElementById('project-detail-date').textContent = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—';
      document.getElementById('project-detail-description').textContent = project.notes || 'No description';
      document.getElementById('project-notes').value = project.notes || '';
      document.getElementById('edit-status').value = project.status || 'active';
      document.getElementById('edit-description').value = project.notes || '';

      var container = document.getElementById('project-candidates');
      if (container) {
        container.innerHTML = candidates.length ? candidates.map(function (candidate) {
          return '<div class="candidate-card">' +
            '<div class="candidate-avatar">' + (candidate.name ? candidate.name.split(' ').map(function (part) { return part[0] || ''; }).slice(0, 2).join('').toUpperCase() : '?') + '</div>' +
            '<div class="candidate-info">' +
              '<div class="candidate-name">' + candidate.name + '</div>' +
              '<div class="candidate-title">' + candidate.title + '</div>' +
              '<div class="candidate-location">📍 ' + candidate.city + '</div>' +
            '</div>' +
            '<div class="candidate-actions"><button class="btn btn-primary btn-sm" onclick="addToShortlist(' + candidate.userId + ', ' + project.id + ')">+ Add to Shortlist</button></div>' +
          '</div>';
        }).join('') : '<div class="empty-state"><p>No candidates found</p></div>';
      }

      navigateToSection('project-detail');
    };

    window.addToShortlist = async function (candidateId, projectId) {
      var res = await window.dropCVApi.addToShortlist(projectId, candidateId);
      if (res.ok) {
        await initRecruiterDashboard();
        await window.openProjectDetail(projectId);
        return;
      }
      alert(res.error || 'Could not add candidate');
    };

    window.removeFromShortlist = async function (projectId, candidateId) {
      var res = await window.dropCVApi.removeFromShortlist(projectId, candidateId);
      if (res.ok) {
        await initRecruiterDashboard();
        loadShortlists();
        if (window.__dropcvCurrentProjectId) {
          await window.openProjectDetail(window.__dropcvCurrentProjectId);
        }
        return;
      }
      alert(res.error || 'Could not remove candidate');
    };

    window.createProject = async function () {
      var name = document.getElementById('new-project-name').value.trim();
      if (!name) {
        alert('Project name is required');
        return;
      }
      var payload = {
        name: name,
        roleTitle: document.getElementById('new-project-name').value.trim(),
        industry: document.getElementById('new-project-dept').value || null,
        seniorityLevels: [document.getElementById('new-project-level').value].filter(Boolean),
        city: document.getElementById('new-project-location').value || null,
        isRemote: (document.getElementById('new-project-location').value || '').toLowerCase() === 'remote',
        notes: document.getElementById('new-project-description').value || null,
      };
      var res = await window.dropCVApi.createProject(payload);
      if (!res.ok) {
        alert(res.error || 'Could not create project');
        return;
      }
      closeNewProjectModal();
      await initRecruiterDashboard();
      loadProjects();
    };

    window.saveProjectNotes = async function () {
      var projectId = window.__dropcvCurrentProjectId;
      if (!projectId) return;
      var res = await window.dropCVApi.updateProject(projectId, {
        notes: document.getElementById('project-notes').value,
      });
      if (!res.ok) alert(res.error || 'Could not save notes');
    };

    window.updateProject = async function () {
      var projectId = window.__dropcvCurrentProjectId;
      if (!projectId) return;
      var res = await window.dropCVApi.updateProject(projectId, {
        status: document.getElementById('edit-status').value,
        notes: document.getElementById('edit-description').value,
      });
      if (!res.ok) {
        alert(res.error || 'Could not update project');
        return;
      }
      await initRecruiterDashboard();
      await window.openProjectDetail(projectId);
    };

    window.deleteProject = async function () {
      var projectId = window.__dropcvCurrentProjectId;
      if (!projectId) return;
      if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
      var res = await window.dropCVApi.deleteProject(projectId);
      if (!res.ok) {
        alert(res.error || 'Could not delete project');
        return;
      }
      closeProjectDetail();
      await initRecruiterDashboard();
    };

    window.loadProjects = function () {
      var grid = document.getElementById('projects-grid');
      if (!grid) return;
      if (!projects.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><p>No projects yet</p></div>';
        return;
      }
      grid.innerHTML = projects.map(function (project) {
        return '<div class="project-card" onclick="openProjectDetail(' + project.id + ')">' +
          '<div class="project-header"><div class="project-name">' + project.name + '</div><span class="status-badge ' + project.status + '">' + project.status + '</span></div>' +
          '<div class="project-meta"><div class="project-meta-item">📍 ' + (project.city || 'Remote') + '</div><div class="project-meta-item">💼 ' + (project.isRemote ? 'Remote' : 'On-site') + '</div></div>' +
          '<div class="project-date">Created: ' + (project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—') + '</div>' +
          '<div class="project-footer"><span style="font-size: 14px; color: var(--color-gray-text);">' + project.candidateCount + ' candidates</span><span style="color: var(--color-purple); font-weight: 500;">Open →</span></div>' +
        '</div>';
      }).join('');
    };

    window.saveProjects = function () {};
    window.saveShortlists = function () {};
    window.viewCandidateProfile = function (candidateId) {
      var candidate = (window.__dropcvCandidates || []).find(function (c) { return String(c.id) === String(candidateId); });
      if (candidate) {
        alert(candidate.name + '\n' + candidate.title + '\n' + candidate.city);
      }
    };

    window.saveCompanyProfile = function () {
      var profile = window.currentUser && window.currentUser.profile ? window.currentUser.profile : {};
      var companyInput = document.getElementById('company-name-input');
      profile.companyName = (companyInput && companyInput.value) || profile.companyName || '';
      if (window.currentUser) {
        window.currentUser.profile = profile;
      }
      alert('Company profile saved!');
    };

  }

    function bootstrapDashboard() {
      if (!isDashboardFile()) return;
    if (currentFile() === 'dashboard-recruiter.html') {
      initRecruiterDashboard().then(function () {
        if (window.loadProjects) window.loadProjects();
        if (window.loadDiscoveryCandidates) window.loadDiscoveryCandidates();
        if (window.loadShortlists) window.loadShortlists();
        setDashboardReady();
      });
    } else {
      initProfessionalDashboard();
    }
  }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', bootstrapDashboard);
    } else {
      bootstrapDashboard();
    }
