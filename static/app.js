const API = window.location.origin;

// ── Mode toggle ───────────────────────────────────────────
const uiMode  = document.getElementById('ui-mode');
const apiMode = document.getElementById('api-mode');
const btnUI   = document.getElementById('btn-mode-ui');
const btnAPI  = document.getElementById('btn-mode-api');

btnUI.addEventListener('click', () => {
  uiMode.classList.remove('hidden');
  apiMode.classList.add('hidden');
  btnUI.classList.add('active');
  btnAPI.classList.remove('active');
  loadCustomers();
});
btnAPI.addEventListener('click', () => {
  apiMode.classList.remove('hidden');
  uiMode.classList.add('hidden');
  btnAPI.classList.add('active');
  btnUI.classList.remove('active');
});

// ═══════════════════════════════════════════════════════════
// UI MODE
// ═══════════════════════════════════════════════════════════
const tableBody      = document.getElementById('customer-table-body');
const formSection    = document.getElementById('form-section');
const formTitle      = document.getElementById('form-title');
const customerForm   = document.getElementById('customer-form');
const fieldId        = document.getElementById('field-id');
const fieldName      = document.getElementById('field-name');
const fieldRole      = document.getElementById('field-role');
const fieldEmail     = document.getElementById('field-email');
const fieldPhone     = document.getElementById('field-phone');
const fieldContacted = document.getElementById('field-contacted');
const toast          = document.getElementById('toast');

document.getElementById('btn-refresh').addEventListener('click', loadCustomers);
document.getElementById('btn-add').addEventListener('click', openAddForm);
document.getElementById('btn-cancel').addEventListener('click', closeForm);
customerForm.addEventListener('submit', handleSubmit);

let toastTimer;
function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

async function loadCustomers() {
  tableBody.innerHTML = '<tr><td colspan="6" class="empty">Loading...</td></tr>';
  try {
    const res = await fetch(`${API}/customers`);
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();
    const list = Object.values(data);
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="empty">No customers yet.</td></tr>';
      return;
    }
    tableBody.innerHTML = list.map(c => `
      <tr>
        <td>${esc(c.name)}</td>
        <td>${esc(c.role)}</td>
        <td>${esc(c.email)}</td>
        <td>${c.phone || '—'}</td>
        <td><span class="badge ${c.contacted ? 'badge-yes' : 'badge-no'}">${c.contacted ? 'Yes' : 'No'}</span></td>
        <td>
          <div class="actions">
            <button onclick='openEditForm(${JSON.stringify(c)})'>Edit</button>
            <button class="danger" onclick="deleteCustomer('${c.id}','${esc(c.name)}')">Delete</button>
          </div>
        </td>
      </tr>`).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">Failed to load: ${err.message}</td></tr>`;
    showToast(err.message, 'error');
  }
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openAddForm() {
  formTitle.textContent = 'Add Customer';
  customerForm.reset();
  fieldId.value = '';
  formSection.classList.remove('hidden');
  fieldName.focus();
}
function openEditForm(c) {
  formTitle.textContent = 'Edit Customer';
  fieldId.value = c.id;
  fieldName.value = c.name;
  fieldRole.value = c.role;
  fieldEmail.value = c.email;
  fieldPhone.value = c.phone;
  fieldContacted.checked = c.contacted;
  formSection.classList.remove('hidden');
  fieldName.focus();
}
function closeForm() {
  formSection.classList.add('hidden');
  customerForm.reset();
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = fieldId.value;
  const payload = {
    name: fieldName.value.trim(),
    role: fieldRole.value.trim(),
    email: fieldEmail.value.trim(),
    phone: parseInt(fieldPhone.value) || 0,
    contacted: fieldContacted.checked,
  };
  try {
    const res = id
      ? await fetch(`${API}/customers/${id}`, { method: 'PUT',  headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      : await fetch(`${API}/customers`,        { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error((await res.text()).trim() || `Error ${res.status}`);
    showToast(id ? 'Customer updated.' : 'Customer added.');
    closeForm();
    loadCustomers();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteCustomer(id, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  try {
    const res = await fetch(`${API}/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.text()).trim() || `Error ${res.status}`);
    showToast(`"${name}" deleted.`);
    loadCustomers();
  } catch (err) { showToast(err.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════
// API MODE
// ═══════════════════════════════════════════════════════════

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/customers',
    desc: 'Returns all customers as a JSON object keyed by ID.',
    params: [],
    body: null,
  },
  {
    method: 'GET',
    path: '/customers/{id}',
    desc: 'Returns a single customer by UUID.',
    params: [{ name: 'id', in: 'path', required: true, placeholder: '550e8400-e29b-41d4-a716-446655440001' }],
    body: null,
  },
  {
    method: 'POST',
    path: '/customers',
    desc: 'Creates a new customer. ID is auto-generated. Name is required.',
    params: [],
    body: JSON.stringify({ name: 'Alice Smith', role: 'Developer', email: 'alice@example.com', phone: 41796541525, contacted: false }, null, 2),
  },
  {
    method: 'PUT',
    path: '/customers/{id}',
    desc: 'Replaces a customer by UUID. Name is required.',
    params: [{ name: 'id', in: 'path', required: true, placeholder: '550e8400-e29b-41d4-a716-446655440001' }],
    body: JSON.stringify({ name: 'Max Muster', role: 'Senior Manager', email: 'max.muster@example.com', phone: 41796541522, contacted: true }, null, 2),
  },
  {
    method: 'DELETE',
    path: '/customers/{id}',
    desc: 'Deletes a customer by UUID. Returns 204 on success.',
    params: [{ name: 'id', in: 'path', required: true, placeholder: '550e8400-e29b-41d4-a716-446655440001' }],
    body: null,
  },
];

function buildApiExplorer() {
  const container = document.getElementById('api-endpoints');
  container.innerHTML = '';

  ENDPOINTS.forEach((ep, idx) => {
    const card = document.createElement('div');
    card.className = 'endpoint-card';

    // summary row
    const summary = document.createElement('div');
    summary.className = 'endpoint-summary';
    summary.innerHTML = `
      <span class="method-badge method-${ep.method}">${ep.method}</span>
      <span class="endpoint-path">${ep.path}</span>
      <span class="endpoint-desc">${ep.desc}</span>
      <span class="chevron">▼</span>
    `;

    // body
    const body = document.createElement('div');
    body.className = 'endpoint-body';

    let paramInputsHTML = '';
    if (ep.params.length) {
      paramInputsHTML = `<div class="param-section">
        <h4>Path Parameters</h4>
        ${ep.params.map(p => `
          <div class="param-row">
            <span class="param-label">${p.name} ${p.required ? '<span class="param-required">*</span>' : ''}</span>
            <input class="param-input" data-param="${p.name}" placeholder="${p.placeholder}" value="${p.placeholder}" />
          </div>`).join('')}
      </div>`;
    }

    let bodyHTML = '';
    if (ep.body !== null) {
      bodyHTML = `<div class="param-section">
        <h4>Request Body</h4>
        <textarea class="body-editor" rows="6">${ep.body}</textarea>
      </div>`;
    }

    body.innerHTML = `
      ${paramInputsHTML}
      ${bodyHTML}
      <div class="execute-row">
        <button class="btn-execute">Execute</button>
        <button class="btn-clear">Clear response</button>
      </div>
      <div class="response-box hidden"></div>
    `;

    // toggle expand
    summary.addEventListener('click', () => {
      const open = body.classList.toggle('open');
      summary.classList.toggle('open', open);
      summary.querySelector('.chevron').classList.toggle('open', open);
    });

    // execute
    body.querySelector('.btn-execute').addEventListener('click', () => executeRequest(ep, body));
    body.querySelector('.btn-clear').addEventListener('click', () => {
      body.querySelector('.response-box').className = 'response-box hidden';
      body.querySelector('.response-box').innerHTML = '';
    });

    card.appendChild(summary);
    card.appendChild(body);
    container.appendChild(card);
  });
}

async function executeRequest(ep, bodyEl) {
  // build URL
  let url = `${API}${ep.path}`;
  bodyEl.querySelectorAll('.param-input').forEach(input => {
    url = url.replace(`{${input.dataset.param}}`, encodeURIComponent(input.value.trim()));
  });

  const opts = { method: ep.method, headers: {} };
  const textarea = bodyEl.querySelector('.body-editor');
  if (textarea) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = textarea.value;
  }

  const responseBox = bodyEl.querySelector('.response-box');
  responseBox.innerHTML = '<pre class="response-body">Sending...</pre>';
  responseBox.className = 'response-box';

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let formatted = text;
    try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}

    const statusClass = res.status < 300 ? 'status-2xx' : res.status < 500 ? 'status-4xx' : 'status-5xx';
    responseBox.innerHTML = `
      <div class="response-status-bar ${statusClass}">
        <span>${res.status} ${res.statusText}</span>
        <span style="margin-left:auto;font-weight:400;opacity:.7">URL: ${url}</span>
      </div>
      <pre class="response-body">${esc(formatted || '(empty)')}</pre>
    `;
  } catch (err) {
    responseBox.innerHTML = `
      <div class="response-status-bar status-5xx">Network Error</div>
      <pre class="response-body">${esc(err.message)}</pre>
    `;
  }
}

// ── Init ──────────────────────────────────────────────────
buildApiExplorer();
loadCustomers();
