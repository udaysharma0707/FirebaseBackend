/**
 * ==========================================
 * BRANDS MANAGEMENT MODULE (FIREBASE)
 * File: brand-manager.js
 * ==========================================
 */


// ✅ THESE WERE MISSING!
let brandsCache = [];
let pendingBrands = [];



console.log('✅ Brand Manager Module Loaded');

function navigateToBrands() {
  console.log('🏷️ Navigating to Brands');
  
  currentPage = 'brands';
  
  // Get page elements
  const mainApp = document.getElementById('mainApp');
  const allProductsPage = document.getElementById('allProductsPage');
  const productGroupsPage = document.getElementById('productGroupsPage');
  const customersPage = document.getElementById('customersPage');
  const groupDetailPage = document.getElementById('groupDetailPage');
  const brandsPage = document.getElementById('brandsPage');
  
  // Hide all other pages
  if (mainApp) {
    mainApp.style.display = 'none';
    mainApp.classList.remove('active');
  }
  
  if (allProductsPage) {
    allProductsPage.classList.remove('active');
    allProductsPage.style.display = 'none';
  }
  
  if (productGroupsPage) {
    productGroupsPage.classList.remove('active');
    productGroupsPage.style.display = 'none';
  }
  
  if (customersPage) {
    customersPage.classList.remove('active');
    customersPage.style.display = 'none';
  }
  
  if (groupDetailPage) {
    groupDetailPage.classList.remove('active');
    groupDetailPage.style.display = 'none';
  }
  
  // ✅ CRITICAL FIX: Hide main app navbar
  const mainNavbar = document.getElementById('mainAppNavbar');
  if (mainNavbar) {
    mainNavbar.style.display = 'none';
    console.log('✅ Hidden main app navbar');
  }
  
  // Also hide by class selector as backup
  const stickyNavbar = document.querySelector('.navbar.sticky-top');
  if (stickyNavbar) {
    stickyNavbar.style.display = 'none';
    console.log('✅ Hidden sticky navbar');
  }
  
  // Show brands page
  if (brandsPage) {
    brandsPage.classList.add('active');
    brandsPage.style.display = 'block';
    brandsPage.style.marginTop = '0';
    brandsPage.style.paddingTop = '0';
    console.log('✅ Brands page displayed');
  } else {
    console.error('❌ brandsPage element not found!');
    return;
  }
  
  // Refresh brand caches
  if (typeof refreshBrandAutocompleteCache === 'function') {
    refreshBrandAutocompleteCache();
  }
  
  // Load brands
  if (typeof loadBrands === 'function') {
    loadBrands();
  }
  
  // Close sidebar and scroll
  if (typeof closeSidebar === 'function') {
    closeSidebar();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/**
 * ==========================================
 * SECTION 2: DATA LOADING FUNCTIONS
 * ==========================================
 */

async function loadBrands() {
  try {
    console.log('📡 Fetching brands from Firebase...');
    
    const user = window.auth.currentUser;
    
    if (!user) {
      console.error('❌ No user authenticated');
      throw new Error('Please sign in first');
    }
    
    const { collection, getDocs } = window.firebaseImports;
    const userId = user.uid;
    
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    const brandsSnap = await getDocs(brandsRef);
    
    brandsCache = [];
    brandsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        brandsCache.push(data.name);
      }
    });
    
    console.log('✅ Loaded', brandsCache.length, 'brands from Firebase');
    console.log('  Brands:', brandsCache);
    
    renderBrandsList();
    
  } catch (error) {
    console.error('❌ Error loading brands:', error);
    
    const container = document.getElementById('brandsListContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#dc3545;">
          <i class="bi bi-exclamation-circle" style="font-size:48px;"></i>
          <h4 style="margin-top:20px;">Error Loading Brands</h4>
          <p>${error.message}</p>
          <button class="btn btn-primary mt-3" onclick="loadBrands()">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

/**
 * ==========================================
 * SECTION 3: RENDERING FUNCTIONS
 * ==========================================
 */

function renderBrandsList() {
  console.log('🎨 Rendering brands list...');
  
  const container = document.getElementById('brandsListContainer');
  const emptyState = document.getElementById('brandsEmptyState');
  
  if (!container) {
    console.error('❌ brandsListContainer not found!');
    return;
  }
  
  if (!brandsCache || brandsCache.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    console.log('📋 No brands to display');
    return;
  }
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  const sortedBrands = [...brandsCache].sort((a, b) => a.localeCompare(b));
  
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  sortedBrands.forEach(brand => {
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                <i class="bi bi-tag"></i> ${escapeHtml(brand)}
              </h5>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger" 
                      onclick="confirmDeleteBrand('${escapeHtml(brand)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  console.log(`✅ Rendered ${brandsCache.length} brands`);
}

function filterBrands(searchTerm) {
  if (!brandsCache) {
    console.warn('⚠️ brandsCache is empty');
    return;
  }
  
  const term = searchTerm.toLowerCase().trim();
  const container = document.getElementById('brandsListContainer');
  const emptyState = document.getElementById('brandsEmptyState');
  
  if (!container) return;
  
  if (!term || term.length === 0) {
    renderBrandsList();
    return;
  }
  
  const filtered = brandsCache.filter(brand => 
    brand.toLowerCase().includes(term)
  );
  
  console.log(`🔍 Search: "${searchTerm}" - Found ${filtered.length} matches`);
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#999;">
        <i class="bi bi-search" style="font-size:48px;"></i>
        <h4 style="margin-top:20px;">No brands found</h4>
        <p>No brands match "${escapeHtml(searchTerm)}"</p>
        <button class="btn btn-outline-primary mt-3" onclick="document.getElementById('searchBrandsInput').value=''; filterBrands('');">
          <i class="bi bi-x-circle"></i> Clear Search
        </button>
      </div>
    `;
    return;
  }
  
  const sortedFiltered = filtered.sort((a, b) => a.localeCompare(b));
  
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  sortedFiltered.forEach(brand => {
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                <i class="bi bi-tag"></i> ${escapeHtml(brand)}
              </h5>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger" 
                      onclick="confirmDeleteBrand('${escapeHtml(brand)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * ==========================================
 * SECTION 4: MODAL FUNCTIONS
 * ==========================================
 */
function openAddBrandModal() {
  console.log('➕ Opening Add Brands modal');
  
  // Reset pending brands
  pendingBrands = [];
  
  // ✅ Use WORKING clear method
  document.querySelectorAll('#brandInput').forEach(inp => {
    inp.value = '';
    inp.setAttribute('value', '');
    window.lastBrandInput = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  // Update preview (should show empty state)
  updateBrandPreviewList();
  
  // Open modal
  const modal = new bootstrap.Modal(document.getElementById('addBrandsModal'));
  modal.show();
  
  // Focus on input after modal opens
  setTimeout(() => {
    const input = document.getElementById('brandInput');
    if (input) {
      input.focus();
    }
  }, 200);
}


/**
 * ==========================================
 * SECTION 5: HANDLE BRAND INPUT
 * ==========================================
 */

/**
 * Force clear brand input (WORKING METHOD)
 */
function forceClearBrandInput() {
  // Clear ALL inputs with this ID
  document.querySelectorAll('#brandInput').forEach(inp => {
    inp.value = '';
    inp.setAttribute('value', '');
    window.lastBrandInput = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  console.log('🧹 Input cleared');
}

/**
 * Handle brand input (Enter or Comma keys)
 */
function handleBrandInputKeydown(event) {
  const input = document.getElementById('brandInput');
  if (!input) {
    console.error('❌ brandInput not found');
    return;
  }
  
  // Check if Enter or Comma key
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    
    // Get value from storage or directly from input
    let value = window.lastBrandInput || input.value;
    value = value.trim();
    
    // Remove trailing comma if present
    if (value.endsWith(',')) {
      value = value.slice(0, -1).trim();
    }
    
    console.log('⌨️ Key pressed:', event.key);
    console.log('📝 Value:', value);
    
    if (value && value.length > 0) {
      // Check if already in pending list
      if (pendingBrands.includes(value)) {
        alert('⚠️ This brand is already in the list!');
      } else {
        // Add to pending brands
        pendingBrands.push(value);
        console.log('✅ Brand added to preview:', value);
        
        // Update preview
        updateBrandPreviewList();
      }
    }
    
    // ✅ Use the WORKING clear method
    forceClearBrandInput();
  }
}



/**
 * ✅ NEW FUNCTION - Add brand from button click
 * This function is triggered by the Enter icon button
 */
function addBrandFromButtonClick(event) {
  // Prevent any default behavior
  event.preventDefault();
  event.stopPropagation();
  
  const input = document.getElementById('brandInput');
  if (!input) {
    console.error('❌ brandInput not found');
    return;
  }
  
  const brandName = input.value.trim();
  
  console.log('🔘 Enter button clicked');
  console.log('📝 Input value:', brandName);
  console.log('📋 Current pending brands:', pendingBrands);
  
  // Check if empty
  if (!brandName || brandName.length === 0) {
    alert('⚠️ Please enter a brand name');
    input.focus();
    return;
  }
  
  // Check for duplicates in pending list
  if (pendingBrands.includes(brandName)) {
    alert('⚠️ This brand is already in the list!');
    input.value = '';
    input.focus();
    return;
  }
  
  // Check if brand already exists in database
  if (brandsCache && brandsCache.includes(brandName)) {
    const confirm = window.confirm(`⚠️ Brand "${brandName}" already exists in your database!\n\nDo you want to add it to the list anyway?`);
    if (!confirm) {
      input.value = '';
      input.focus();
      return;
    }
  }
  
  // Add to pending list
  pendingBrands.push(brandName);
  console.log('✅ Brand added to preview:', brandName);
  console.log('📋 Updated pending brands:', pendingBrands);
  
  // Clear input
  input.value = '';
  
  // Update preview
  updateBrandPreviewList();
  
  // Focus back to input
  setTimeout(() => {
    input.focus();
  }, 50);
}

/**
 * ==========================================
 * SECTION 6: BUTTON HANDLER
 * ==========================================
 */

function setupBrandInputButton() {
  const btn = document.getElementById('addBrandBtn');
  const input = document.getElementById('brandInput');
  
  if (!btn || !input) {
    console.error('❌ Button or input not found');
    return;
  }
  
  // Remove old listener if exists
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  
  // Add fresh listener
  newBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const brandName = input.value.trim();
    
    console.log('🔘 Button clicked');
    console.log('📝 Value:', brandName);
    console.log('📋 Current pending:', pendingBrands);
    
    if (!brandName) {
      alert('⚠️ Please enter a brand name');
      return;
    }
    
    if (pendingBrands.includes(brandName)) {
      alert('⚠️ This brand is already in the list!');
      return;
    }
    
    pendingBrands.push(brandName);
    console.log('✅ Added:', brandName);
    
    input.value = '';
    updateBrandPreviewList();
    input.focus();
  });
  
  newBtn.addEventListener('mouseenter', function() {
    this.style.background = '#218838';
  });
  
  newBtn.addEventListener('mouseleave', function() {
    this.style.background = '#28a745';
  });
  
  console.log('✅ Brand input button setup complete');
}

/**
 * ==========================================
 * SECTION 7: UPDATE BRAND PREVIEW
 * ==========================================
 */

function updateBrandPreviewList() {
  const previewList = document.getElementById('brandPreviewList');
  const previewCount = document.getElementById('previewCount');
  
  if (!previewList) {
    console.error('❌ brandPreviewList not found');
    return;
  }
  
  if (previewCount) {
    previewCount.textContent = `📝 Brands to Save (${pendingBrands.length}):`;
  }
  
  if (pendingBrands.length === 0) {
    previewList.innerHTML = `
      <div style="padding: 15px; color: #999; text-align: center; font-size: 14px;">
        No brands added yet
      </div>
    `;
    return;
  }
  
  let html = '';
  pendingBrands.forEach((brand, index) => {
    html += `
      <div style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 12px; border-bottom: 1px solid #e0e0e0;
        background: white; transition: background 0.2s;
      " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
        
        <span style="font-size: 14px; color: #333; flex: 1;">
          <strong style="color: #007bff;">${index + 1}.</strong> 
          <span style="margin-left: 8px;">${escapeHtml(brand)}</span>
        </span>
        
        <button onclick="removePendingBrand('${escapeHtml(brand)}')" style="
          background: #dc3545; color: white; border: none; 
          padding: 5px 10px; border-radius: 5px; cursor: pointer;
          font-size: 12px; font-weight: 600; transition: background 0.2s;
        " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
  });
  
  previewList.innerHTML = html;
  console.log(`📋 Updated preview: ${pendingBrands.length} brands`);
}

function removePendingBrand(brand) {
  pendingBrands = pendingBrands.filter(b => b !== brand);
  updateBrandPreviewList();
  console.log('🗑️ Removed from preview:', brand);
}

/**
 * ==========================================
 * SECTION 8: SAVE ALL BRANDS TO FIREBASE
 * ==========================================
 */
async function saveAllBrands() {
  if (pendingBrands.length === 0) {
    alert('⚠️ Please add at least one brand');
    return;
  }
  
  console.log('💾 Saving', pendingBrands.length, 'brands to Firebase...');
  
  const user = window.auth.currentUser;
  
  if (!user) {
    alert('❌ Please sign in first');
    return;
  }
  
  try {
    // Clear input field
    document.querySelectorAll('#brandInput').forEach(inp => {
      inp.value = '';
      inp.setAttribute('value', '');
      window.lastBrandInput = '';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBrandsModal'));
    if (modal) {
      modal.hide();
    }
    
    // Add brands to cache immediately
    const brandsToSave = [...pendingBrands];
    brandsCache.push(...brandsToSave);
    
    // ✅ FIXED: Also update autocomplete cache
    brandsToSave.forEach(brand => {
      if (!brandAutocompleteCache.includes(brand)) {
        brandAutocompleteCache.push(brand);
      }
    });
    console.log('✅ Updated both caches');
    
    // Refresh display
    renderBrandsList();
    
    // Show success
    alert(`✅ Success!\n\n${brandsToSave.length} brand(s) added!`);
    
    // Clear pending
    pendingBrands = [];
    
    // Save to Firebase
    const { collection, addDoc } = window.firebaseImports;
    const userId = user.uid;
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    
    const savePromises = brandsToSave.map(async (brandName) => {
      try {
        await addDoc(brandsRef, {
          name: brandName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId
        });
        console.log('✅ Firebase: Brand saved:', brandName);
        return { success: true, brand: brandName };
      } catch (error) {
        console.error('❌ Firebase: Failed to save brand:', brandName, error);
        return { success: false, brand: brandName, error };
      }
    });
    
    const results = await Promise.all(savePromises);
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} brand(s) failed to save`);
      setTimeout(() => {
        loadBrands();
      }, 1000);
    } else {
      console.log(`✅ All ${brandsToSave.length} brands saved`);
    }
    
  } catch (error) {
    console.error('❌ Error saving brands:', error);
    alert('❌ Error saving brands. Please try again.');
    loadBrands();
  }
}


/**
 * ==========================================
 * SECTION 9: DELETE BRAND FROM FIREBASE
 * ==========================================
 */

function confirmDeleteBrand(brand) {
  const confirmed = confirm(`🗑️ Delete "${brand}"?\n\nThis cannot be undone.`);
  
  if (confirmed) {
    deleteBrand(brand);
  }
}
/**
 * Delete a brand
 * ✅ FIXED - Actually deletes from Firebase
 */
async function deleteBrand(brandName) {
  const confirmed = confirm(`Are you sure you want to delete "${brandName}"?\n\nThis action cannot be undone.`);
  
  if (!confirmed) {
    return;
  }
  
  console.log('🗑️ Deleting brand:', brandName);
  
  const user = window.auth.currentUser;
  
  if (!user) {
    alert('❌ Please sign in first');
    return;
  }
  
  try {
    // Remove from local caches immediately (Optimistic UI)
    brandsCache = brandsCache.filter(b => b !== brandName);
    brandAutocompleteCache = brandAutocompleteCache.filter(b => b !== brandName);
    
    console.log('🧹 Removed from local caches');
    console.log('  brandsCache:', brandsCache.length, 'items');
    console.log('  brandAutocompleteCache:', brandAutocompleteCache.length, 'items');
    
    // Refresh display immediately
    renderBrandsList();
    
    // ✅ FIXED: Delete from Firebase properly
    const { collection, query, where, getDocs, deleteDoc, doc } = window.firebaseImports;
    const userId = user.uid;
    
    const brandsRef = collection(window.db, 'tenants', userId, 'brands');
    
    // Query for brands with this name
    const q = query(brandsRef, where('name', '==', brandName));
    const snapshot = await getDocs(q);
    
    console.log('📊 Firebase query found', snapshot.size, 'documents to delete');
    
    if (snapshot.empty) {
      console.warn('⚠️ Brand not found in Firebase:', brandName);
      
      // Try alternate field name
      const q2 = query(brandsRef, where('brandName', '==', brandName));
      const snapshot2 = await getDocs(q2);
      
      console.log('📊 Trying "brandName" field, found', snapshot2.size, 'documents');
      
      if (snapshot2.empty) {
        console.error('❌ Brand not found with either field name');
        alert(`⚠️ Brand "${brandName}" not found in database`);
        return;
      }
      
      // Delete from alternate query
      const deletePromises2 = [];
      snapshot2.forEach((docSnap) => {
        console.log('  Deleting doc:', docSnap.id);
        deletePromises2.push(deleteDoc(docSnap.ref));
      });
      
      await Promise.all(deletePromises2);
      console.log('✅ Brand deleted from Firebase (brandName field)');
      alert(`✅ Brand "${brandName}" deleted successfully!`);
      return;
    }
    
    // Delete all matching documents
    const deletePromises = [];
    snapshot.forEach((docSnap) => {
      console.log('  Deleting doc:', docSnap.id, '→', docSnap.data());
      deletePromises.push(deleteDoc(docSnap.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Brand deleted from Firebase:', brandName);
    alert(`✅ Brand "${brandName}" deleted successfully!`);
    
  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    console.error('Error details:', error.message);
    alert('❌ Error deleting brand: ' + error.message);
    
    // Reload brands to sync
    loadBrands();
  }
}


/**
 * ==========================================
 * SECTION 10: HELPER FUNCTIONS
 * ==========================================
 */

function goBackHome() {
  console.log('🏠 Going back to home');
  
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.display = 'flex';
  }
  
  const brandsPage = document.getElementById('brandsPage');
  if (brandsPage) {
    brandsPage.style.display = 'none';
  }
  
  if (typeof navigateToHome === 'function') {
    navigateToHome();
  } else if (typeof navigateTo === 'function') {
    navigateTo('dashboard');
  } else {
    location.reload();
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

console.log('✅ Brand Manager Module Loaded (Firebase)');
