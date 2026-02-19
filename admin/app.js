const sections = [
  { key: 'global', label: 'Global / Footer' },
  { key: 'home', label: 'Home Page' },
  { key: 'about', label: 'About Us' },
  { key: 'servicesPage', label: 'Services Page' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'projects', label: 'Projects' },
  { key: 'careers', label: 'Careers' },
  { key: 'contact', label: 'Contact Page' }
];

let contentState = {};
let activeKey = 'global';

const $ = (s) => document.querySelector(s);

async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function buildCards() {
  const wrap = $('#navCards');
  wrap.innerHTML = '';
  sections.forEach(section => {
    const card = document.createElement('div');
    card.className = `card ${activeKey === section.key ? 'active' : ''}`;
    card.innerHTML = `<strong>${section.label}</strong><small>Manage ${section.label.toLowerCase()}</small>`;
    card.onclick = () => {
      activeKey = section.key;
      buildCards();
      renderEditor();
    };
    wrap.appendChild(card);
  });
}

function textInput(label, value, onInput, type = 'text') {
  const div = document.createElement('div');
  div.innerHTML = `<label>${label}</label><input type="${type}" value="${(value ?? '').toString().replace(/"/g, '&quot;')}" />`;
  div.querySelector('input').oninput = e => onInput(e.target.value);
  return div;
}

function textArea(label, value, onInput) {
  const div = document.createElement('div');
  div.innerHTML = `<label>${label}</label><textarea rows="3">${value ?? ''}</textarea>`;
  div.querySelector('textarea').oninput = e => onInput(e.target.value);
  return div;
}

function arrayEditor(label, items, buildItem, onChange) {
  const wrap = document.createElement('div');
  const title = document.createElement('h4');
  title.textContent = label;
  wrap.appendChild(title);

  items.forEach((item, idx) => {
    const box = document.createElement('div');
    box.className = 'list-item';
    buildItem(box, item, idx);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    actions.innerHTML = `
      <button type="button">↑</button>
      <button type="button">↓</button>
      <button type="button">Remove</button>
    `;
    const [up, down, remove] = actions.querySelectorAll('button');
    up.onclick = () => {
      if (idx === 0) return;
      [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
      onChange([...items]);
      renderEditor();
    };
    down.onclick = () => {
      if (idx === items.length - 1) return;
      [items[idx + 1], items[idx]] = [items[idx], items[idx + 1]];
      onChange([...items]);
      renderEditor();
    };
    remove.onclick = () => {
      items.splice(idx, 1);
      onChange([...items]);
      renderEditor();
    };
    box.appendChild(actions);
    wrap.appendChild(box);
  });

  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = `Add ${label.replace(/s$/, '')}`;
  add.onclick = () => {
    items.push({});
    onChange([...items]);
    renderEditor();
  };
  wrap.appendChild(add);
  return wrap;
}

async function uploadFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const data = await api('/api/admin/upload', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, dataUrl })
  });
  return data.path;
}

function renderEditor() {
  const panel = $('#editorPanel');
  panel.innerHTML = '';
  const section = contentState[activeKey] || {};

  const block = document.createElement('div');
  block.className = 'section-block';
  block.innerHTML = `<h2>${sections.find(s => s.key === activeKey).label}</h2>`;

  if (activeKey === 'global') {
    block.append(textInput('Phone', section.phone, v => section.phone = v));
    block.append(textInput('Email', section.email, v => section.email = v));
    block.append(textArea('Address', section.address, v => section.address = v));
    section.socialLinks ??= [];
    block.append(arrayEditor('Social Links', section.socialLinks, (box, item) => {
      box.append(textInput('Platform', item.platform, v => item.platform = v));
      box.append(textInput('URL', item.url, v => item.url = v));
    }, v => section.socialLinks = v));
  }

  if (activeKey === 'home') {
    section.hero ??= {};
    section.services ??= [];
    section.contactPanel ??= {};
    block.append(textInput('Hero Headline', section.hero.headline, v => section.hero.headline = v));
    block.append(textArea('Hero Subtext', section.hero.subtext, v => section.hero.subtext = v));
    block.append(textInput('Hero Button Text', section.hero.buttonText, v => section.hero.buttonText = v));
    block.append(textInput('Hero Button Link', section.hero.buttonLink, v => section.hero.buttonLink = v));
    block.append(arrayEditor('Featured Services', section.services, (box, item) => {
      box.append(textInput('Title', item.title, v => item.title = v));
      box.append(textArea('Description', item.description, v => item.description = v));
      box.append(textInput('Icon', item.icon, v => item.icon = v));
    }, v => section.services = v));
    block.append(textInput('Contact Phone', section.contactPanel.phone, v => section.contactPanel.phone = v));
    block.append(textInput('Contact Email', section.contactPanel.email, v => section.contactPanel.email = v));
    block.append(textArea('Contact Address', section.contactPanel.address, v => section.contactPanel.address = v));
  }

  if (activeKey === 'about') {
    section.certifications ??= [];
    block.append(arrayEditor('Certifications', section.certifications, (box, item) => {
      box.append(textInput('Certification Name', item.name, v => item.name = v));
      box.append(textArea('Description', item.description, v => item.description = v));
      box.append(textInput('Image Path/URL', item.image, v => item.image = v));
      const file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      file.onchange = async () => {
        if (!file.files[0]) return;
        item.image = await uploadFile(file.files[0]);
        renderEditor();
      };
      box.append(file);
    }, v => section.certifications = v));
  }

  if (activeKey === 'servicesPage') {
    section.categories ??= [];
    block.append(arrayEditor('Main Services', section.categories, (box, cat) => {
      cat.subServices ??= [];
      box.append(textInput('Main Service Title', cat.title, v => cat.title = v));
      box.append(textArea('Main Service Description', cat.description, v => cat.description = v));
      box.append(arrayEditor('Sub-Services', cat.subServices, (subBox, sub) => {
        sub.features ??= [];
        subBox.append(textInput('Sub-Service Title', sub.title, v => sub.title = v));
        subBox.append(textArea('Detailed Description', sub.description, v => sub.description = v));
        subBox.append(textInput('Featured Image URL', sub.image, v => sub.image = v));
        subBox.append(textArea('Features (comma separated)', (sub.features || []).join(', '), v => sub.features = v.split(',').map(s => s.trim()).filter(Boolean)));
      }, v => cat.subServices = v));
    }, v => section.categories = v));
  }

  if (activeKey === 'gallery') {
    section.albums ??= [];
    block.append(arrayEditor('Albums', section.albums, (box, album) => {
      album.images ??= [];
      box.append(textInput('Album Name', album.name, v => album.name = v));
      box.append(arrayEditor('Images', album.images, (imgBox, image) => {
        imgBox.append(textInput('Title', image.title, v => image.title = v));
        imgBox.append(textInput('Alt Text', image.alt, v => image.alt = v));
        imgBox.append(textInput('Image URL', image.image, v => image.image = v));
        const file = document.createElement('input');
        file.type = 'file';
        file.accept = 'image/*';
        file.onchange = async () => {
          if (!file.files[0]) return;
          image.image = await uploadFile(file.files[0]);
          renderEditor();
        };
        imgBox.append(file);
      }, v => album.images = v));
    }, v => section.albums = v));
  }

  if (activeKey === 'projects') {
    section.items ??= [];
    block.append(arrayEditor('Projects', section.items, (box, project) => {
      project.galleryImages ??= project.galleryImages || [];
      box.append(textInput('Project Title', project.title, v => project.title = v));
      box.append(textInput('Category', project.category, v => project.category = v));
      box.append(textInput('Client Name', project.client, v => project.client = v));
      box.append(textArea('Description', project.description, v => project.description = v));
      box.append(textInput('Featured Image', project.featuredImage, v => project.featuredImage = v));
      box.append(textArea('Gallery Images (one URL per line)', (project.galleryImages || []).join('\n'), v => project.galleryImages = v.split('\n').map(x => x.trim()).filter(Boolean)));
      box.append(textInput('Project Date', project.date, v => project.date = v, 'date'));
      box.append(textInput('Live URL', project.liveUrl, v => project.liveUrl = v));
    }, v => section.items = v));
  }

  if (activeKey === 'careers') {
    section.jobs ??= [];
    block.append(arrayEditor('Job Postings', section.jobs, (box, job) => {
      box.append(textInput('Job Title', job.title, v => job.title = v));
      box.append(textInput('Department', job.department, v => job.department = v));
      box.append(textInput('Location', job.location, v => job.location = v));
      box.append(textInput('Type', job.type, v => job.type = v));
      box.append(textArea('Detailed Description', job.description, v => job.description = v));
      box.append(textInput('Deadline', job.deadline, v => job.deadline = v, 'date'));
      box.append(textInput('Apply Link/Email', job.applyLink, v => job.applyLink = v));
    }, v => section.jobs = v));
  }

  if (activeKey === 'contact') {
    block.append(textInput('Phone', section.phone, v => section.phone = v));
    block.append(textInput('Email', section.email, v => section.email = v));
    block.append(textArea('Address', section.address, v => section.address = v));
    block.append(textArea('Map Embed Code', section.mapEmbed, v => section.mapEmbed = v));
  }

  panel.append(block);
}

async function loadContent() {
  contentState = await api('/api/admin/content');
  buildCards();
  renderEditor();
}

async function init() {
  const session = await api('/api/admin/session');
  if (session.authenticated) {
    $('#loginView').classList.add('hidden');
    $('#dashboardView').classList.remove('hidden');
    await loadContent();
  }

  $('#loginForm').onsubmit = async (e) => {
    e.preventDefault();
    $('#loginError').textContent = '';
    const form = new FormData(e.target);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      $('#loginView').classList.add('hidden');
      $('#dashboardView').classList.remove('hidden');
      await loadContent();
    } catch (err) {
      $('#loginError').textContent = err.message;
    }
  };

  $('#saveBtn').onclick = async () => {
    await api('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify(contentState)
    });
    alert('Changes saved successfully.');
  };

  $('#restoreDefaults').onclick = async () => {
    const data = await api('/api/admin/content/default', { method: 'POST' });
    contentState = data.content;
    renderEditor();
    alert('Default content restored.');
  };

  $('#undoBtn').onclick = async () => {
    try {
      const data = await api('/api/admin/content/undo', { method: 'POST' });
      contentState = data.content;
      renderEditor();
      alert('Undo completed.');
    } catch (err) {
      alert(err.message);
    }
  };

  $('#logoutBtn').onclick = async () => {
    await api('/api/admin/logout', { method: 'POST' });
    location.reload();
  };
}

init();
