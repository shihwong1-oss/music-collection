/**
 * 唱片管理库 - 主应用应用
 */

function generateSafeCode(len = 6) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < len; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
}

class RecordStore {
    constructor() {
        this.records = [];
        this.artists = ['Michael Jackson', 'The Beatles', 'David Bowie', 'Prince'];
        this.labels = ['Columbia Records', 'EMI', 'Sony Music', 'Warner Bros'];
        this.channels = ['Amazon', '唱片行', '网店', '拍卖会'];
        this.loadFromStorage();
    }

    async loadFromFile() {
        try {
            const response = await fetch('data/data.json');
            if (response.ok) {
                const data = await response.json();
                this.records = data.records || [];
                this.artists = data.artists || ['Michael Jackson', 'The Beatles', 'David Bowie', 'Prince'];
                this.labels = data.labels || ['Columbia Records', 'EMI', 'Sony Music', 'Warner Bros'];
                this.channels = data.channels || ['Amazon', '唱片行', '网店', '拍卖会'];
                return true;
            }
        } catch (err) {
            console.log('data/data.json 不存在，使用默认数据');
        }
        return false;
    }

    loadFromStorage() {
        // 优先从 data/data.json 加载
        this.loadFromFile().then(loaded => {
            if (!loaded) {
                // 回退到 localStorage
                const stored = localStorage.getItem('musicRecords');
                const artists = localStorage.getItem('musicArtists');
                const labels = localStorage.getItem('musicLabels');
                const channels = localStorage.getItem('musicChannels');
                
                if (stored) this.records = JSON.parse(stored);
                if (artists) this.artists = JSON.parse(artists);
                if (labels) this.labels = JSON.parse(labels);
                if (channels) this.channels = JSON.parse(channels);
            }
        });
    }

    saveToStorage() {
        // 数据保存在 localStorage（浏览器本地）
        localStorage.setItem('musicRecords', JSON.stringify(this.records));
        localStorage.setItem('musicArtists', JSON.stringify(this.artists));
        localStorage.setItem('musicLabels', JSON.stringify(this.labels));
        localStorage.setItem('musicChannels', JSON.stringify(this.channels));
    }

    addRecord(record) {
        // 生成自定义ID: 分类首字母 + 细分首字母 + 时间戳(模拟唯一数值)
        const mainCat = record.mainCategory || 'other';
        const subCat = record.subCategory || 'other';
        
        const getInitials = (str) => {
            // 如果是中文，取拼音首字母（简单模拟，这里暂用X或首字符编码）
            if (/[\u4e00-\u9fa5]/.test(str)) {
                return 'X'; 
            }
            return str.substring(0, 1).toUpperCase();
        };

        // 尝试从 mainCategoryLabels 反查 key 或者直接使用 key
    let mainPrefix = 'O';
    const mainCatLabel = mainCategoryLabels[mainCat] ? mainCategoryLabels[mainCat] : mainCat; // 获取显示名称
    
    if (mainCategoryLabels[mainCat]) {
        // 如果传入的是 key (如 'pop')
        mainPrefix = mainCat.substring(0, 1).toUpperCase();
    } else {
        // 如果传入的是 label (如 '流行')，尝试反查 key
        const key = Object.keys(mainCategoryLabels).find(k => mainCategoryLabels[k] === mainCat);
        mainPrefix = key ? key.substring(0, 1).toUpperCase() : getInitials(mainCat);
    }

        let subPrefix = subCat.substring(0, 1).toUpperCase();
        if (/[\u4e00-\u9fa5]/.test(subCat)) {
             subPrefix = 'X'; 
        }

        let suffix = generateSafeCode(6);
        let customId = `${mainPrefix}${subPrefix}${suffix}`;
        let guard = 0;
        while (this.getRecord(customId) && guard < 5) {
            suffix = generateSafeCode(6);
            customId = `${mainPrefix}${subPrefix}${suffix}`;
            guard++;
        }

        const newRecord = {
            id: customId,
            createdAt: new Date().toISOString(),
            ...record
        };
        this.records.unshift(newRecord);
        this.saveToStorage();
        return newRecord;
    }

    updateRecord(id, updates) {
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
            this.records[index] = { ...this.records[index], ...updates };
            this.saveToStorage();
            return this.records[index];
        }
        return null;
    }

    deleteRecord(id) {
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
            const deleted = this.records[index];
            this.records.splice(index, 1);
            this.saveToStorage();
            return deleted;
        }
        return null;
    }

    deleteRecords(ids) {
        const deleted = [];
        ids.forEach(id => {
            const result = this.deleteRecord(id);
            if (result) deleted.push(result);
        });
        return deleted;
    }

    getRecord(id) {
        if (!id) return null;
        const needle = String(id).trim();
        const byExact = this.records.find(r => r.id === needle);
        if (byExact) return byExact;
        const byCase = this.records.find(r => String(r.id).toLowerCase() === needle.toLowerCase());
        if (byCase) return byCase;
        return null;
    }

    getAllRecords() {
        return this.records;
    }

    getRecordsByCategory(category) {
        if (category === 'all') return this.records;
        return this.records.filter(r => r.category === category);
    }

    searchRecords(query) {
        if (!query) return this.records;
        const q = String(query).toLowerCase();
        const qNormalized = q.replace(/o/g, '0').replace(/[il]/g, '1');
        return this.records.filter(r => {
            const id = String(r.id || '').toLowerCase();
            const name = String(r.name || '').toLowerCase();
            const artist = String(r.artist || '').toLowerCase();
            const category = String(r.category || '').toLowerCase();
            const idMatches = id.includes(q) || id.includes(qNormalized);
            return idMatches || name.includes(q) || artist.includes(q) || category.includes(q);
        });
    }

    sortRecords(records, sortBy) {
        const sorted = [...records];
        switch (sortBy) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'artist-asc':
                sorted.sort((a, b) => a.artist.localeCompare(b.artist));
                break;
            case 'rating-desc':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }
        return sorted;
    }

    addCategory(category) {
        if (!this.customCategories.includes(category)) {
            this.customCategories.push(category);
            this.saveToStorage();
        }
    }

    deleteCategory(category) {
        const index = this.customCategories.indexOf(category);
        if (index !== -1) {
            this.customCategories.splice(index, 1);
            this.records.forEach(r => {
                if (r.category === category) {
                    r.category = '';
                }
            });
            this.saveToStorage();
        }
    }

    // 艺术家管理
    addArtist(artist) {
        if (artist && !this.artists.includes(artist)) {
            this.artists.push(artist);
            this.saveToStorage();
        }
    }

    getArtists() {
        return this.artists;
    }

    // 唱片公司管理
    addLabel(label) {
        if (label && !this.labels.includes(label)) {
            this.labels.push(label);
            this.saveToStorage();
        }
    }

    getLabels() {
        return this.labels;
    }

    // 购买渠道管理
    addChannel(channel) {
        if (channel && !this.channels.includes(channel)) {
            this.channels.push(channel);
            this.saveToStorage();
        }
    }

    getChannels() {
        return this.channels;
    }

    // 筛选记录
    filterRecords(filters = {}) {
        let results = [...this.records];

        // 按大分类筛选
        if (filters.mainCategory) {
            results = results.filter(r => r.mainCategory === filters.mainCategory);
        }

        // 按细分分类筛选
        if (filters.subCategory) {
            results = results.filter(r => r.subCategory === filters.subCategory);
        }

        // 按时间范围筛选
        if (filters.dateFrom || filters.dateTo) {
            results = results.filter(r => {
                const date = new Date(r.releaseDate);
                if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
                if (filters.dateTo && date > new Date(filters.dateTo)) return false;
                return true;
            });
        }

        // 按格式筛选
        if (filters.format) {
            results = results.filter(r => r.format === filters.format);
        }

        // 按评分筛选
        if (filters.ratingMin !== undefined) {
            results = results.filter(r => (r.rating || 0) >= filters.ratingMin);
        }

        // 按购买渠道筛选
        if (filters.channel) {
            results = results.filter(r => r.purchaseChannel === filters.channel);
        }

        return results;
    }

    searchRecords(query) {
        if (!query) return this.records;
        const q = String(query).toLowerCase();
        return this.records.filter(r => 
            (r.id && String(r.id).toLowerCase().includes(q)) ||
            (r.name && r.name.toLowerCase().includes(q)) ||
            (r.artist && r.artist.toLowerCase().includes(q)) ||
            (r.category && r.category.toLowerCase().includes(q)) ||
            (r.intro && r.intro.toLowerCase().includes(q)) ||
            (r.label && r.label.toLowerCase().includes(q))
        );
    }

    sortRecords(records, sortBy) {
        const sorted = [...records];
        switch (sortBy) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'artist-asc':
                sorted.sort((a, b) => a.artist.localeCompare(b.artist));
                break;
            case 'rating-desc':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }
        return sorted;
    }

    getAllCategories() {
        return [...this.categories, ...this.customCategories];
    }

    getRecordsCountByCategory(category) {
        if (category === 'all') return this.records.length;
        return this.records.filter(r => r.category === category).length;
    }
}

// 全局应用实例
const store = new RecordStore();
let currentView = 'list-view';
let currentRecord = null;
let selectedRecordIds = new Set();
let currentSortBy = 'date-desc';
let currentFilters = {
    mainCategory: '',
    subCategory: '',
    dateFrom: '',
    dateTo: '',
    format: '',
    ratingMin: 0,
    channel: ''
};
let isSelectMode = false;
let scannerActive = false;
let videoStream = null;
 
let navScannerActive = false;
let navVideoStream = null;

// 细分分类定义
const subCategories = {
    'pop': ['国风流行', '港台流行', '欧美流行', '日本流行', '其他流行'],
    'rock': ['摇滚乐队', '摇滚歌手', '金属乐', '朋克摇滚', '其他摇滚'],
    'jazz': ['爵士乐大师', '现代爵士', '融合爵士', '蓝调爵士', '其他爵士'],
    'classical': ['交响曲', '协奏曲', '奏鸣曲', '室内乐', '其他古典'],
    'hiphop': ['说唱', '嘻哈乐队', '陷阱音乐', '其他嘻哈', ''],
    'electronic': ['电子音乐', '舞蹈音乐', '环境音乐', '工业电子', '其他电子'],
    'folk': ['民族民谣', '国内民谣', '国外民谣', '数字民谣', '其他民谣'],
    'other': ['其他']
};

const mainCategoryLabels = {
    pop: '流行',
    rock: '摇滚',
    jazz: '爵士',
    classical: '古典',
    hiphop: '嘻哈',
    electronic: '电子',
    folk: '民谣',
    other: '其他'
};

// 初始化应用
function initApp() {
    initEventListeners();
    renderRecordList();
    updateUI();
    initializeFormSelects(); // 初始化一次
    updateResetButtonVisibility();
}

// 事件监听器初始化
function initEventListeners() {
    // 导航按钮
    document.getElementById('add-btn')?.addEventListener('click', () => showForm());
    document.getElementById('export-data-btn')?.addEventListener('click', exportDataJson);
    document.getElementById('search-toggle-btn').addEventListener('click', showSearchBar);
    document.getElementById('search-close-btn').addEventListener('click', hideSearchBar);
    document.getElementById('search-input').addEventListener('input', (e) => {
        const results = store.searchRecords(e.target.value);
        renderRecordsList(results);
    });

    const navScanBtn = document.getElementById('fab-scan-btn');
    if (navScanBtn) {
        navScanBtn.addEventListener('click', () => {
            const navBar = document.querySelector('.nav-bar');
            const panel = document.getElementById('nav-scan-panel');
            if (!navBar || !panel) return;
            const active = navBar.classList.toggle('scan-active');
            if (active) {
                panel.classList.remove('hidden');
                navScanBtn.textContent = navScanBtn.id === 'nav-scan-btn' ? '✖ 关闭' : '✖';
                startNavScanner();
            } else {
                panel.classList.add('hidden');
                navScanBtn.textContent = navScanBtn.id === 'nav-scan-btn' ? '📷 扫码' : '📷';
                stopNavScanner();
                const err = document.getElementById('nav-scan-error');
                if (err) { err.textContent = ''; err.classList.add('hidden'); }
            }
        });
    }
    const navQrFile = document.getElementById('nav-qr-file');
    if (navQrFile) {
        navQrFile.addEventListener('change', handleNavQrFile);
    }
    
    const resetBtn = document.getElementById('btn-filter-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentFilters = {
                mainCategory: '',
                subCategory: '',
                dateFrom: '',
                dateTo: '',
                format: '',
                ratingMin: 0,
                channel: ''
            };
            renderRecordList();
            updateFilterButtonState('category', '');
            updateFilterButtonState('subCategory', '');
            updateFilterButtonState('format', '');
            updateFilterButtonState('rating', '');
            updateFilterButtonState('channel', '');
            hideAllDropdowns();
            updateResetButtonVisibility();
        });
    }

    // 筛选按钮 (下拉菜单逻辑)
    const filterButtons = [
        { btn: 'btn-filter-category', dropdown: 'menu-filter-category', type: 'category' },
        { btn: 'btn-filter-subcategory', dropdown: 'menu-filter-subcategory', type: 'subCategory' },
        { btn: 'btn-filter-more', dropdown: 'menu-filter-more', type: 'more' }
    ];

    filterButtons.forEach(item => {
        const btn = document.getElementById(item.btn);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = document.getElementById(item.dropdown).classList.contains('active');
            hideAllDropdowns();
            if (!isActive) {
                showDropdown(item.dropdown, item.type);
            }
        });
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', hideAllDropdowns);

    // 返回按钮
    document.getElementById('detail-back-btn').addEventListener('click', () => showView('list-view'));
    document.getElementById('form-back-btn').addEventListener('click', () => showView('list-view'));
    document.getElementById('form-cancel-btn').addEventListener('click', () => showView('list-view'));

    // 表单方法切换
    document.querySelectorAll('.add-method-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.add-method-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const method = e.target.dataset.method;
            document.querySelectorAll('.form-method').forEach(m => m.classList.remove('active'));
            document.getElementById(`${method}-method`).classList.add('active');
        });
    });

    // 表单提交
    document.getElementById('record-form').addEventListener('submit', saveRecord);

    // 大分类change事件
    document.getElementById('record-main-category').addEventListener('change', (e) => {
        const mainCat = e.target.value;
        const subSelect = document.getElementById('record-sub-category');
        subSelect.innerHTML = '<option value="">选择细分分类</option>';
        
        if (mainCat && subCategories[mainCat]) {
            subCategories[mainCat].forEach(sub => {
                if (sub) {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subSelect.appendChild(option);
                }
            });
        }
    });

    // 艺术家添加按钮
    document.getElementById('add-artist-btn').addEventListener('click', () => {
        const input = document.getElementById('artist-new-input');
        const select = document.getElementById('record-artist');
        if (input.classList.contains('hidden')) {
            input.classList.remove('hidden');
            select.classList.add('hidden');
            input.focus();
        } else {
            const value = input.value.trim();
            if (value) {
                store.addArtist(value);
                initializeFormSelects();
                select.value = value;
            }
            input.classList.add('hidden');
            select.classList.remove('hidden');
        }
    });

    // 唱片公司添加按钮
    document.getElementById('add-label-btn').addEventListener('click', () => {
        const input = document.getElementById('label-new-input');
        const select = document.getElementById('record-label');
        if (input.classList.contains('hidden')) {
            input.classList.remove('hidden');
            select.classList.add('hidden');
            input.focus();
        } else {
            const value = input.value.trim();
            if (value) {
                store.addLabel(value);
                initializeFormSelects();
                select.value = value;
            }
            input.classList.add('hidden');
            select.classList.remove('hidden');
        }
    });

    // 购买渠道添加按钮
    document.getElementById('add-channel-btn').addEventListener('click', () => {
        const input = document.getElementById('channel-new-input');
        const select = document.getElementById('record-purchase-channel');
        if (input.classList.contains('hidden')) {
            input.classList.remove('hidden');
            select.classList.add('hidden');
            input.focus();
        } else {
            const value = input.value.trim();
            if (value) {
                store.addChannel(value);
                initializeFormSelects();
                select.value = value;
            }
            input.classList.add('hidden');
            select.classList.remove('hidden');
        }
    });

    // 封面上传
    document.getElementById('cover-preview').addEventListener('click', () => {
        document.getElementById('record-cover').click();
    });
    document.getElementById('record-cover').addEventListener('change', handleCoverUpload);

    // 评分滑块
    document.getElementById('record-rating').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        document.getElementById('rating-display').textContent = value > 0 ? value : '-';
    });

    // 唱片详情操作
    // 使用事件委托处理，避免替换元素导致的引用问题
    document.addEventListener('click', (e) => {
        if (e.target.closest('#detail-edit-btn')) {
            if (currentRecord && currentRecord.id) {
                showFormForEdit(currentRecord.id);
            }
        }
        if (e.target.closest('#detail-delete-btn')) {
            if (currentRecord && currentRecord.id) {
                showDeleteConfirmation([currentRecord.id], () => {
                    store.deleteRecord(currentRecord.id);
                    showView('list-view');
                    renderRecordList();
                });
            }
        }
    });

    // 批量删除
    document.getElementById('batch-delete-btn').addEventListener('click', () => {
        const ids = Array.from(selectedRecordIds);
        showDeleteConfirmation(ids, () => {
            store.deleteRecords(ids);
            selectedRecordIds.clear();
            renderRecordList();
            updateUI();
        });
    });

    // 批量归类
    document.getElementById('batch-category-btn').addEventListener('click', showCategoryModal);

    // 批量取消
    document.getElementById('batch-cancel-btn').addEventListener('click', () => {
        selectedRecordIds.clear();
        renderRecordList();
        updateUI();
    });

    // 底部导航
    document.querySelectorAll('.footer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view === 'category-view') {
                renderCategoryView();
            }
            showView(view);
        });
    });

    // 模态框事件
    document.getElementById('cancel-modal-btn').addEventListener('click', hideModals);
    document.getElementById('modal-overlay').addEventListener('click', hideModals);

    // 排序模态框
    document.getElementById('sort-confirm-btn').addEventListener('click', applySorting);
    document.getElementById('sort-cancel-btn').addEventListener('click', hideModals);

    // 分类模态框
    document.getElementById('category-confirm-btn').addEventListener('click', applyBatchCategory);
    document.getElementById('category-cancel-btn').addEventListener('click', hideModals);

    // JSON 导入事件
    const jsonFile = document.getElementById('json-file');
    const jsonPlaceholder = document.getElementById('json-placeholder');
    const jsonUploadArea = document.querySelector('.json-import .upload-area');

    // 下载模板
    document.getElementById('download-template-btn').addEventListener('click', downloadJsonTemplate);

    // JSON 文件选择
    jsonPlaceholder.addEventListener('click', () => {
        jsonFile.click();
    });

    jsonFile.addEventListener('change', handleJsonFileUpload);

    // JSON 拖放事件
    jsonUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        jsonPlaceholder.classList.add('dragover');
    });

    jsonUploadArea.addEventListener('dragleave', () => {
        jsonPlaceholder.classList.remove('dragover');
    });

    jsonUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        jsonPlaceholder.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            jsonFile.files = files;
            handleJsonFileUpload({ target: jsonFile });
        }
    });

    // 导入 JSON 按钮
    document.getElementById('import-json-btn').addEventListener('click', importJsonData);
}

// 下拉菜单逻辑
function hideAllDropdowns() {
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('active'));
}

function showDropdown(id, type) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = generateDropdownContent(type);
    dropdown.classList.add('active');
    
    // 绑定下拉项点击事件
    // 使用事件委托到 dropdown 容器，避免每次重新绑定
    dropdown.onclick = (e) => {
        const opt = e.target.closest('.filter-option');
        if (opt) {
            e.stopPropagation();
            const value = opt.dataset.value;
            if (type === 'more') {
                // 打开对应的二级筛选下拉
                const targetDropdownId = `menu-filter-${value}`;
                hideAllDropdowns();
                showDropdown(targetDropdownId, value);
            } else {
                applyFilter(type, value);
                hideAllDropdowns();
            }
        }
    };
}

function generateDropdownContent(type) {
    let options = [];
    const currentValue = getCurrentFilterValue(type);
    
    switch(type) {
        case 'category':
            // 两级分类筛选逻辑
            options = Object.keys(mainCategoryLabels).map(key => ({ 
                label: mainCategoryLabels[key], 
                value: key,
                isGroup: true
            }));
            break;
        case 'subCategory':
            // 细分分类依赖于大分类
            if (currentFilters.mainCategory && subCategories[currentFilters.mainCategory]) {
                options = subCategories[currentFilters.mainCategory].map(sub => ({ label: sub, value: sub }));
            }
            break;
        case 'more':
            options = [
                { label: '时间', value: 'date' },
                { label: '格式', value: 'format' },
                { label: '评分', value: 'rating' },
                { label: '购买渠道', value: 'channel' },
            ];
            break;
        case 'date':
            options = [
                { label: '最近一周', value: 'week' },
                { label: '最近一月', value: 'month' },
                { label: '最近一年', value: 'year' }
            ];
            break;
        case 'format':
            options = [
                { label: '黑胶', value: 'vinyl' },
                { label: '光盘', value: 'cd' },
                { label: '磁带', value: 'cassette' },
                { label: '数字', value: 'digital' }
            ];
            break;
        case 'rating':
            options = [10, 9, 8, 7, 6].map(r => ({ label: `⭐ ${r}分及以上`, value: r }));
            break;
        case 'channel':
            options = store.getChannels().map(c => ({ label: c, value: c }));
            break;
    }
    
    // 添加"全部/清除"选项
    const allOption = `<button class="filter-option ${!currentValue ? 'selected' : ''}" data-value="">全部</button>`;
    
    return allOption + options.map(opt => `
        <button class="filter-option ${currentValue == opt.value ? 'selected' : ''}" data-value="${opt.value}">
            ${escapeHtml(String(opt.label))}
        </button>
    `).join('');
}

function getCurrentFilterValue(type) {
    switch(type) {
        case 'category': return currentFilters.mainCategory;
        case 'subCategory': return currentFilters.subCategory;
        case 'format': return currentFilters.format;
        case 'rating': return currentFilters.ratingMin;
        case 'channel': return currentFilters.channel;
        default: return '';
    }
}

function applyFilter(type, value) {
    switch(type) {
        case 'category':
            currentFilters.mainCategory = value;
            currentFilters.subCategory = ''; // 切换大分类时重置细分
            updateFilterButtonState('subCategory', '');
            break;
        case 'subCategory':
            currentFilters.subCategory = value;
            break;
        case 'date':
            // 简单处理日期筛选
            const now = new Date();
            if (value === 'week') now.setDate(now.getDate() - 7);
            if (value === 'month') now.setMonth(now.getMonth() - 1);
            if (value === 'year') now.setFullYear(now.getFullYear() - 1);
            currentFilters.dateFrom = value ? now.toISOString().split('T')[0] : '';
            break;
        case 'format':
            currentFilters.format = value;
            break;
        case 'rating':
            currentFilters.ratingMin = value ? parseInt(value) : 0;
            break;
        case 'channel':
            currentFilters.channel = value;
            break;
    }
    renderRecordList();
    updateFilterButtonState(type, value);
    updateResetButtonVisibility();
}

function updateFilterButtonState(type, value) {
    // 强制转换为小写以匹配新的 HTML ID (btn-filter-*)
    const btnId = `btn-filter-${type.toLowerCase()}`;
    const btn = document.getElementById(btnId);
    if (btn) {
        if (value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// 视图管理
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    
    document.querySelectorAll('.footer-btn').forEach(btn => btn.classList.remove('active'));
    const correspondingBtn = document.querySelector(`.footer-btn[data-view="${viewName}"]`);
    if (correspondingBtn) {
        correspondingBtn.classList.add('active');
    }

    currentView = viewName;
    const nav = document.querySelector('.nav-bar');
    if (nav) {
        if (viewName === 'detail-view' || viewName === 'form-view') {
            nav.style.display = 'none';
        } else {
            nav.style.display = '';
        }
    }
}

function startNavScanner() {
    if (!window.jsQR) {
        const err = document.getElementById('nav-scan-error');
        if (err) { 
            err.textContent = '扫码组件未加载，请检查网络连接或刷新页面'; 
            err.classList.remove('hidden'); 
        }
        return;
    }
    
    const video = document.getElementById('nav-qr-video');
    if (!video) return;
    
    // 尝试优先后置摄像头，如果失败则尝试默认摄像头
    const startCamera = (constraints) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const err = document.getElementById('nav-scan-error');
            if (err) { 
                err.textContent = '浏览器不支持或未在HTTPS环境下运行'; 
                err.classList.remove('hidden'); 
            }
            return;
        }

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            navVideoStream = stream;
            video.srcObject = stream;
            // 必须调用 play() 才能在某些移动浏览器上显示
            video.play().catch(e => console.error('Video play error:', e));
            navScannerActive = true;
            navScanLoop();
            
            // 清除之前的错误
            const err = document.getElementById('nav-scan-error');
            if (err) err.classList.add('hidden');
        }).catch((e) => {
            console.error('Camera error:', e);
            // 如果是后置摄像头失败，尝试不指定 facingMode
            if (constraints.video && constraints.video.facingMode === 'environment') {
                startCamera({ video: true, audio: false });
            } else {
                const err = document.getElementById('nav-scan-error');
                let msg = '无法启动摄像头';
                if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                    msg = '请允许访问摄像头权限';
                } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                    msg = '未检测到摄像头设备';
                } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                    msg = '摄像头被占用或无法访问';
                } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    msg = '扫码需要 HTTPS 环境';
                }
                if (err) { err.textContent = msg; err.classList.remove('hidden'); }
            }
        });
    };

    startCamera({ video: { facingMode: 'environment' }, audio: false });
}

function stopNavScanner() {
    navScannerActive = false;
    const video = document.getElementById('nav-qr-video');
    if (video) { video.pause(); video.srcObject = null; }
    if (navVideoStream) { navVideoStream.getTracks().forEach(t => t.stop()); navVideoStream = null; }
    const canvas = document.getElementById('nav-qr-canvas');
    if (canvas) { const ctx = canvas.getContext('2d'); ctx && ctx.clearRect(0,0,canvas.width,canvas.height); }
}

function navScanLoop() {
    if (!navScannerActive) return;
    const video = document.getElementById('nav-qr-video');
    const canvas = document.getElementById('nav-qr-canvas');
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !video.videoWidth) { requestAnimationFrame(navScanLoop); return; }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR ? jsQR(imageData.data, canvas.width, canvas.height) : null;
        if (code && code.data) {
            const id = extractRecordId(code.data);
            let record = id ? store.getRecord(id) : null;
            if (record) {
                showRecordDetail(record.id);
                const navBar = document.querySelector('.nav-bar');
                const panel = document.getElementById('nav-scan-panel');
                const btnTop = document.getElementById('nav-scan-btn');
                const btnFab = document.getElementById('fab-scan-btn');
                if (navBar) navBar.classList.remove('scan-active');
                if (panel) panel.classList.add('hidden');
                if (btnTop) btnTop.textContent = '📷 扫码';
                if (btnFab) btnFab.textContent = '📷';
                stopNavScanner();
            } else {
                const candidates = store.searchRecords(id || code.data);
                if (candidates.length > 0) {
                    showRecordDetail(candidates[0].id);
                    const navBar = document.querySelector('.nav-bar');
                    const panel = document.getElementById('nav-scan-panel');
                    const btnTop = document.getElementById('nav-scan-btn');
                    const btnFab = document.getElementById('fab-scan-btn');
                    if (navBar) navBar.classList.remove('scan-active');
                    if (panel) panel.classList.add('hidden');
                    if (btnTop) btnTop.textContent = '📷 扫码';
                    if (btnFab) btnFab.textContent = '📷';
                    stopNavScanner();
                } else {
                    const err = document.getElementById('nav-scan-error');
                    if (err) { err.textContent = '请扫码有效二维码'; err.classList.remove('hidden'); }
                }
                // 继续扫描，不关闭
            }
        }
    } catch (_) {}
    requestAnimationFrame(navScanLoop);
}

function handleNavQrFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('nav-qr-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const maxDim = 800;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR ? jsQR(imageData.data, canvas.width, canvas.height) : null;
            if (code && code.data) {
                const id = extractRecordId(code.data);
                let record = id ? store.getRecord(id) : null;
                if (record) {
                    showRecordDetail(record.id);
                    const navBar = document.querySelector('.nav-bar');
                    const panel = document.getElementById('nav-scan-panel');
                    const btnTop = document.getElementById('nav-scan-btn');
                    const btnFab = document.getElementById('fab-scan-btn');
                    if (navBar) navBar.classList.remove('scan-active');
                    if (panel) panel.classList.add('hidden');
                    if (btnTop) btnTop.textContent = '📷 扫码';
                    if (btnFab) btnFab.textContent = '📷';
                    stopNavScanner();
                } else {
                    const candidates = store.searchRecords(id || code.data);
                    if (candidates.length > 0) {
                        showRecordDetail(candidates[0].id);
                        const navBar = document.querySelector('.nav-bar');
                        const panel = document.getElementById('nav-scan-panel');
                        const btnTop = document.getElementById('nav-scan-btn');
                        const btnFab = document.getElementById('fab-scan-btn');
                        if (navBar) navBar.classList.remove('scan-active');
                        if (panel) panel.classList.add('hidden');
                        if (btnTop) btnTop.textContent = '📷 扫码';
                        if (btnFab) btnFab.textContent = '📷';
                        stopNavScanner();
                    } else {
                        const err = document.getElementById('nav-scan-error');
                        if (err) { err.textContent = '请扫码有效二维码'; err.classList.remove('hidden'); }
                    }
                }
            }
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function extractRecordId(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    // 直接匹配
    if (store.getRecord(raw)) return raw;
    // 尝试 URL
    try {
        const u = new URL(raw);
        const candidates = ['id', 'recordId', 'rid'];
        for (const k of candidates) {
            const v = u.searchParams.get(k);
            if (v && store.getRecord(v)) return v;
        }
        const seg = u.pathname.split('/').filter(Boolean).pop();
        if (seg && store.getRecord(seg)) return seg;
    } catch (_) {}
    // 回退：提取所有可能的 token
    const tokens = raw.match(/[A-Za-z0-9_-]{3,}/g) || [];
    for (const t of tokens) {
        if (store.getRecord(t)) return t;
        // 尝试修正常见混淆：O->0, I/l->1
        const variants = new Set([
            t.replace(/O/g, '0').replace(/o/g, '0'),
            t.replace(/[Il]/g, '1'),
            t.replace(/O/g, '0').replace(/[Il]/g, '1')
        ]);
        for (const v of variants) {
            if (v !== t && store.getRecord(v)) return v;
        }
    }
    return '';
}

// 搜索栏
function showSearchBar() {
    document.getElementById('search-bar').classList.remove('hidden');
    document.getElementById('search-input').focus();
}

function hideSearchBar() {
    document.getElementById('search-bar').classList.add('hidden');
    document.getElementById('search-input').value = '';
    renderRecordList();
}

// 唱片列表渲染
function renderRecordList() {
    let records = store.filterRecords(currentFilters);
    const sorted = store.sortRecords(records, currentSortBy);
    renderRecordsList(sorted);
    updateUI();
}

function renderRecordsList(records) {
    const container = document.getElementById('records-container');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎵</div>
                <p>还没有唱片，点击下方按钮快速添加</p>
            </div>
        `;
        return;
    }

    container.innerHTML = records.map(record => `
        <div class="record-card ${selectedRecordIds.has(record.id) ? 'selected' : ''} ${isSelectMode ? 'selectable' : ''}" data-id="${record.id}">
            <input type="checkbox" class="record-card-checkbox" ${selectedRecordIds.has(record.id) ? 'checked' : ''}>
            <div class="record-cover">
                ${record.cover ? `<img src="${record.cover}" alt="${record.name}">` : '<img src="assets/placeholder-vinyl.svg" alt="placeholder">'}
            </div>
            <div class="record-info" style="${record.themeColor ? `background: ${record.themeColor}; color: ${textColorFor(record.themeColor)};` : ''}">
                <div class="record-name">${escapeHtml(record.name)}</div>
                <div class="record-artist">${escapeHtml(record.artist)}</div>
                <div class="record-meta">
                    ${record.category ? `<span>📁 ${escapeHtml(record.category)}</span>` : ''}
                    ${record.rating ? `<span class="record-rating">⭐ ${record.rating}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // 添加卡片事件
    container.querySelectorAll('.record-card').forEach(card => {
        const recordId = card.dataset.id;
        
        card.addEventListener('click', (e) => {
            if (isSelectMode) {
                e.preventDefault();
                e.stopPropagation();
                toggleRecordSelection(recordId);
            } else {
                showRecordDetail(recordId);
            }
        });

        card.addEventListener('long-press', () => {
            enterSelectMode();
            toggleRecordSelection(recordId);
        });

        // 长按事件模拟
        let pressTimer;
        card.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                enterSelectMode();
                toggleRecordSelection(recordId);
            }, 500);
        });

        card.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        // 复选框事件
        const checkbox = card.querySelector('.record-card-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                toggleRecordSelection(recordId);
            });
        }
    });
}

// 唱片详情展示
function showRecordDetail(recordId) {
    const record = store.getRecord(recordId);
    if (!record) return;

    currentRecord = record;
    const detail = document.getElementById('detail-content');

    const tracks = record.tracks ? 
        record.tracks.split('\n').filter(t => t.trim()) : 
        [];

    detail.innerHTML = `
        <div class="detail-section">
            <div class="detail-cover">
                ${record.cover ? `<img src="${record.cover}" alt="${record.name}">` : '<img src="assets/placeholder-vinyl.svg" alt="placeholder">'}
            </div>
        </div>

        <div class="detail-section">
            <h3 style="font-size: 18px; margin-bottom: 4px;">${escapeHtml(record.name)}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${escapeHtml(record.artist)}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="padding: 4px 8px; background: var(--bg-surface-hover); border-radius: 4px; font-size: 12px; color: var(--primary-color);">
                    ID: <span class="id-code">${record.id}</span>
                </div>
                <button class="btn small gray" onclick="navigator.clipboard.writeText('${record.id}').then(() => alert('ID 已复制'))" title="复制 ID">
                    📋
                </button>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">基本信息</div>
            <div class="detail-item">
                <span class="detail-item-label">分类</span>
                <span class="detail-item-value">${record.mainCategory ? mainCategoryLabels[record.mainCategory] : (record.category || '')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">细分</span>
                <span class="detail-item-value">${record.subCategory || ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">发行时间</span>
                <span class="detail-item-value">${record.releaseDate ? formatDateShort(record.releaseDate) : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">唱片公司</span>
                <span class="detail-item-value">${record.label || ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">格式</span>
                <span class="detail-item-value">${record.format ? formatFormat(record.format) : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">评分</span>
                <span class="detail-item-value">${record.rating ? `⭐ ${record.rating}/10` : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">成色</span>
                <span class="detail-item-value">${record.condition === 'new' ? '全新' : (record.condition === 'used' ? '二手' : '')}</span>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">购买信息</div>
            <div class="detail-item">
                <span class="detail-item-label">购买渠道</span>
                <span class="detail-item-value">${escapeHtml(record.purchaseChannel || '')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">价格</span>
                <span class="detail-item-value">${record.price ? '￥'+record.price : ''}</span>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">曲目列表</div>
            <div class="detail-tracks">
                ${tracks.map((track, idx) => `<div class="detail-track">${idx + 1}. ${escapeHtml(track)}</div>`).join('')}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">备注</div>
            <p style="padding: 12px; background: var(--bg-light); border-radius: 6px; font-size: 14px; white-space: pre-wrap;">
                ${escapeHtml(record.notes || '')}
            </p>
        </div>

        <div class="detail-section">
            <div style="font-size: 12px; color: var(--text-secondary);">
                添加时间: ${formatDate(record.createdAt)}
            </div>
        </div>
    `;

    showView('detail-view');
}

 

// 表单
// 初始化表单的的select元素
function initializeFormSelects() {
    // 初始化艺术家
    const artistSelect = document.getElementById('record-artist');
    artistSelect.innerHTML = '<option value="">选择或输入歌手</option>';
    store.getArtists().forEach(artist => {
        if (artist) {
            const option = document.createElement('option');
            option.value = artist;
            option.textContent = artist;
            artistSelect.appendChild(option);
        }
    });

    // 初始化唱片公司
    const labelSelect = document.getElementById('record-label');
    const addLabelBtn = document.getElementById('add-label-btn');
    const labelNewInput = document.getElementById('label-new-input');
    const editLabelBtn = document.getElementById('edit-label-btn');
    const labelEditInput = document.getElementById('label-edit-input');
    const deleteLabelBtn = document.getElementById('delete-label-btn');

    function refreshLabelSelect() {
        const currentVal = labelSelect.value;
        labelSelect.innerHTML = '<option value="">选择或输入唱片公司</option>';
        store.getLabels().forEach(label => {
            if (label) {
                const option = document.createElement('option');
                option.value = label;
                option.textContent = label;
                labelSelect.appendChild(option);
            }
        });
        if (store.getLabels().includes(currentVal)) {
            labelSelect.value = currentVal;
        }
    }
    refreshLabelSelect(); // 初始加载

    // 添加唱片公司
    addLabelBtn.addEventListener('click', () => {
        if (labelNewInput.classList.contains('hidden')) {
            labelNewInput.classList.remove('hidden');
            labelNewInput.focus();
            addLabelBtn.textContent = '×';
        } else {
            labelNewInput.classList.add('hidden');
            labelNewInput.value = '';
            addLabelBtn.textContent = '+';
        }
    });

    labelNewInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        if (newValue) {
            store.addLabel(newValue);
            refreshLabelSelect();
            labelSelect.value = newValue;
            labelNewInput.classList.add('hidden');
            addLabelBtn.textContent = '+';
        }
    });

    // 编辑唱片公司
    editLabelBtn.addEventListener('click', () => {
        if (!labelSelect.value) {
            alert('请先选择要编辑的唱片公司');
            return;
        }
        if (labelEditInput.classList.contains('hidden')) {
            labelEditInput.value = labelSelect.value;
            labelEditInput.classList.remove('hidden');
            labelEditInput.focus();
            editLabelBtn.classList.add('active');
        } else {
            labelEditInput.classList.add('hidden');
            editLabelBtn.classList.remove('active');
        }
    });

    labelEditInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        const oldValue = labelSelect.value;
        if (newValue && oldValue) {
            // 更新 store 中的标签
            const labels = store.getLabels();
            const index = labels.indexOf(oldValue);
            if (index !== -1) {
                labels[index] = newValue;
                store.save(); // 保存更改
                refreshLabelSelect();
                labelSelect.value = newValue;
            }
            labelEditInput.classList.add('hidden');
            editLabelBtn.classList.remove('active');
        }
    });

    // 删除唱片公司
    deleteLabelBtn.addEventListener('click', () => {
        const value = labelSelect.value;
        if (!value) {
            alert('请先选择要删除的唱片公司');
            return;
        }
        if (confirm(`确定要删除唱片公司 "${value}" 吗？`)) {
            const labels = store.getLabels();
            const index = labels.indexOf(value);
            if (index !== -1) {
                labels.splice(index, 1);
                store.save(); // 保存更改
                refreshLabelSelect();
            }
        }
    });

    // 初始化分类选择联动
    const mainCategorySelect = document.getElementById('record-main-category');
    const subCategorySelect = document.getElementById('record-sub-category');
    
    // 填充大分类
    mainCategorySelect.innerHTML = '<option value="">选择分类</option>';
    Object.keys(mainCategoryLabels).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = mainCategoryLabels[key];
        mainCategorySelect.appendChild(option);
    });

    // 大分类改变时更新细分分类
    mainCategorySelect.addEventListener('change', (e) => {
        const mainCat = e.target.value;
        subCategorySelect.innerHTML = '<option value="">选择细分</option>';
        
        if (mainCat && subCategories[mainCat]) {
            subCategories[mainCat].forEach(sub => {
                if (sub) {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subCategorySelect.appendChild(option);
                }
            });
        }
    });

    // 大分类管理：编辑
    const editMainCategoryBtn = document.getElementById('edit-main-category-btn');
    const mainCategoryEditInput = document.getElementById('main-category-edit-input');
    
    editMainCategoryBtn.addEventListener('click', () => {
        if (!mainCategorySelect.value) {
            alert('请先选择要编辑的大分类');
            return;
        }
        
        if (mainCategoryEditInput.classList.contains('hidden')) {
            mainCategoryEditInput.value = mainCategorySelect.options[mainCategorySelect.selectedIndex].text;
            mainCategoryEditInput.classList.remove('hidden');
            mainCategoryEditInput.focus();
            editMainCategoryBtn.classList.add('active');
        } else {
            mainCategoryEditInput.classList.add('hidden');
            editMainCategoryBtn.classList.remove('active');
        }
    });

    mainCategoryEditInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        const key = mainCategorySelect.value;
        if (newValue && key) {
            mainCategoryLabels[key] = newValue;
            mainCategorySelect.options[mainCategorySelect.selectedIndex].text = newValue;
            mainCategoryEditInput.classList.add('hidden');
            editMainCategoryBtn.classList.remove('active');
        }
    });

    // 大分类管理：删除
    const deleteMainCategoryBtn = document.getElementById('delete-main-category-btn');
    deleteMainCategoryBtn.addEventListener('click', () => {
        const key = mainCategorySelect.value;
        if (!key) {
            alert('请先选择要删除的大分类');
            return;
        }
        if (confirm(`确定要删除大分类 "${mainCategoryLabels[key]}" 吗？\n该分类下的所有细分分类也将被移除。`)) {
            delete mainCategoryLabels[key];
            delete subCategories[key];
            mainCategorySelect.remove(mainCategorySelect.selectedIndex);
            // 触发 change 事件清空细分分类
            mainCategorySelect.dispatchEvent(new Event('change'));
        }
    });

    // 细分分类管理：编辑
    const editSubCategoryBtn = document.getElementById('edit-sub-category-btn');
    const subCategoryEditInput = document.getElementById('sub-category-edit-input');

    editSubCategoryBtn.addEventListener('click', () => {
        if (!subCategorySelect.value) {
            alert('请先选择要编辑的细分分类');
            return;
        }

        if (subCategoryEditInput.classList.contains('hidden')) {
            subCategoryEditInput.value = subCategorySelect.value;
            subCategoryEditInput.classList.remove('hidden');
            subCategoryEditInput.focus();
            editSubCategoryBtn.classList.add('active');
        } else {
            subCategoryEditInput.classList.add('hidden');
            editSubCategoryBtn.classList.remove('active');
        }
    });

    subCategoryEditInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        const oldValue = subCategorySelect.value;
        const mainCat = mainCategorySelect.value;
        
        if (newValue && oldValue && mainCat) {
            // 更新数据结构
            const index = subCategories[mainCat].indexOf(oldValue);
            if (index !== -1) {
                subCategories[mainCat][index] = newValue;
            }
            // 更新选项
            subCategorySelect.options[subCategorySelect.selectedIndex].value = newValue;
            subCategorySelect.options[subCategorySelect.selectedIndex].text = newValue;
            
            subCategoryEditInput.classList.add('hidden');
            editSubCategoryBtn.classList.remove('active');
        }
    });

    // 细分分类管理：删除
    const deleteSubCategoryBtn = document.getElementById('delete-sub-category-btn');
    deleteSubCategoryBtn.addEventListener('click', () => {
        const value = subCategorySelect.value;
        const mainCat = mainCategorySelect.value;
        
        if (!value) {
            alert('请先选择要删除的细分分类');
            return;
        }
        
        if (confirm(`确定要删除细分分类 "${value}" 吗？`)) {
            // 从数据结构中移除
            const index = subCategories[mainCat].indexOf(value);
            if (index !== -1) {
                subCategories[mainCat].splice(index, 1);
            }
            // 移除选项
            subCategorySelect.remove(subCategorySelect.selectedIndex);
        }
    });

    // 添加新大分类
    const addMainCategoryBtn = document.getElementById('add-main-category-btn');
    const mainCategoryNewInput = document.getElementById('main-category-new-input');
    
    addMainCategoryBtn.addEventListener('click', () => {
        if (mainCategoryNewInput.classList.contains('hidden')) {
            mainCategoryNewInput.classList.remove('hidden');
            mainCategoryNewInput.focus();
            addMainCategoryBtn.textContent = '×';
        } else {
            mainCategoryNewInput.classList.add('hidden');
            mainCategoryNewInput.value = '';
            addMainCategoryBtn.textContent = '+';
        }
    });

    mainCategoryNewInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        if (newValue) {
            // 生成一个简单的 key，例如 'custom_timestamp'
            const key = 'custom_' + Date.now();
            mainCategoryLabels[key] = newValue;
            subCategories[key] = []; // 初始化空数组
            
            // 添加到选项中
            const option = document.createElement('option');
            option.value = key;
            option.textContent = newValue;
            mainCategorySelect.appendChild(option);
            mainCategorySelect.value = key;
            
            // 触发 change 事件更新细分分类
            mainCategorySelect.dispatchEvent(new Event('change'));
            
            // 隐藏输入框
            mainCategoryNewInput.classList.add('hidden');
            addMainCategoryBtn.textContent = '+';
        }
    });

    // 添加新细分分类
    const addSubCategoryBtn = document.getElementById('add-sub-category-btn');
    const subCategoryNewInput = document.getElementById('sub-category-new-input');
    
    addSubCategoryBtn.addEventListener('click', () => {
        if (!mainCategorySelect.value) {
            alert('请先选择大分类');
            return;
        }
        
        if (subCategoryNewInput.classList.contains('hidden')) {
            subCategoryNewInput.classList.remove('hidden');
            subCategoryNewInput.focus();
            addSubCategoryBtn.textContent = '×';
        } else {
            subCategoryNewInput.classList.add('hidden');
            subCategoryNewInput.value = '';
            addSubCategoryBtn.textContent = '+';
        }
    });

    subCategoryNewInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        const mainCat = mainCategorySelect.value;
        
        if (newValue && mainCat) {
            // 添加到数据结构
            if (!subCategories[mainCat]) {
                subCategories[mainCat] = [];
            }
            subCategories[mainCat].push(newValue);
            
            // 添加到选项中
            const option = document.createElement('option');
            option.value = newValue;
            option.textContent = newValue;
            subCategorySelect.appendChild(option);
            subCategorySelect.value = newValue;
            
            // 隐藏输入框
            subCategoryNewInput.classList.add('hidden');
            addSubCategoryBtn.textContent = '+';
        }
    });

    // 初始化购买渠道
    const channelSelect = document.getElementById('record-purchase-channel');
    const addChannelBtn = document.getElementById('add-channel-btn');
    const channelNewInput = document.getElementById('channel-new-input');
    const editChannelBtn = document.getElementById('edit-channel-btn');
    const channelEditInput = document.getElementById('channel-edit-input');
    const deleteChannelBtn = document.getElementById('delete-channel-btn');

    function refreshChannelSelect() {
        const currentVal = channelSelect.value;
        channelSelect.innerHTML = '<option value="">选择或输入购买渠道</option>';
        store.getChannels().forEach(channel => {
            if (channel) {
                const option = document.createElement('option');
                option.value = channel;
                option.textContent = channel;
                channelSelect.appendChild(option);
            }
        });
        if (store.getChannels().includes(currentVal)) {
            channelSelect.value = currentVal;
        }
    }
    refreshChannelSelect();

    // 添加渠道
    addChannelBtn.addEventListener('click', () => {
        if (channelNewInput.classList.contains('hidden')) {
            channelNewInput.classList.remove('hidden');
            channelNewInput.focus();
            addChannelBtn.textContent = '×';
        } else {
            channelNewInput.classList.add('hidden');
            channelNewInput.value = '';
            addChannelBtn.textContent = '+';
        }
    });

    channelNewInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        if (newValue) {
            store.addChannel(newValue);
            refreshChannelSelect();
            channelSelect.value = newValue;
            channelNewInput.classList.add('hidden');
            addChannelBtn.textContent = '+';
        }
    });

    // 编辑渠道
    editChannelBtn.addEventListener('click', () => {
        if (!channelSelect.value) {
            alert('请先选择要编辑的渠道');
            return;
        }
        if (channelEditInput.classList.contains('hidden')) {
            channelEditInput.value = channelSelect.value;
            channelEditInput.classList.remove('hidden');
            channelEditInput.focus();
            editChannelBtn.classList.add('active');
        } else {
            channelEditInput.classList.add('hidden');
            editChannelBtn.classList.remove('active');
        }
    });

    channelEditInput.addEventListener('change', (e) => {
        const newValue = e.target.value.trim();
        const oldValue = channelSelect.value;
        if (newValue && oldValue) {
            const channels = store.getChannels();
            const index = channels.indexOf(oldValue);
            if (index !== -1) {
                channels[index] = newValue;
                store.save();
                refreshChannelSelect();
                channelSelect.value = newValue;
            }
            channelEditInput.classList.add('hidden');
            editChannelBtn.classList.remove('active');
        }
    });

    // 删除渠道
    deleteChannelBtn.addEventListener('click', () => {
        const value = channelSelect.value;
        if (!value) {
            alert('请先选择要删除的渠道');
            return;
        }
        if (confirm(`确定要删除渠道 "${value}" 吗？`)) {
            const channels = store.getChannels();
            const index = channels.indexOf(value);
            if (index !== -1) {
                channels.splice(index, 1);
                store.save();
                refreshChannelSelect();
            }
        }
    });
}

function showForm() {
    clearForm();
    // initializeFormSelects(); // 不再重复初始化事件监听器
    document.getElementById('form-title').textContent = '添加唱片';
    document.querySelectorAll('.add-method-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-method').forEach(m => m.classList.remove('active'));
    document.querySelector('.add-method-tabs .tab-btn[data-method="manual"]').classList.add('active');
    document.getElementById('manual-method').classList.add('active');
    const picker = document.getElementById('record-theme-color-picker');
    const input = document.getElementById('record-theme-color');
    const chip = document.getElementById('record-theme-chip');
    const pop = document.getElementById('record-theme-popover');
    const hue = document.getElementById('record-theme-hue');
    const light = document.getElementById('record-theme-light');
    if (picker && input) {
        const defaultColor = '#6366f1';
        picker.value = defaultColor;
        input.value = '';
        if (chip) chip.style.background = defaultColor;
        picker.oninput = () => { input.value = picker.value; if (chip) chip.style.background = picker.value; const hsl = hexToHsl(picker.value); if (hsl) { if (hue) hue.value = Math.round(hsl.h); if (light) light.value = Math.round(hsl.l); if (light) light.style.setProperty('--hue', hue.value); const pv = document.getElementById('record-theme-preview'); if (pv) pv.style.background = picker.value; } };
        input.onchange = () => {
            const v = input.value.trim();
            if (/^#([0-9a-fA-F]{6})$/.test(v)) { picker.value = v; if (chip) chip.style.background = v; const hsl = hexToHsl(v); if (hsl) { if (hue) hue.value = Math.round(hsl.h); if (light) light.value = Math.round(hsl.l); if (light) light.style.setProperty('--hue', hue.value); const pv = document.getElementById('record-theme-preview'); if (pv) pv.style.background = v; } }
        };
        if (chip) chip.onclick = () => { if (pop) pop.classList.toggle('hidden'); };
        if (pop) {
            document.addEventListener('click', (e) => {
                if (!pop.classList.contains('hidden')) {
                    if (!pop.contains(e.target) && e.target !== chip) pop.classList.add('hidden');
                }
            });
        }
        if (hue && light) {
            const updateFromHsl = () => {
                const c = hslToHex(parseInt(hue.value, 10), 70, parseInt(light.value, 10));
                input.value = c;
                picker.value = c;
                if (chip) chip.style.background = c;
                if (light) light.style.setProperty('--hue', hue.value);
                const pv = document.getElementById('record-theme-preview');
                if (pv) pv.style.background = c;
            };
            hue.oninput = updateFromHsl;
            light.oninput = updateFromHsl;
        }
        const pv = document.getElementById('record-theme-preview');
        if (pv) pv.style.background = defaultColor;
    }
    showView('form-view');
}

function showFormForEdit(recordId) {
    const record = store.getRecord(recordId);
    if (!record) return;

    clearForm();
    document.getElementById('form-title').textContent = '编辑唱片';
    
    // 填充表单数据
    document.getElementById('record-name').value = record.name;
    document.getElementById('record-artist').value = record.artist;
    document.getElementById('record-release-date').value = record.releaseDate || '';
    
    // 填充分类 (适配新的 main/sub 结构)
    if (document.getElementById('record-main-category')) {
        document.getElementById('record-main-category').value = record.mainCategory || '';
        // 触发 change 事件以加载细分分类
        const event = new Event('change');
        document.getElementById('record-main-category').dispatchEvent(event);
        
        // 稍后填充细分分类，确保 options 已加载
        setTimeout(() => {
            if (document.getElementById('record-sub-category')) {
                document.getElementById('record-sub-category').value = record.subCategory || '';
            }
        }, 0);
    } else if (document.getElementById('record-category')) {
        // 兼容旧结构
        document.getElementById('record-category').value = record.category || '';
    }

    document.getElementById('record-rating').value = record.rating || 0;
    document.getElementById('rating-display').textContent = record.rating ? record.rating : '-';
    document.getElementById('record-format').value = record.format || '';
    
    // 购买信息
    if (document.getElementById('record-purchase-channel')) {
        document.getElementById('record-purchase-channel').value = record.purchaseChannel || '';
    }
    if (document.getElementById('record-price')) {
        document.getElementById('record-price').value = record.price || '';
    }
    if (document.getElementById('record-condition')) {
        document.getElementById('record-condition').value = record.condition || '';
    }

    document.getElementById('record-tracks').value = record.tracks || '';
    document.getElementById('record-notes').value = record.notes || '';
    
    if (record.cover) {
        document.getElementById('cover-preview').innerHTML = `<img src="${record.cover}" alt="${record.name}">`;
    }
    if (document.getElementById('record-theme-color')) {
        document.getElementById('record-theme-color').value = record.themeColor || '';
    }
    if (document.getElementById('record-theme-color-picker')) {
        document.getElementById('record-theme-color-picker').value = record.themeColor || '#6366f1';
    }
    if (document.getElementById('record-theme-chip')) {
        document.getElementById('record-theme-chip').style.background = record.themeColor || '#6366f1';
    }
    if (document.getElementById('record-theme-popover')) {
        document.getElementById('record-theme-popover').classList.add('hidden');
    }
    const hue = document.getElementById('record-theme-hue');
    const light = document.getElementById('record-theme-light');
    const pv = document.getElementById('record-theme-preview');
    if (pv) pv.style.background = record.themeColor || '#6366f1';
    if (hue && light && record.themeColor) {
        const hsl = hexToHsl(record.themeColor);
        if (hsl) {
            hue.value = Math.round(hsl.h);
            light.value = Math.round(hsl.l);
            light.style.setProperty('--hue', hue.value);
        }
    }

    // 标记编辑模式
    document.getElementById('record-form').dataset.editId = recordId;

    showView('form-view');
}

function clearForm() {
    document.getElementById('record-form').reset();
    document.getElementById('record-form').removeAttribute('data-edit-id');
    document.getElementById('cover-preview').innerHTML = '<img src="assets/placeholder-vinyl.svg" alt="placeholder">';
    document.getElementById('rating-display').textContent = '-';
    
    // 清除 JSON 导入
    document.getElementById('json-file').value = '';
    document.getElementById('json-placeholder').textContent = '点击或拖动 JSON 文件到这里\n支持 .json 格式';
    document.getElementById('json-placeholder').style.borderColor = '';
    document.getElementById('import-json-btn').disabled = true;
    document.getElementById('json-result').classList.add('hidden');
    window.jsonDataToImport = null;
}

// 表单提交
function saveRecord(e) {
    e.preventDefault();

    const editId = document.getElementById('record-form').dataset.editId;
    const formData = new FormData(document.getElementById('record-form'));

    // 添加新的艺术家、标签、渠道
    const newArtist = formData.get('artist');
    const newLabel = formData.get('label');
    const newChannel = formData.get('purchaseChannel');

    if (newArtist) store.addArtist(newArtist);
    if (newLabel) store.addLabel(newLabel);
    if (newChannel) store.addChannel(newChannel);

    const record = {
        name: formData.get('name'),
        intro: formData.get('intro'),
        artist: formData.get('artist'),
        releaseDate: formData.get('releaseDate'),
        label: formData.get('label'),
        edition: formData.get('edition'),
        region: formData.get('region'),
        mainCategory: formData.get('mainCategory'),
        subCategory: formData.get('subCategory'),
        // 兼容旧字段：如果 mainCategory 存在，则尝试获取 label，否则使用原值
        category: mainCategoryLabels[formData.get('mainCategory')] || formData.get('mainCategory'),
        rating: parseInt(formData.get('rating')) || 0,
        format: formData.get('format'),
        purchaseChannel: formData.get('purchaseChannel'),
        price: parseFloat(formData.get('price')) || null,
        condition: formData.get('condition'),
        tracks: formData.get('tracks'),
        notes: formData.get('notes'),
        cover: document.getElementById('cover-preview').querySelector('img')?.src || '',
        themeColor: formData.get('themeColor') || ''
    };

    if (editId) {
        store.updateRecord(editId, record);
    } else {
        store.addRecord(record);
    }

    showView('list-view');
    renderRecordList();
}

// 封面上传处理
function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('cover-preview').innerHTML = 
            `<img src="${event.target.result}" alt="cover">`;
    };
    reader.readAsDataURL(file);
}

// 筛选管理
function filterByCategory(category) {
    currentFilter = category;
    renderRecordList();
    updateFilterButtons();
}

function updateFilterButtons() {
    document.querySelectorAll('.filter-btn')?.forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-category="${currentFilter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updateCategoryFilters();
}

function updateCategoryFilters() {
    const categoriesContainer = document.getElementById('category-filters');
    if (!categoriesContainer) return;
    const categories = store.getAllCategories?.() || [];
    if (categories.length === 0) {
        categoriesContainer.innerHTML = '';
        return;
    }
    categoriesContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${currentFilter === cat ? 'active' : ''}" data-category="${cat}">
            ${escapeHtml(cat)}
        </button>
    `).join('');
    categoriesContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.category;
            renderRecordList();
            updateFilterButtons();
        });
    });
}

// 排序
function showSortModal() {
    document.getElementById('sort-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.querySelector(`input[name="sort"][value="${currentSortBy}"]`).checked = true;
}

function applySorting() {
    const selected = document.querySelector('input[name="sort"]:checked');
    if (selected) {
        currentSortBy = selected.value;
        renderRecordList();
    }
    hideModals();
}

// 批量选择
function enterSelectMode() {
    isSelectMode = true;
    document.querySelectorAll('.record-card').forEach(card => {
        card.classList.add('selectable');
    });
    updateUI();
}

function toggleRecordSelection(recordId) {
    if (selectedRecordIds.has(recordId)) {
        selectedRecordIds.delete(recordId);
    } else {
        selectedRecordIds.add(recordId);
    }
    renderRecordList();
    updateUI();
    updateResetButtonVisibility();
}

// 确认删除
function showDeleteConfirmation(ids, onConfirm) {
    const count = ids.length;
    document.getElementById('confirmation-title').textContent = 
        count === 1 ? '删除唱片' : `批量删除 ${count} 张唱片`;
    document.getElementById('confirmation-message').textContent = 
        '确定要删除吗？此操作无法撤销。';
    
    document.getElementById('confirm-btn').onclick = onConfirm;
    document.getElementById('confirmation-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// 批量分类
function showCategoryModal() {
    const categories = store.getAllCategories();
    const container = document.getElementById('category-options');
    
    container.innerHTML = categories.map(cat => `
        <label class="category-option">
            <input type="radio" name="batch-category" value="${cat}">
            <span>${escapeHtml(cat)}</span>
        </label>
    `).join('');

    document.getElementById('category-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function applyBatchCategory() {
    const selected = document.querySelector('input[name="batch-category"]:checked');
    if (selected) {
        const category = selected.value;
        selectedRecordIds.forEach(id => {
            store.updateRecord(id, { category });
        });
        selectedRecordIds.clear();
        renderRecordList();
        hideModals();
        updateUI();
    }
}

// 分类管理
function renderCategoryView() {
    const list = document.getElementById('category-list');
    const categories = store.getAllCategories();
    
    list.innerHTML = categories.map(cat => {
        const count = store.getRecordsCountByCategory(cat);
        const isCustom = store.customCategories.includes(cat);
        return `
            <div class="category-item">
                <div>
                    <div class="category-item-name">${escapeHtml(cat)}</div>
                    <div class="category-item-count">${count} 张唱片</div>
                </div>
                <div class="category-item-btns">
                    <button class="category-item-btn" data-category="${cat}">编辑</button>
                    ${isCustom ? `<button class="category-item-btn delete" data-delete="${cat}">删除</button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // 添加事件
    list.querySelectorAll('.category-item-btn').forEach(btn => {
        if (btn.dataset.delete) {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.delete;
                if (confirm(`确定删除分类 "${cat}" 吗？`)) {
                    store.deleteCategory(cat);
                    renderCategoryView();
                }
            });
        }
    });

    // 添加新分类
    document.getElementById('add-category-btn').onclick = () => {
        const name = document.getElementById('new-category-input').value.trim();
        if (name) {
            store.addCategory(name);
            document.getElementById('new-category-input').value = '';
            renderCategoryView();
        }
    };
}

// 扫码页相关功能已移除

// JSON 模板下载
function downloadJsonTemplate() {
    const template = {
        records: [
            {
                name: "Thriller",
                artist: "Michael Jackson",
                releaseDate: "1982-11-30",
                category: "流行",
                rating: 10,
                format: "cd",
                purchaseChannel: "Amazon",
                tracks: "1. Billie Jean\n2. Beat It\n3. Thriller",
                notes: "经典专辑",
                cover: ""
            }
        ]
    };

    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'records_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// JSON 文件处理
function handleJsonFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            // 验证 JSON 格式
            if (!json.records || !Array.isArray(json.records)) {
                showJsonError('无效的 JSON 格式，必须包含 "records" 数组');
                return;
            }
            document.getElementById('json-placeholder').textContent = `✅ 已加载 ${json.records.length} 条记录`;
            document.getElementById('json-placeholder').style.borderColor = 'var(--success-color)';
            document.getElementById('import-json-btn').disabled = false;
            
            // 保存数据供导入按钮使用
            window.jsonDataToImport = json;
        } catch (err) {
            showJsonError('JSON 格式错误: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// 导入 JSON 数据
function importJsonData() {
    if (!window.jsonDataToImport) return;

    const json = window.jsonDataToImport;
    let imported = 0;

    json.records.forEach(record => {
        if (record.name && record.artist) {
            store.addRecord({
                name: record.name,
                artist: record.artist,
                releaseDate: record.releaseDate || '',
                category: record.category || '',
                rating: parseInt(record.rating) || 0,
                format: record.format || '',
                purchaseChannel: record.purchaseChannel || '',
                tracks: record.tracks || '',
                notes: record.notes || '',
                cover: record.cover || ''
            });
            imported++;
        }
    });

    const resultDiv = document.getElementById('json-result');
    resultDiv.innerHTML = `
        <p style="color: var(--success-color);">✅ 成功导入 ${imported} 条唱片</p>
    `;
    resultDiv.classList.remove('hidden');

    // 重置状态
    setTimeout(() => {
        window.jsonDataToImport = null;
        document.getElementById('json-file').value = '';
        document.getElementById('json-placeholder').textContent = '点击或拖动 JSON 文件到这里\n支持 .json 格式';
        document.getElementById('json-placeholder').style.borderColor = '';
        document.getElementById('import-json-btn').disabled = true;
        resultDiv.classList.add('hidden');
        
        showView('list-view');
        renderRecordList();
        updateUI();
    }, 1500);
}

// 显示 JSON 错误
function showJsonError(message) {
    const resultDiv = document.getElementById('json-result');
    resultDiv.innerHTML = `<p style="color: var(--danger-color);">❌ ${message}</p>`;
    resultDiv.classList.remove('hidden');
    document.getElementById('import-json-btn').disabled = true;
}

// 图片上传处理
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('preview-image').src = event.target.result;
        document.getElementById('upload-placeholder').classList.add('hidden');
        document.getElementById('preview-image-container').classList.add('active');
        document.getElementById('scan-image-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// 清除条形码图片
function clearBarcodeImage() {
    document.getElementById('barcode-image').value = '';
    document.getElementById('preview-image').src = '';
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('preview-image-container').classList.remove('active');
    document.getElementById('scan-image-btn').disabled = true;
    document.getElementById('image-scan-result').classList.add('hidden');
}

// 扫描图片中的条形码
async function scanBarcodeImage() {
    const img = document.getElementById('preview-image');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 等待图片加载
    const imageLoaded = new Promise((resolve) => {
        if (img.complete) {
            resolve();
        } else {
            img.onload = resolve;
        }
    });

    await imageLoaded;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    const resultDiv = document.getElementById('image-scan-result');

    if (code) {
        resultDiv.innerHTML = `
            <div style="color: var(--success-color);">
                <p>✅ 识别成功</p>
                <p style="font-size: 14px; margin: 8px 0;">内容: <strong>${escapeHtml(code.data)}</strong></p>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        handleQRCodeDetected(code.data);
    } else {
        resultDiv.innerHTML = `
            <p style="color: var(--danger-color);">
                ❌ 未找到二维码或条形码，请确保图片清晰
            </p>
        `;
        resultDiv.classList.remove('hidden');
    }
}

// 模态框管理
function hideModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    document.getElementById('modal-overlay').classList.add('hidden');
}

// UI 更新
function updateUI() {
    const count = store.getAllRecords().length;
    const rc = document.getElementById('record-count');
    if (rc) rc.textContent = `共 ${count} 张唱片`;

    if (isSelectMode && selectedRecordIds.size > 0) {
        const sc = document.getElementById('selected-count');
        const ba = document.getElementById('batch-actions');
        if (sc) sc.textContent = `已选 ${selectedRecordIds.size} 张`;
        if (sc) sc.classList.remove('hidden');
        if (ba) ba.classList.remove('hidden');
    } else {
        const sc = document.getElementById('selected-count');
        const ba = document.getElementById('batch-actions');
        if (sc) sc.classList.add('hidden');
        if (ba) ba.classList.add('hidden');
        if (selectedRecordIds.size === 0) {
            isSelectMode = false;
            document.querySelectorAll('.record-card').forEach(card => {
                card.classList.remove('selectable');
            });
        }
    }

    updateCategoryFilters();
    updateResetButtonVisibility();
}

// 工具函数
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
}

function formatDateShort(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatFormat(format) {
    const formats = {
        vinyl: '黑胶',
        cd: '光盘',
        cassette: '磁带',
        digital: '数字'
    };
    return formats[format] || '-';
}

function textColorFor(color) {
    if (!color || !/^#([0-9a-fA-F]{6})$/.test(color)) return '';
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 186 ? '#000' : '#fff';
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex) {
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) return null;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = 0; s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
}

function updateResetButtonVisibility() {
    const resetBtn = document.getElementById('btn-filter-reset');
    if (!resetBtn) return;
    const active =
        !!currentFilters.mainCategory ||
        !!currentFilters.subCategory ||
        !!currentFilters.dateFrom ||
        !!currentFilters.dateTo ||
        !!currentFilters.format ||
        !!currentFilters.channel ||
        (currentFilters.ratingMin && currentFilters.ratingMin > 0);
    if (active) {
        resetBtn.classList.remove('hidden');
    } else {
        resetBtn.classList.add('hidden');
    }
}
function showCategoryFilterModal() {
    const mainSelect = document.getElementById('filter-main-category-select');
    const subSelect = document.getElementById('filter-sub-category-select');
    if (!mainSelect || !subSelect) return;
    mainSelect.innerHTML = `<option value="">全部分类</option>` + Object.keys(mainCategoryLabels).map(key => {
        return `<option value="${key}">${mainCategoryLabels[key]}</option>`;
    }).join('');
    mainSelect.value = currentFilters.mainCategory || '';
    subSelect.innerHTML = `<option value="">全部细分</option>`;
    if (currentFilters.mainCategory && subCategories[currentFilters.mainCategory]) {
        subCategories[currentFilters.mainCategory].forEach(sub => {
            if (sub) subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    }
    subSelect.value = currentFilters.subCategory || '';
    mainSelect.onchange = (e) => {
        const val = e.target.value;
        subSelect.innerHTML = `<option value="">全部细分</option>`;
        if (val && subCategories[val]) {
            subCategories[val].forEach(sub => {
                if (sub) subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    };
    document.getElementById('filter-category-apply-btn').onclick = () => {
        currentFilters.mainCategory = mainSelect.value || '';
        currentFilters.subCategory = subSelect.value || '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-category-clear-btn').onclick = () => {
        currentFilters.mainCategory = '';
        currentFilters.subCategory = '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-category-cancel-btn').onclick = hideModals;
    document.getElementById('filter-category-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function showDateFilterModal() {
    const from = document.getElementById('filter-date-from');
    const to = document.getElementById('filter-date-to');
    if (!from || !to) return;
    from.value = currentFilters.dateFrom || '';
    to.value = currentFilters.dateTo || '';
    document.getElementById('filter-date-apply-btn').onclick = () => {
        currentFilters.dateFrom = from.value || '';
        currentFilters.dateTo = to.value || '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-date-clear-btn').onclick = () => {
        currentFilters.dateFrom = '';
        currentFilters.dateTo = '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-date-cancel-btn').onclick = hideModals;
    document.getElementById('filter-date-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function showFormatFilterModal() {
    const opts = document.querySelectorAll('input[name="filter-format"]');
    if (!opts || opts.length === 0) return;
    opts.forEach(o => { o.checked = (o.value === (currentFilters.format || '')); });
    document.getElementById('filter-format-apply-btn').onclick = () => {
        const selected = document.querySelector('input[name="filter-format"]:checked');
        currentFilters.format = selected ? selected.value : '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-format-clear-btn').onclick = () => {
        currentFilters.format = '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-format-cancel-btn').onclick = hideModals;
    document.getElementById('filter-format-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function showRatingFilterModal() {
    const slider = document.getElementById('filter-rating-min');
    const display = document.getElementById('filter-rating-display');
    if (!slider || !display) return;
    slider.value = currentFilters.ratingMin ?? 0;
    display.textContent = slider.value;
    slider.oninput = (e) => { display.textContent = e.target.value; };
    document.getElementById('filter-rating-apply-btn').onclick = () => {
        currentFilters.ratingMin = parseInt(slider.value) || 0;
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-rating-clear-btn').onclick = () => {
        currentFilters.ratingMin = 0;
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-rating-cancel-btn').onclick = hideModals;
    document.getElementById('filter-rating-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function showChannelFilterModal() {
    const select = document.getElementById('filter-channel-select');
    if (!select) return;
    select.innerHTML = `<option value="">全部渠道</option>`;
    store.getChannels().forEach(ch => {
        if (ch) select.innerHTML += `<option value="${ch}">${escapeHtml(ch)}</option>`;
    });
    select.value = currentFilters.channel || '';
    document.getElementById('filter-channel-apply-btn').onclick = () => {
        currentFilters.channel = select.value || '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-channel-clear-btn').onclick = () => {
        currentFilters.channel = '';
        renderRecordList();
        hideModals();
    };
    document.getElementById('filter-channel-cancel-btn').onclick = hideModals;
    document.getElementById('filter-channel-modal').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

// 导出 data.json 格式数据
function exportDataJson() {
    const data = {
        records: store.records,
        artists: store.artists,
        labels: store.labels,
        channels: store.channels,
        savedAt: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('已导出 data.json 格式！\n\n你可以：\n1. 把文件复制到项目的 data/ 文件夹\n2. 推送到 GitHub\n3. 网站会自动显示新数据');
}

// 初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
