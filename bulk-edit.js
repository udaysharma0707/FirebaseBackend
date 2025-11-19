/**
 * ==========================================
 * 📦 BULK EDIT MODULE - ALL OPERATIONS
 * ==========================================
 * Handles: Category, Unit Type, Stock, Selling Price, Brand, Size
 * Created: Nov 11, 2025
 * Fixed: Nov 11, 2025 - Cancel button & counter issues
 * ==========================================
 */

// ✅ Global state for bulk edit mode
let bulkEditMode = {
  active: false,
  field: null, // 'category', 'unitType', 'stock', 'sellingPrice', 'brand', 'size'
  value: null,
  selectedProducts: []
};

/**
 * ==========================================
 * 🎯 BULK EDIT - CATEGORY
 * ==========================================
 */

/**
 * Show Category Bulk Edit - FIXED: Shows cancel button immediately
 */
function showCategoryBulkEdit() {
  console.log('📝 Opening category bulk edit mode...');
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show category selection UI AND cancel button
  document.getElementById('categorySelectionDropdown').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block'; // ← FIXED: Show immediately
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  console.log('✅ Category selection UI shown');
}


/**
 * Select Bulk Category - FIXED: No toast message
 */
function selectBulkCategory(category) {
  console.log('📦 Selected category:', category);
  
  // ✅ Close category dropdown
  document.getElementById('categoryDropdownBtn').click();
  
  setTimeout(() => {
    // ✅ Set bulk edit mode
    bulkEditMode = {
      active: true,
      field: 'category',
      value: category,
      selectedProducts: []
    };
    
    // ✅ Update UI
    document.getElementById('selectedCategoryText').textContent = category;
    document.getElementById('updateCategoryBtn').style.display = 'inline-block';
    // Cancel button already shown by showCategoryBulkEdit()
    document.getElementById('selectedCount').textContent = '0';
    
    // ✅ Enable product selection
    enableProductSelection();
    
    // ❌ REMOVED: showToast() - No longer showing toast message
  }, 100);
}


/**
 * Apply Bulk Category Update - FIRESTORE VERSION
 */
async function applyBulkCategoryUpdate() {
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const category = bulkEditMode.value;
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update category to "${category}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateCategoryBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const user = window.auth?.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    // ✅ Update each product in Firestore
    let successCount = 0;
    for (const productId of bulkEditMode.selectedProducts) {
      try {
        const product = cachedProducts.find(p => p.id === productId);
        if (!product) continue;
        
        // Update product data
        const updatedProduct = {
          ...product,
          category: category,
          updatedAt: new Date().toISOString()
        };
        
        // Save to Firestore
        const productRef = doc(window.db, 'tenants', userId, 'products', productId);
        await setDoc(productRef, updatedProduct);
        
        // Update local cache
        const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
        if (cacheIdx !== -1) {
          cachedProducts[cacheIdx].category = category;
        }
        
        successCount++;
      } catch (error) {
        console.error('Error updating product:', productId, error);
      }
    }
    
    // Update cache
    localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    
    console.log(`✅ Updated ${successCount}/${count} products`);
    
    // Cancel and re-render
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
    alert(`✅ Updated ${successCount} products successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 BULK EDIT - UNIT TYPE
 * ==========================================
 */

/**
 * Show Unit Type Bulk Edit - FIXED: Shows cancel button immediately
 */
function showUnitTypeBulkEdit() {
  console.log('📝 Opening unit type bulk edit mode...');
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show unit type selection UI AND cancel button
  document.getElementById('unitTypeSelectionDropdown').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block'; // ← FIXED: Show immediately
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  console.log('✅ Unit type selection UI shown');
}

/**
 * Select Bulk Unit Type - FIXED: No toast message
 */
function selectBulkUnitType(unitType) {
  console.log('📦 Selected unit type:', unitType);
  
  // ✅ Close unit type dropdown
  document.getElementById('unitTypeDropdownBtn').click();
  
  setTimeout(() => {
    // ✅ Set bulk edit mode
    bulkEditMode = {
      active: true,
      field: 'unitType',
      value: unitType,
      selectedProducts: []
    };
    
    // ✅ Update UI
    document.getElementById('selectedUnitTypeText').textContent = unitType;
    document.getElementById('updateUnitTypeBtn').style.display = 'inline-block';
    // Cancel button already shown by showUnitTypeBulkEdit()
    document.getElementById('selectedCountUnitType').textContent = '0';
    
    // ✅ Enable product selection
    enableProductSelection();
    
    // ❌ REMOVED: showToast() - No longer showing toast message
  }, 100);
}

/**
 * Apply Bulk Unit Type Update - FIRESTORE VERSION
 */
async function applyBulkUnitTypeUpdate() {
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const unitType = bulkEditMode.value;
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update unit type to "${unitType}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateUnitTypeBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const user = window.auth?.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    let successCount = 0;
    for (const productId of bulkEditMode.selectedProducts) {
      try {
        const product = cachedProducts.find(p => p.id === productId);
        if (!product) continue;
        
        const updatedProduct = {
          ...product,
          unitType: unitType,
          updatedAt: new Date().toISOString()
        };
        
        const productRef = doc(window.db, 'tenants', userId, 'products', productId);
        await setDoc(productRef, updatedProduct);
        
        const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
        if (cacheIdx !== -1) {
          cachedProducts[cacheIdx].unitType = unitType;
        }
        
        successCount++;
      } catch (error) {
        console.error('Error updating product:', productId, error);
      }
    }
    
    localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
    alert(`✅ Updated ${successCount} products successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 COMMON FUNCTIONS - SELECTION & CANCEL
 * ==========================================
 */

/**
 * Enable Product Selection Mode
 */
function enableProductSelection() {
  console.log('🖱️ Product selection mode enabled');
  enableProductSelectionDesktop();
  enableProductSelectionMobile();
}

/**
 * Enable Desktop Selection
 */
function enableProductSelectionDesktop() {
  const tableRows = document.querySelectorAll('#productsTableBody tr[data-product-id]');
  
  tableRows.forEach(row => {
    const productId = row.getAttribute('data-product-id');
    row.classList.add('product-selectable');
    row.onclick = null;
    row.onclick = function(event) {
      if (event.target.closest('.btn')) return;
      event.stopPropagation();
      event.preventDefault();
      toggleProductSelectionDesktop(productId, row);
    };
  });
  
  console.log('✅ Desktop selection enabled for', tableRows.length, 'rows');
}

/**
 * Enable Mobile Selection
 */
function enableProductSelectionMobile() {
  const mobileCards = document.querySelectorAll('.mobile-item[data-product-id]');
  
  mobileCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    card.classList.add('product-selectable');
    card.onclick = null;
    card.onclick = function(event) {
      if (event.target.closest('.btn')) return;
      event.stopPropagation();
      event.preventDefault();
      toggleProductSelectionMobile(productId, card);
    };
  });
  
  console.log('✅ Mobile selection enabled for', mobileCards.length, 'cards');
}

/**
 * Toggle Desktop Product Selection - FIXED: Updates correct counter
 */
function toggleProductSelectionDesktop(productId, row) {
  if (!bulkEditMode.active) return;
  
  const index = bulkEditMode.selectedProducts.indexOf(productId);
  
  if (index > -1) {
    bulkEditMode.selectedProducts.splice(index, 1);
    row.classList.remove('product-selected');
  } else {
    bulkEditMode.selectedProducts.push(productId);
    row.classList.add('product-selected');
  }
  
  // ✅ FIXED: Update count based on field
  updateSelectedCount();
}

/**
 * Toggle Mobile Product Selection - FIXED: Updates correct counter
 */
function toggleProductSelectionMobile(productId, card) {
  if (!bulkEditMode.active) return;
  
  const indicator = card.querySelector('.selection-indicator');
  const index = bulkEditMode.selectedProducts.indexOf(productId);
  
  if (index > -1) {
    bulkEditMode.selectedProducts.splice(index, 1);
    card.classList.remove('product-selected');
    if (indicator) indicator.style.display = 'none';
  } else {
    bulkEditMode.selectedProducts.push(productId);
    card.classList.add('product-selected');
    if (indicator) indicator.style.display = 'flex';
  }
  
  // ✅ FIXED: Update count based on field
  updateSelectedCount();
}

/**
 * Update Selected Count - FIXED: Updates correct counter based on field
 */
/**
 * Update Selected Count - FIXED: Updates correct counter based on field
 */
function updateSelectedCount() {
  const count = bulkEditMode.selectedProducts.length;
  
  if (bulkEditMode.field === 'category') {
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'unitType') {
    const el = document.getElementById('selectedCountUnitType');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'sellingPrice') {
    const el = document.getElementById('selectedCountSellingPrice');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'size') {
    const el = document.getElementById('selectedCountSize');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'brand') {
    const el = document.getElementById('selectedCountBrand');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'stockStatus') {
    const el = document.getElementById('selectedCountStockStatus');
    if (el) el.textContent = count;
  }
}




/**
 * Cancel Bulk Edit Mode - FIXED: Hides ALL elements properly
 */
/**
 * Cancel Bulk Edit Mode - FIXED: Hides ALL elements properly
 */
/**
 * Cancel Bulk Edit Mode - FIXED: Hides ALL elements properly
 */
function cancelBulkEdit() {
  console.log('✕ Cancelling bulk edit mode');
  
  // ✅ Reset state
  bulkEditMode = {
    active: false,
    field: null,
    value: null,
    selectedProducts: []
  };
  
  // ✅ SHOW MAIN DROPDOWN BUTTON BACK
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'inline-block';
  }
  
  // ✅ FIXED: Hide ALL UI elements
  hideElement('categorySelectionDropdown');
  hideElement('unitTypeSelectionDropdown');
  hideElement('sellingPriceInputContainer');
  hideElement('sizeInputContainer');
  hideElement('brandInputContainer');
  hideElement('stockAdjustmentContainer');
  hideElement('stockStatusSelectionDropdown'); // ← NEW
  hideElement('updateCategoryBtn');
  hideElement('updateUnitTypeBtn');
  hideElement('updateSellingPriceBtn');
  hideElement('updateSizeBtn');
  hideElement('updateBrandBtn');
  hideElement('updateStockStatusBtn'); // ← NEW
  hideElement('cancelBulkEditBtn');
  hideElement('updateStockChangesBtn');
  hideElement('bulkEditInfoText');
  
  const bulkToolbar = document.getElementById('bulkEditToolbar');
  if (bulkToolbar) bulkToolbar.classList.remove('active');
  
  // ✅ Reset text
  const selectedCategoryText = document.getElementById('selectedCategoryText');
  if (selectedCategoryText) selectedCategoryText.textContent = 'Select Category';
  
  const selectedUnitTypeText = document.getElementById('selectedUnitTypeText');
  if (selectedUnitTypeText) selectedUnitTypeText.textContent = 'Select Unit Type';
  
  const selectedStockStatusText = document.getElementById('selectedStockStatusText');
  if (selectedStockStatusText) selectedStockStatusText.textContent = 'Select Stock Status';
  
  const selectedCount = document.getElementById('selectedCount');
  if (selectedCount) selectedCount.textContent = '0';
  
  const selectedCountUnitType = document.getElementById('selectedCountUnitType');
  if (selectedCountUnitType) selectedCountUnitType.textContent = '0';
  
  const selectedCountSellingPrice = document.getElementById('selectedCountSellingPrice');
  if (selectedCountSellingPrice) selectedCountSellingPrice.textContent = '0';
  
  const selectedCountSize = document.getElementById('selectedCountSize');
  if (selectedCountSize) selectedCountSize.textContent = '0';
  
  const selectedCountBrand = document.getElementById('selectedCountBrand');
  if (selectedCountBrand) selectedCountBrand.textContent = '0';
  
  const selectedCountStockStatus = document.getElementById('selectedCountStockStatus');
  if (selectedCountStockStatus) selectedCountStockStatus.textContent = '0';
  
  // ✅ Clear inputs
  const priceInput = document.getElementById('sellingPriceInput');
  if (priceInput) priceInput.value = '';
  
  const sizeInput = document.getElementById('sizeInput');
  if (sizeInput) sizeInput.value = '';
  
  const brandInput = document.getElementById('brandInput');
  if (brandInput) brandInput.value = '';
  
  const stockInput = document.getElementById('stockAdjustmentInput');
  if (stockInput) stockInput.value = '10';
  
  // ✅ Remove selection classes
  document.querySelectorAll('.product-selected').forEach(el => {
    el.classList.remove('product-selected');
  });
  
  document.querySelectorAll('.selection-indicator').forEach(el => {
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.product-selectable').forEach(el => {
    el.classList.remove('product-selectable');
    el.onclick = null;
  });
  
  // ✅ Remove stock adjustable classes
  document.querySelectorAll('.stock-adjustable').forEach(el => {
    el.classList.remove('stock-adjustable');
    el.onclick = null;
  });
  
  console.log('✅ Bulk edit mode cancelled');
}

/**
 * Helper: Hide Element
 */
function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}


/**
 * ==========================================
 * 🎯 BULK EDIT - SELLING PRICE
 * ==========================================
 */

/**
 * Show Selling Price Bulk Edit
 */
/**
 * Show Selling Price Bulk Edit - FIXED: Resets state properly
 */
function showSellingPriceBulkEdit() {
  console.log('📝 Opening selling price bulk edit mode...');
  
  // ✅ RESET STATE FIRST (prevents ghost selections)
  bulkEditMode = {
    active: false, // Not active until user enters a price
    field: null,
    value: null,
    selectedProducts: []
  };
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show selling price input AND cancel button
  document.getElementById('sellingPriceInputContainer').style.display = 'flex';
  document.getElementById('updateSellingPriceBtn').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  // ✅ Reset counter to 0
  const countEl = document.getElementById('selectedCountSellingPrice');
  if (countEl) countEl.textContent = '0';
  
  // ✅ Set up input listener
  const priceInput = document.getElementById('sellingPriceInput');
  priceInput.value = ''; // Clear input
  
  // ✅ Listen for Enter key or input change
  priceInput.addEventListener('input', function() {
    const price = parseFloat(priceInput.value);
    if (!isNaN(price) && price > 0) {
      // ✅ Set bulk edit mode
      bulkEditMode = {
        active: true,
        field: 'sellingPrice',
        value: price,
        selectedProducts: []
      };
      
      // ✅ Enable product selection
      enableProductSelection();
      
      console.log('✅ Selling price set to:', price);
    }
  });
  
  // ✅ Focus on input
  setTimeout(() => priceInput.focus(), 100);
  
  console.log('✅ Selling price input shown');
}


/**
 * Apply Bulk Selling Price Update - FIRESTORE VERSION
 */
async function applyBulkSellingPriceUpdate() {
  const priceInput = document.getElementById('sellingPriceInput');
  const price = parseFloat(priceInput.value);
  
  if (isNaN(price) || price <= 0) {
    alert('⚠️ Please enter a valid selling price');
    priceInput.focus();
    return;
  }
  
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update selling price to ₹${price} for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateSellingPriceBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const user = window.auth?.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    let successCount = 0;
    for (const productId of bulkEditMode.selectedProducts) {
      try {
        const product = cachedProducts.find(p => p.id === productId);
        if (!product) continue;
        
        const updatedProduct = {
          ...product,
          price: price,
          updatedAt: new Date().toISOString()
        };
        
        const productRef = doc(window.db, 'tenants', userId, 'products', productId);
        await setDoc(productRef, updatedProduct);
        
        const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
        if (cacheIdx !== -1) {
          cachedProducts[cacheIdx].price = price;
        }
        
        successCount++;
      } catch (error) {
        console.error('Error updating product:', productId, error);
      }
    }
    
    localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
    alert(`✅ Updated ${successCount} products successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 BULK EDIT - SIZE
 * ==========================================
 */

/**
 * Show Size Bulk Edit - FIXED: Resets state properly
 */
function showSizeBulkEdit() {
  console.log('📝 Opening size bulk edit mode...');
  
  // ✅ RESET STATE FIRST (prevents ghost selections)
  bulkEditMode = {
    active: false, // Not active until user enters a size
    field: null,
    value: null,
    selectedProducts: []
  };
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show size input AND cancel button
  document.getElementById('sizeInputContainer').style.display = 'flex';
  document.getElementById('updateSizeBtn').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  // ✅ Reset counter to 0
  const countEl = document.getElementById('selectedCountSize');
  if (countEl) countEl.textContent = '0';
  
  // ✅ Set up input listener
  const sizeInput = document.getElementById('sizeInput');
  sizeInput.value = ''; // Clear input
  
  // ✅ Listen for input change
  sizeInput.addEventListener('input', function() {
    const size = sizeInput.value.trim();
    if (size && size.length > 0) {
      // ✅ Set bulk edit mode
      bulkEditMode = {
        active: true,
        field: 'size',
        value: size,
        selectedProducts: []
      };
      
      // ✅ Enable product selection
      enableProductSelection();
      
      console.log('✅ Size set to:', size);
    }
  });
  
  // ✅ Focus on input
  setTimeout(() => sizeInput.focus(), 100);
  
  console.log('✅ Size input shown');
}

/**
 * Apply Bulk Size Update - FIRESTORE VERSION
 */
async function applyBulkSizeUpdate() {
  const sizeInput = document.getElementById('sizeInput');
  const size = sizeInput.value.trim();
  
  // ✅ Validation
  if (!size || size.length === 0) {
    alert('⚠️ Please enter a size');
    sizeInput.focus();
    return;
  }
  
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update size to "${size}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateSizeBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const user = window.auth?.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    console.log(`📝 Updating size to "${size}" for ${count} products...`);
    
    // ✅ Update each product in Firestore
    let successCount = 0;
    for (const productId of bulkEditMode.selectedProducts) {
      try {
        const product = cachedProducts.find(p => p.id === productId);
        if (!product) {
          console.warn('⚠️ Product not found:', productId);
          continue;
        }
        
        // Update product data
        const updatedProduct = {
          ...product,
          size: size,
          updatedAt: new Date().toISOString()
        };
        
        // Save to Firestore
        const productRef = doc(window.db, 'tenants', userId, 'products', productId);
        await setDoc(productRef, updatedProduct);
        
        // Update local cache
        const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
        if (cacheIdx !== -1) {
          cachedProducts[cacheIdx].size = size;
        }
        
        successCount++;
        console.log(`✅ Updated product ${successCount}/${count}`);
        
      } catch (error) {
        console.error('❌ Error updating product:', productId, error);
      }
    }
    
    // Update localStorage cache
    try {
      localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
      console.log('💾 Cache updated');
    } catch (e) {
      console.warn('⚠️ Failed to update cache:', e);
    }
    
    console.log(`✅ Bulk update complete: ${successCount}/${count} products updated`);
    
    // ✅ Cancel bulk edit mode
    cancelBulkEdit();
    
    // Re-render products
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
    alert(`✅ Successfully updated ${successCount} product(s)!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 BULK EDIT - BRAND
 * ==========================================
 */

/**
 * Show Brand Bulk Edit - FIXED: Resets state properly
 */
function showBrandBulkEdit() {
  console.log('📝 Opening brand bulk edit mode...');
  
  // ✅ RESET STATE FIRST (prevents ghost selections)
  bulkEditMode = {
    active: false, // Not active until user enters a brand
    field: null,
    value: null,
    selectedProducts: []
  };
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show brand input AND cancel button
  document.getElementById('brandInputContainer').style.display = 'flex';
  document.getElementById('updateBrandBtn').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  // ✅ Reset counter to 0
  const countEl = document.getElementById('selectedCountBrand');
  if (countEl) countEl.textContent = '0';
  
  // ✅ Set up input listener
  const brandInput = document.getElementById('brandInput');
  brandInput.value = ''; // Clear input
  
  // ✅ Listen for input change
  brandInput.addEventListener('input', function() {
    const brand = brandInput.value.trim();
    if (brand && brand.length > 0) {
      // ✅ Set bulk edit mode
      bulkEditMode = {
        active: true,
        field: 'brand',
        value: brand,
        selectedProducts: []
      };
      
      // ✅ Enable product selection
      enableProductSelection();
      
      console.log('✅ Brand set to:', brand);
    }
  });
  
  // ✅ Focus on input
  setTimeout(() => brandInput.focus(), 100);
  
  console.log('✅ Brand input shown');
}
/**
 * Apply Bulk Brand Update - FIRESTORE VERSION
 */
async function applyBulkBrandUpdate() {
  const brandInput = document.getElementById('brandInput');
  const brand = brandInput.value.trim();
  
  // ✅ Validation
  if (!brand || brand.length === 0) {
    alert('⚠️ Please enter a brand');
    brandInput.focus();
    return;
  }
  
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update brand to "${brand}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateBrandBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const user = window.auth?.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    console.log(`📝 Updating brand to "${brand}" for ${count} products...`);
    
    // ✅ Update each product in Firestore
    let successCount = 0;
    for (const productId of bulkEditMode.selectedProducts) {
      try {
        const product = cachedProducts.find(p => p.id === productId);
        if (!product) {
          console.warn('⚠️ Product not found:', productId);
          continue;
        }
        
        // Update product data
        const updatedProduct = {
          ...product,
          brand: brand,
          updatedAt: new Date().toISOString()
        };
        
        // Save to Firestore
        const productRef = doc(window.db, 'tenants', userId, 'products', productId);
        await setDoc(productRef, updatedProduct);
        
        // Update local cache
        const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
        if (cacheIdx !== -1) {
          cachedProducts[cacheIdx].brand = brand;
        }
        
        successCount++;
        console.log(`✅ Updated product ${successCount}/${count}`);
        
      } catch (error) {
        console.error('❌ Error updating product:', productId, error);
      }
    }
    
    // Update localStorage cache
    try {
      localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
      console.log('💾 Cache updated');
    } catch (e) {
      console.warn('⚠️ Failed to update cache:', e);
    }
    
    console.log(`✅ Bulk update complete: ${successCount}/${count} products updated`);
    
    // ✅ Cancel bulk edit mode
    cancelBulkEdit();
    
    // Re-render products
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
    alert(`✅ Successfully updated ${successCount} product(s)!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 BULK EDIT - STOCK ADJUSTMENT (INSTANT CLICK)
 * ==========================================
 */

/**
 * Show Stock Adjustment Mode
 */
/**
 * Show Stock Adjustment Mode
 */
function showStockAdjustmentEdit() {
  console.log('📝 Opening stock adjustment mode...');
  
  // ✅ RESET STATE
  bulkEditMode = {
    active: true,
    field: 'stockAdjustment',
    value: null,
    operation: 'reduce',
    amount: 10,
    selectedProducts: []
  };
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show stock adjustment UI AND both buttons
  document.getElementById('stockAdjustmentContainer').style.display = 'block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
  document.getElementById('updateStockChangesBtn').style.display = 'inline-block'; // ← NEW
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  // ✅ Set default operation
  setStockOperation('reduce');
  
  // ✅ Listen for input changes
  const stockInput = document.getElementById('stockAdjustmentInput');
  stockInput.addEventListener('input', function() {
    const amount = parseInt(stockInput.value);
    if (!isNaN(amount) && amount > 0) {
      bulkEditMode.amount = amount;
      console.log('✅ Stock adjustment amount set to:', amount);
    }
  });
  
  // ✅ Enable stock adjustment mode
  enableStockAdjustmentMode();
  
  console.log('✅ Stock adjustment mode active');
}

/**
 * Set Stock Operation (Add or Reduce)
 */
function setStockOperation(operation) {
  bulkEditMode.operation = operation;
  
  const btn = document.getElementById('stockOperationBtn');
  if (operation === 'add') {
    btn.innerHTML = '<i class="bi bi-plus-circle"></i> Add by';
    btn.classList.remove('btn-outline-danger');
    btn.classList.add('btn-outline-success');
  } else {
    btn.innerHTML = '<i class="bi bi-dash-circle"></i> Reduce by';
    btn.classList.remove('btn-outline-success');
    btn.classList.add('btn-outline-danger');
  }
  
  console.log('✅ Stock operation set to:', operation);
}

/**
 * Enable Stock Adjustment Mode - Click to adjust
 */
/**
 * Enable Stock Adjustment Mode - Click to adjust (NO SELECTION INDICATORS)
 */
function enableStockAdjustmentMode() {
  console.log('🖱️ Stock adjustment mode enabled');
  
  // Desktop
  const tableRows = document.querySelectorAll('#productsTableBody tr[data-product-id]');
  tableRows.forEach(row => {
    const productId = row.getAttribute('data-product-id');
    const product = cachedProducts.find(p => p.id === productId);
    
    // Only enable for products with NUMERIC stock
    if (product && typeof product.stock === 'number') {
      row.classList.add('stock-adjustable');
      row.onclick = function(event) {
        if (event.target.closest('.btn')) return;
        event.stopPropagation();
        event.preventDefault();
        adjustProductStock(productId, row);
      };
    }
  });
  
  // Mobile - FIXED: Prevent selection indicator from appearing
  const mobileCards = document.querySelectorAll('.mobile-item[data-product-id]');
  mobileCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    const product = cachedProducts.find(p => p.id === productId);
    
    // Only enable for products with NUMERIC stock
    if (product && typeof product.stock === 'number') {
      card.classList.add('stock-adjustable');
      
      // ✅ FIXED: Remove any existing selection indicator
      const indicator = card.querySelector('.selection-indicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
      
      // ✅ FIXED: Prevent card from being selected
      card.classList.remove('product-selectable');
      card.classList.remove('product-selected');
      
      // ✅ Set click handler for stock adjustment (NO SELECTION)
      card.onclick = function(event) {
        if (event.target.closest('.btn')) return;
        event.stopPropagation();
        event.preventDefault();
        
        // ✅ FIXED: Ensure indicator stays hidden during adjustment
        if (indicator) indicator.style.display = 'none';
        
        adjustProductStock(productId, card);
      };
    }
  });
  
  console.log('✅ Stock adjustment enabled (selection disabled)');
}

/**
 * Adjust Product Stock - FIRESTORE VERSION
 */
async function adjustProductStock(productId, element) {
  if (!bulkEditMode.active || bulkEditMode.field !== 'stockAdjustment') return;
  
  const operation = bulkEditMode.operation;
  const amount = bulkEditMode.amount;
  
  if (!amount || amount <= 0) {
    alert('⚠️ Please enter a valid amount');
    return;
  }
  
  const indicator = element.querySelector('.selection-indicator');
  if (indicator) indicator.style.display = 'none';
  
  element.classList.remove('product-selected');
  
  showStockAnimation(element, operation, amount);
  
  try {
    const user = window.auth?.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const { doc, setDoc } = window.firebaseImports;
    const userId = user.uid;
    
    // Get product
    const product = cachedProducts.find(p => p.id === productId);
    if (!product || typeof product.stock !== 'number') {
      throw new Error('Invalid product or stock type');
    }
    
    // Calculate new stock
    let newStock = product.stock;
    if (operation === 'add') {
      newStock += amount;
    } else {
      newStock = Math.max(0, newStock - amount);
    }
    
    // Update product
    const updatedProduct = {
      ...product,
      stock: newStock,
      updatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    const productRef = doc(window.db, 'tenants', userId, 'products', productId);
    await setDoc(productRef, updatedProduct);
    
    // Update cache
    const cacheIdx = cachedProducts.findIndex(p => p.id === productId);
    if (cacheIdx !== -1) {
      cachedProducts[cacheIdx].stock = newStock;
    }
    
    localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    
    console.log('✅ Stock adjusted successfully');
    
    // Re-render
    if (typeof renderProducts === 'function') {
      renderProducts();
      setTimeout(() => {
        enableStockAdjustmentMode();
        document.querySelectorAll('.selection-indicator').forEach(ind => {
          ind.style.display = 'none';
        });
      }, 100);
    }
    
  } catch (error) {
    console.error('❌ Error adjusting stock:', error);
    alert('❌ Error: ' + error.message);
  }
}


/**
 * Show Stock Animation
 */
function showStockAnimation(element, operation, amount) {
  const animationDiv = document.createElement('div');
  animationDiv.className = 'stock-animation' + (operation === 'reduce' ? ' reduce' : '');
  animationDiv.textContent = (operation === 'add' ? '+' : '-') + amount;
  
  // Position relative to element
  element.style.position = 'relative';
  element.appendChild(animationDiv);
  
  // Remove after animation
  setTimeout(() => {
    animationDiv.remove();
  }, 1000);
}

/**
 * Update Stock Changes - Force sync webapp cache with Google Sheets
 */
/**
 * Update Stock Changes - Push webapp cache to Google Sheets
 */
async function updateStockChanges() {
  console.log('🔄 Pushing webapp stock to Google Sheets...');
  
  const btn = document.getElementById('updateStockChangesBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Syncing...';
  
  try {
    // ✅ Get all products with NUMERIC stock from webapp cache
    const productsToSync = [];
    
    if (typeof cachedProducts !== 'undefined') {
      cachedProducts.forEach(product => {
        if (typeof product.stock === 'number' && product.id) {
          productsToSync.push({
            id: product.id,
            stock: product.stock
          });
        }
      });
    }
    
    if (productsToSync.length === 0) {
      alert('⚠️ No products to sync');
      btn.disabled = false;
      btn.innerHTML = originalText;
      return;
    }
    
    console.log('📤 Syncing', productsToSync.length, 'products to Google Sheets');
    
    // ✅ Send batch update to backend
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'syncStockFromWebapp',
        products: productsToSync
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Sync failed');
    }
    
    console.log('✅ Synced successfully:', result);
    
    // ✅ Show success message
    if (typeof showToast === 'function') {
      showToast('✅ Synced', `Updated ${result.updatedCount || productsToSync.length} products in Google Sheets`, 'success');
    }
    
    // ✅ Cancel bulk edit mode
    cancelBulkEdit();
    
  } catch (error) {
    console.error('❌ Error syncing:', error);
    alert('❌ Error syncing to Google Sheets: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


/**
 * ==========================================
 * 🎯 BULK EDIT - STOCK STATUS
 * ==========================================
 */

/**
 * Show Stock Status Bulk Edit
 */
function showStockStatusBulkEdit() {
  console.log('📝 Opening stock status bulk edit mode...');
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show stock status selection UI AND cancel button
  document.getElementById('stockStatusSelectionDropdown').style.display = 'inline-block';
  document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  console.log('✅ Stock status selection UI shown');
}

/**
 * Select Bulk Stock Status
 */
function selectBulkStockStatus(status) {
  console.log('📦 Selected stock status:', status);
  
  // ✅ Close stock status dropdown
  document.getElementById('stockStatusDropdownBtn').click();
  
  setTimeout(() => {
    // ✅ Set bulk edit mode
    bulkEditMode = {
      active: true,
      field: 'stockStatus',
      value: status,
      selectedProducts: []
    };
    
    // ✅ Update UI with emoji
    const emoji = {
      'GOOD': '🟢 Good',
      'MEDIUM': '🟡 Medium',
      'LOW': '🔴 Low',
      'URGENT': '🔵 Urgent'
    }[status] || status;
    
    document.getElementById('selectedStockStatusText').textContent = emoji;
    document.getElementById('updateStockStatusBtn').style.display = 'inline-block';
    document.getElementById('selectedCountStockStatus').textContent = '0';
    
    // ✅ Enable product selection (ONLY for products with TEXT stock status)
    enableProductSelectionStockStatus();
    
  }, 100);
}

/**
 * Enable Product Selection for Stock Status (ONLY TEXT stock status products)
 */
function enableProductSelectionStockStatus() {
  console.log('🖱️ Stock status selection mode enabled');
  
  // Desktop
  const tableRows = document.querySelectorAll('#productsTableBody tr[data-product-id]');
  tableRows.forEach(row => {
    const productId = row.getAttribute('data-product-id');
    const product = cachedProducts.find(p => p.id === productId);
    
    // ✅ ONLY enable for products with TEXT stock status (not numeric)
    if (product && typeof product.stock === 'string' && ['GOOD', 'MEDIUM', 'LOW', 'URGENT'].includes(product.stock.toUpperCase())) {
      row.classList.add('product-selectable');
      row.onclick = function(event) {
        if (event.target.closest('.btn')) return;
        event.stopPropagation();
        event.preventDefault();
        toggleProductSelectionDesktop(productId, row);
      };
    }
  });
  
  // Mobile
  const mobileCards = document.querySelectorAll('.mobile-item[data-product-id]');
  mobileCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    const product = cachedProducts.find(p => p.id === productId);
    
    // ✅ ONLY enable for products with TEXT stock status (not numeric)
    if (product && typeof product.stock === 'string' && ['GOOD', 'MEDIUM', 'LOW', 'URGENT'].includes(product.stock.toUpperCase())) {
      card.classList.add('product-selectable');
      card.onclick = function(event) {
        if (event.target.closest('.btn')) return;
        event.stopPropagation();
        event.preventDefault();
        toggleProductSelectionMobile(productId, card);
      };
    }
  });
  
  console.log('✅ Stock status selection enabled (TEXT status products only)');
}

/**
 * Apply Bulk Stock Status Update
 */
async function applyBulkStockStatusUpdate() {
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const status = bulkEditMode.value;
  const count = bulkEditMode.selectedProducts.length;
  
  const emoji = {
    'GOOD': '🟢 Good',
    'MEDIUM': '🟡 Medium',
    'LOW': '🔴 Low',
    'URGENT': '🔵 Urgent'
  }[status] || status;
  
  if (!confirm(`Update stock status to "${emoji}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateStockStatusBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'bulkUpdateStockStatus',
        productIds: bulkEditMode.selectedProducts,
        stockStatus: status
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Backend update failed');
    }
    
    console.log('✅ Backend update successful:', result);
    
    // ✅ Update local cache
    if (typeof cachedProducts !== 'undefined') {
      bulkEditMode.selectedProducts.forEach(productId => {
        const product = cachedProducts.find(p => p.id === productId);
        if (product) {
          product.stock = status;
          product.stockStatus = status.toLowerCase();
        }
      });
      localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    }
    
    // ✅ Cancel bulk edit mode
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}





/**
 * Toast Notification Helper
 */
function showToast(title, message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(toastContainer);
  }
  
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#0d6efd';
  
  const toastHTML = `
    <div class="toast show" role="alert" style="min-width: 300px; margin-bottom: 10px;">
      <div class="toast-header" style="background: ${bgColor}; color: white;">
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  setTimeout(() => {
    const toasts = toastContainer.querySelectorAll('.toast');
    if (toasts.length > 0) toasts[0].remove();
  }, 3000);
}

/**
 * ==========================================
 * 🎯 INITIALIZE ON DOM READY
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Bulk edit module initialized');
  
  // ✅ Make functions globally accessible
  window.showCategoryBulkEdit = showCategoryBulkEdit;
  window.selectBulkCategory = selectBulkCategory;
  window.applyBulkCategoryUpdate = applyBulkCategoryUpdate;
  
  window.showUnitTypeBulkEdit = showUnitTypeBulkEdit;
  window.selectBulkUnitType = selectBulkUnitType;
  window.applyBulkUnitTypeUpdate = applyBulkUnitTypeUpdate;
  
  window.showSellingPriceBulkEdit = showSellingPriceBulkEdit;
  window.applyBulkSellingPriceUpdate = applyBulkSellingPriceUpdate;
  
  window.showSizeBulkEdit = showSizeBulkEdit;
  window.applyBulkSizeUpdate = applyBulkSizeUpdate;
  
  window.showBrandBulkEdit = showBrandBulkEdit;
  window.applyBulkBrandUpdate = applyBulkBrandUpdate;
  
  window.showStockAdjustmentEdit = showStockAdjustmentEdit;
  window.setStockOperation = setStockOperation;
  window.updateStockChanges = updateStockChanges;
  
  window.showStockStatusBulkEdit = showStockStatusBulkEdit; // ← NEW
  window.selectBulkStockStatus = selectBulkStockStatus; // ← NEW
  window.applyBulkStockStatusUpdate = applyBulkStockStatusUpdate; // ← NEW
  
  window.cancelBulkEdit = cancelBulkEdit;
});















