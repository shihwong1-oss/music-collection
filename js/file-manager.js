const LocalFileManager = {
  directoryHandle: null,
  isConfigured: false,

  selectDirectory: async function() {
    if (!('showDirectoryPicker' in window)) {
      alert('请使用 Chrome/Edge 浏览器');
      return false;
    }
    try {
      this.directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      this.isConfigured = true;
      localStorage.setItem('musicDataDir', this.directoryHandle.name);
      return true;
    } catch (err) {
      console.log('取消选择');
      return false;
    }
  },

  saveRecord: async function(record) {
    if (!this.directoryHandle) {
      alert('请先选择数据文件夹');
      return false;
    }
    try {
      const id = record.id;
      const recordJson = JSON.stringify(record, null, 2);
      let recordsDir;
      try {
        recordsDir = await this.directoryHandle.getDirectoryHandle('records');
      } catch {
        recordsDir = await this.directoryHandle.getDirectoryHandle('records', { create: true });
      }
      const fileHandle = await recordsDir.getFileHandle(`${id}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(recordJson);
      await writable.close();

      if (record.cover && record.cover.startsWith('data:')) {
        const base64Data = record.cover.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: record.cover.split(';')[0].split(':')[1] });
        const ext = blob.type.split('/')[1] || 'jpg';
        let coversDir;
        try {
          coversDir = await this.directoryHandle.getDirectoryHandle('covers');
        } catch {
          coversDir = await this.directoryHandle.getDirectoryHandle('covers', { create: true });
        }
        const coverHandle = await coversDir.getFileHandle(`${id}.${ext}`, { create: true });
        const coverWritable = await coverHandle.createWritable();
        await coverWritable.write(blob);
        await coverWritable.close();
      }
      return true;
    } catch (err) {
      console.error('保存失败:', err);
      return false;
    }
  },

  deleteRecord: async function(recordId) {
    if (!this.directoryHandle) return;
    try {
      const recordsDir = await this.directoryHandle.getDirectoryHandle('records');
      await recordsDir.removeEntry(`${recordId}.json`);
    } catch (err) {
      console.log('删除 JSON 失败:', err);
    }
    try {
      const coversDir = await this.directoryHandle.getDirectoryHandle('covers');
      const files = await coversDir.values();
      for (const file of files) {
        if (file.name.startsWith(recordId)) {
          await coversDir.removeEntry(file.name);
        }
      }
    } catch (err) {
      console.log('删除封面失败:', err);
    }
  },

  loadAllRecords: async function() {
    if (!this.directoryHandle) return [];
    try {
      const recordsDir = await this.directoryHandle.getDirectoryHandle('records');
      const files = await recordsDir.values();
      const records = [];
      for await (const file of files) {
        if (file.name.endsWith('.json')) {
          const f = await file.getFile();
          const text = await f.text();
          const record = JSON.parse(text);
          record.cover = await this.loadCover(record.id);
          records.push(record);
        }
      }
      return records;
    } catch (err) {
      console.log('加载失败:', err);
      return [];
    }
  },

  loadCover: async function(id) {
    if (!this.directoryHandle) return '';
    try {
      const coversDir = await this.directoryHandle.getDirectoryHandle('covers');
      const files = await coversDir.values();
      for await (const file of files) {
        if (file.name.startsWith(id)) {
          const f = await file.getFile();
          const blob = await f.blob();
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.log('加载封面失败:', err);
    }
    return '';
  }
};
