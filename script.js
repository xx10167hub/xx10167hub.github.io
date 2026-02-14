// 日记数据管理
class DiaryManager {
    constructor() {
        this.diaryData = [];
        this.currentDiary = null;
    }

    // 加载日记数据
    async loadDiaryData() {
        try {
            const response = await fetch('data/diaries.json');
            if (!response.ok) {
                throw new Error('Failed to load diary data');
            }
            this.diaryData = await response.json();
            // 按日期排序，最新的在前面
            this.diaryData.sort((a, b) => new Date(b.date) - new Date(a.date));
            return this.diaryData;
        } catch (error) {
            console.error('Error loading diary data:', error);
            // 返回默认数据
            return this.getDefaultDiaryData();
        }
    }

    // 默认日记数据
    getDefaultDiaryData() {
        return [
            {
                id: 'diary-night',
                title: '🌙 深夜独白：关于便签、树洞与掌控感',
                date: '2025-12-30 00:05',
                file: 'diary-night.html'
            },
            {
                id: 'diary-20251229',
                title: '🎂 32岁生日：记录我的2025与个人网站诞生',
                date: '2025-12-29 23:37',
                file: 'diary-20251229.html'
            }
        ];
    }

    // 生成日记列表
    generateDiaryList() {
        const diaryListElement = document.querySelector('.diary-list');
        if (!diaryListElement) return;

        diaryListElement.innerHTML = '';

        this.diaryData.forEach(diary => {
            const li = document.createElement('li');
            li.className = 'diary-item';
            
            const a = document.createElement('a');
            a.href = `diary.html?id=${diary.id}`;
            a.className = 'diary-title';
            a.textContent = diary.title;
            
            const span = document.createElement('span');
            span.className = 'diary-date';
            span.textContent = diary.date;
            
            li.appendChild(a);
            li.appendChild(span);
            diaryListElement.appendChild(li);
        });
    }

    // 加载指定日记
    async loadDiary(id) {
        try {
            // 查找日记数据
            const diary = this.diaryData.find(d => d.id === id);
            if (!diary) {
                throw new Error('Diary not found');
            }

            this.currentDiary = diary;
            
            // 如果有file属性，加载外部HTML文件
            if (diary.file) {
                const response = await fetch(diary.file);
                if (!response.ok) {
                    throw new Error('Failed to load diary content');
                }
                const html = await response.text();
                this.displayDiaryContent(html);
            } else if (diary.contentFile) {
                // 如果有contentFile属性，加载外部内容文件
                const content = await this.loadDiaryContent(diary.contentFile);
                diary.content = content;
                this.displayDiaryContentFromData(diary);
            } else if (diary.content) {
                // 如果有content属性，直接显示内容
                this.displayDiaryContentFromData(diary);
            }
        } catch (error) {
            console.error('Error loading diary:', error);
            this.displayError('日记加载失败');
        }
    }

    // 加载日记内容文件
    async loadDiaryContent(contentFile) {
        try {
            const response = await fetch(contentFile);
            if (!response.ok) {
                throw new Error('Failed to load content file');
            }
            
            // 根据文件扩展名判断文件类型
            if (contentFile.endsWith('.json')) {
                // 加载JSON文件
                const data = await response.json();
                return data.content || '';
            } else if (contentFile.endsWith('.txt')) {
                // 加载TXT文件
                const text = await response.text();
                // 将文本转换为HTML格式
                return this.textToHtml(text);
            } else {
                // 默认按文本处理
                const text = await response.text();
                return this.textToHtml(text);
            }
        } catch (error) {
            console.error('Error loading diary content:', error);
            throw error;
        }
    }

    // 将文本转换为HTML格式
    textToHtml(text) {
        // 替换换行符为<br>标签
        return text.replace(/\n/g, '<br>');
    }

    // 从HTML文件显示日记内容
    displayDiaryContent(html) {
        const container = document.querySelector('.container');
        if (!container) return;

        // 创建临时DOM元素解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 提取容器内容
        const content = tempDiv.querySelector('.container').innerHTML;
        container.innerHTML = content;
    }

    // 从数据显示日记内容
    displayDiaryContentFromData(diary) {
        const container = document.querySelector('.container');
        if (!container) return;

        container.innerHTML = `
            <div class="diary-detail">
                <h1>${diary.title}</h1>
                <div class="subtitle">${diary.date} | By Lumie</div>
                <div class="content">${diary.content}</div>
                <a href="index.html" class="back-btn">← 返回首页</a>
            </div>
        `;
    }

    // 显示错误信息
    displayError(message) {
        const container = document.querySelector('.container');
        if (!container) return;

        container.innerHTML = `
            <div class="error-message">
                <h2>错误</h2>
                <p>${message}</p>
                <a href="index.html" class="back-btn">← 返回首页</a>
            </div>
        `;
    }

    // 获取URL参数
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // 初始化页面
    async init() {
        await this.loadDiaryData();

        // 检查当前页面
        if (window.location.pathname.includes('diary.html')) {
            const diaryId = this.getUrlParam('id');
            if (diaryId) {
                // 加载指定日记
                await this.loadDiary(diaryId);
            } else {
                // 显示日记列表
                this.generateDiaryList();
            }
        }
    }
}

// 初始化应用
const diaryManager = new DiaryManager();
diaryManager.init();