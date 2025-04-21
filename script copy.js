
// Utility function for input sanitization
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Cache for preloaded data
  const cache = {
    brands: { Yes: null, No: null },
    assets: { Yes: {}, No: {} },
    dropdowns: null
  };

  // Preload brands, assets, and dropdowns
  async function preloadData() {
    const touchValues = ['Yes', 'No'];
    for (const touch of touchValues) {
      try {
        const brandRes = await fetch(`https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec?type=brands&touch=${touch}`);
        if (!brandRes.ok) throw new Error('Network error fetching brands');
        const brands = await brandRes.json();
        cache.brands[touch] = brands;

        cache.assets[touch] = {};
        for (const brand of brands) {
          try {
            const assetRes = await fetch(`https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec?type=assetsByBrand&brand=${brand}&touch=${touch}`);
            if (!assetRes.ok) throw new Error('Network error fetching assets');
            const assets = await assetRes.json();
            cache.assets[touch][brand] = assets;
          } catch (err) {
            console.error(`Error fetching assets for ${brand} (touch: ${touch}):`, err);
            cache.assets[touch][brand] = [];
          }
        }
      } catch (err) {
        console.error(`Error fetching brands for touch: ${touch}:`, err);
        cache.brands[touch] = [];
      }
    }

    // Fetch dropdowns data
    try {
      const dropdownRes = await fetch(`https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec?type=dropdowns`);
      if (!dropdownRes.ok) throw new Error('Network error fetching dropdowns');
      cache.dropdowns = await dropdownRes.json();
      populateDepartments();
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  }

  // Populate departments
  function populateDepartments() {
    const departmentDropdown = document.getElementById('department');
    departmentDropdown.innerHTML = '<option value="">Select Department</option>';
    if (cache.dropdowns && cache.dropdowns.departments) {
      cache.dropdowns.departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = sanitizeInput(dept);
        opt.textContent = dept;
        departmentDropdown.appendChild(opt);
      });
    }
  }

  // Populate roles based on selected department
  function populateRoles(department) {
    const roleDropdown = document.getElementById('role');
    roleDropdown.innerHTML = '<option value="">Select Role</option>';
    if (cache.dropdowns && cache.dropdowns.roles) {
      const deptRoles = cache.dropdowns.roles.find(r => r.department === department);
      if (deptRoles && deptRoles.roles.length > 0) {
        deptRoles.roles.forEach(role => {
          const opt = document.createElement('option');
          opt.value = sanitizeInput(role);
          opt.textContent = role;
          roleDropdown.appendChild(opt);
        });
      }
    }
  }

  // Populate brands based on touch value
  function populateBrands(touch) {
    const brandDropdown = document.getElementById('brand');
    brandDropdown.innerHTML = '<option value="">Select Brand</option>';
    if (cache.brands[touch] && cache.brands[touch].length > 0) {
      cache.brands[touch].forEach(brand => {
        const opt = document.createElement('option');
        opt.value = sanitizeInput(brand);
        opt.textContent = brand;
        brandDropdown.appendChild(opt);
      });
    } else {
      brandDropdown.innerHTML = '<option value="">Loading...</option>';
      fetchBrands(touch);
    }
  }

  // Populate asset IDs based on brand and touch
  function populateAssetIDs(touch, brand) {
    const assetDropdown = document.getElementById('asset_id');
    assetDropdown.innerHTML = '<option value="">Select Asset</option>';
    if (cache.assets[touch] && cache.assets[touch][brand] && cache.assets[touch][brand].length > 0) {
      cache.assets[touch][brand].forEach(asset => {
        const opt = document.createElement('option');
        opt.value = sanitizeInput(asset);
        opt.textContent = asset;
        assetDropdown.appendChild(opt);
      });
    } else {
      assetDropdown.innerHTML = '<option value="">Loading...</option>';
      fetchAssetIDs(brand, touch);
    }
  }

  // Fallback fetch for brands
  async function fetchBrands(touch) {
    const brandDropdown = document.getElementById('brand');
    try {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec?type=brands&touch=${touch}`);
      if (!res.ok) throw new Error('Network error fetching brands');
      const data = await res.json();
      cache.brands[touch] = data;
      brandDropdown.innerHTML = '<option value="">Select Brand</option>';
      data.forEach(brand => {
        const opt = document.createElement('option');
        opt.value = sanitizeInput(brand);
        opt.textContent = brand;
        brandDropdown.appendChild(opt);
      });
    } catch (err) {
      console.error('Error fetching brands:', err);
      brandDropdown.innerHTML = '<option value="">Error loading brands</option>';
    }
  }

  // Fallback fetch for asset IDs
  async function fetchAssetIDs(brand, touch) {
    const assetDropdown = document.getElementById('asset_id');
    try {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec?type=assetsByBrand&brand=${brand}&touch=${touch}`);
      if (!res.ok) throw new Error('Network error fetching assets');
      const data = await res.json();
      cache.assets[touch][brand] = data;
      assetDropdown.innerHTML = '<option value="">Select Asset</option>';
      data.forEach(asset => {
        const opt = document.createElement('option');
        opt.value = sanitizeInput(asset);
        opt.textContent = asset;
        assetDropdown.appendChild(opt);
      });
    } catch (err) {
      console.error('Error fetching assets:', err);
      assetDropdown.innerHTML = '<option value="">Error loading assets</option>';
    }
  }

  // Initialize preloading and event listeners
  document.addEventListener('DOMContentLoaded', () => {
    preloadData();

    // Department change event
    document.getElementById('department').addEventListener('change', (e) => {
      const department = e.target.value;
      populateRoles(department);
    });

    document.getElementById('touch').addEventListener('change', (e) => {
      const touch = e.target.value;
      populateBrands(touch);
      document.getElementById('asset_id').innerHTML = '<option value="">Select Asset</option>';
    });

    document.getElementById('brand').addEventListener('change', (e) => {
      const brand = e.target.value;
      const touch = document.getElementById('touch').value;
      populateAssetIDs(touch, brand);
    });
  });

  // Multi-select dropdown functionality
  const multiselectBox = document.getElementById('multiselectBox');
  const multiselectDropdown = document.getElementById('multiselectDropdown');
  const placeholder = document.getElementById('placeholder');
  const tagsInput = document.getElementById('tagsInput');
  let selectedTags = [];

  multiselectBox.addEventListener('click', () => {
    toggleDropdown();
  });

  multiselectBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    }
  });

  function toggleDropdown() {
    const isOpen = multiselectDropdown.classList.toggle('show');
    multiselectBox.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      multiselectDropdown.querySelector('.multiselect-option').focus();
    }
  }

  multiselectBox.addEventListener('focus', () => {
    multiselectBox.style.borderColor = '#4b62ab';
  });

  multiselectBox.addEventListener('blur', (e) => {
    if (!multiselectBox.contains(e.relatedTarget) && !multiselectDropdown.contains(e.relatedTarget)) {
      multiselectBox.style.borderColor = '#ccc';
      multiselectDropdown.classList.remove('show');
      multiselectBox.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (e) => {
    if (!multiselectBox.contains(e.target) && !multiselectDropdown.contains(e.target)) {
      multiselectDropdown.classList.remove('show');
      multiselectBox.setAttribute('aria-expanded', 'false');
    }
  });

  multiselectDropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.multiselect-option');
    if (!option) return;
    handleOptionSelect(option.dataset.value);
  });

  multiselectDropdown.addEventListener('keydown', (e) => {
    const option = e.target.closest('.multiselect-option');
    if (!option) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionSelect(option.dataset.value);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = option.nextElementSibling;
      if (next) next.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = option.previousElementSibling;
      if (prev) prev.focus();
    }
  });

  function handleOptionSelect(value) {
    if (value === 'Not Required') {
      selectedTags = ['Not Required'];
    } else {
      if (selectedTags.includes('Not Required')) {
        selectedTags = [];
      }
      if (selectedTags.includes(value)) {
        selectedTags = selectedTags.filter(tag => tag !== value);
      } else {
        selectedTags.push(value);
      }
    }
    updateSelectedTags();
  }

  function updateSelectedTags() {
    multiselectBox.innerHTML = '';
    if (selectedTags.length === 0) {
      multiselectBox.appendChild(placeholder);
    } else {
      selectedTags.forEach(tag => {
        const sanitizedTag = sanitizeInput(tag);
        const tagElement = document.createElement('span');
        tagElement.className = 'selected-tag';
        tagElement.innerHTML = `${sanitizedTag} <span class="remove-tag" data-value="${sanitizedTag}" role="button" aria-label="Remove ${sanitizedTag}">×</span>`;
        multiselectBox.appendChild(tagElement);
      });
    }
    tagsInput.value = selectedTags.join(',');
  }

  multiselectBox.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-tag');
    if (removeBtn) {
      const value = removeBtn.dataset.value;
      selectedTags = selectedTags.filter(tag => tag !== value);
      updateSelectedTags();
    }
  });

  // Form submission and validation
  const form = document.getElementById('employeeForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submitBtn');

  function validateRequiredFields(data) {
    const requiredFields = [
      { name: 'date_of_joining', label: 'Date of Joining' },
      { name: 'first_name', label: 'First Name' },
      { name: 'last_name', label: 'Last Name' },
      { name: 'email_id', label: 'Email ID' },
      { name: 'phone_number', label: 'Phone Number' },
      { name: 'city', label: 'City' },
      { name: 'staying_location', label: 'Staying Location' },
      { name: 'reporting_office', label: 'Reporting Office' },
      { name: 'role', label: 'Role' },
      { name: 'department', label: 'Department' },
      { name: 'experience', label: 'Experience' },
      { name: 'bond', label: 'Bond' },
      { name: 'degree', label: 'Highest Degree' },
      { name: 'specialization', label: 'Specialization' },
      { name: 'pass_year', label: 'Year of Pass' },
      { name: 'touch', label: 'Touch' },
      { name: 'brand', label: 'Brand' },
      { name: 'asset_id', label: 'Asset ID' },
      { name: 'tags', label: 'Notify to' }
    ];

    let isValid = true;
    requiredFields.forEach(field => {
      const errorElement = document.getElementById(`${field.name}-error`);
      if (!data[field.name] || data[field.name].trim() === '') {
        errorElement.style.display = 'block';
        isValid = false;
      } else {
        errorElement.style.display = 'none';
      }
    });
    return isValid;
  }

  function validateForm(data) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const emailError = document.getElementById('email_id-error');
    const phoneError = document.getElementById('phone_number-error');

    if (!emailRegex.test(data.email_id)) {
      emailError.textContent = 'Please enter a valid Email ID';
      emailError.style.display = 'block';
      isValid = false;
    } else {
      emailError.style.display = 'none';
    }

    if (!phoneRegex.test(data.phone_number)) {
      phoneError.textContent = 'Please enter a valid Phone Number (10 digits)';
      phoneError.style.display = 'block';
      isValid = false;
    } else {
      phoneError.style.display = 'none';
    }

    return isValid;
  }

  function showSuccessPopup() {
    document.getElementById('success-popup').classList.add('active');
  }

  function closeSuccessPopup() {
    document.getElementById('success-popup').classList.remove('active');
    form.reset();
    selectedTags = [];
    updateSelectedTags();
    msg.innerText = '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Sanitize all inputs
    for (let key in data) {
      data[key] = sanitizeInput(data[key]);
    }

    const isRequiredValid = validateRequiredFields(data);
    const isFormValid = validateForm(data);

    if (!isRequiredValid) {
      msg.innerText = 'Please fill in all required fields.';
      msg.style.color = 'red';
      return;
    }

    if (!isFormValid) {
      msg.innerText = 'Please fix the errors in the form.';
      msg.style.color = 'red';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerText = 'Submitting...';

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbymP5MDdauwG38pbMQo4mDc1q34wER_xaIpnmWl2VQTQOU5QzMj50UoFLHFs70YIefCqA/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showSuccessPopup();
    } catch (error) {
      msg.innerText = `Error submitting form: ${error.message}`;
      msg.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.innerText = 'Submit';
    }
  });