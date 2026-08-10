(function () {
    const STORAGE_KEY = 'hrm_page_log_v1';
    const MAX_ENTRIES = 300;

    function readLogs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('[page-log] cannot read localStorage', error);
            return [];
        }
    }

    function writeLogs(logs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
            console.warn('[page-log] cannot save localStorage', error);
        }
    }

    function buildEntry() {
        const now = new Date();
        return {
            ts: now.toISOString(),
            dateTh: now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
            page: document.title || 'Untitled page',
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer || '',
            userAgent: navigator.userAgent,
        };
    }

    function appendLog() {
        const logs = readLogs();
        logs.push(buildEntry());

        while (logs.length > MAX_ENTRIES) {
            logs.shift();
        }

        writeLogs(logs);
        console.info('[page-log] logged', logs[logs.length - 1]);
    }

    window.getPageLogs = function () {
        return readLogs();
    };

    window.clearPageLogs = function () {
        writeLogs([]);
        return [];
    };

    window.downloadPageLogs = function () {
        const logs = readLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hrm-page-log.json';
        link.click();
        URL.revokeObjectURL(url);
        return logs;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendLog, { once: true });
    } else {
        appendLog();
    }
})();

