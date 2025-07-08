/**
 * Window Manager Class
 * Handles all window-related operations including creation, movement, and state management
 */
class WindowManager {
    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        this.initializeWindows();
        this.initializeDesktopIcons();
        this.initializeTaskbar();
        this.updateClock();
        this.initializeToolWindows();
        this.initializeTaskFolders();
    }

    initializeWindows() {
        document.querySelectorAll('.window').forEach(windowElement => {
            const id = windowElement.id;
            const initialContent = windowElement.querySelector('.window-content')?.innerHTML || '';
            
            this.windows[id] = {
                element: windowElement,
                minimized: false,
                maximized: false,
                position: { x: 0, y: 0 },
                initialState: {
                    position: { x: 0, y: 0 },
                    content: initialContent
                }
            };

            this.setupWindowControls(id);
            this.setupWindowDragging(windowElement);
        });
    }

    initializeDesktopIcons() {
        document.querySelectorAll('.icon-container').forEach(icon => {
            icon.addEventListener('click', () => {
                const windowId = `${icon.dataset.window}-window`;
                this.openWindow(windowId);
            });
        });
    }

    initializeTaskFolders() {
        const taskWindow = document.getElementById('tasks-window');
        if (!taskWindow) return;

        const folders = taskWindow.querySelectorAll('.folder:not(.disabled)');
        folders.forEach(folder => {
            folder.style.cursor = 'pointer';
            const newFolder = folder.cloneNode(true);
            folder.parentNode.replaceChild(newFolder, folder);

            newFolder.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = newFolder.dataset.task;
                if (taskId) {
                    this.openWindow('terminal-window');
                    if (window.terminal) {
                        window.terminal.startTask(taskId);
                    }
                }
            });
        });
    }

    initializeToolWindows() {
        const toolsWindow = document.getElementById('tools-window');
        if (!toolsWindow) return;

        const gridItems = toolsWindow.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.style.cursor = 'pointer';
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const toolId = newItem.dataset.tool;
                if (toolId) {
                    const windowId = `${toolId}-window`;
                    this.openWindow(windowId);
                }
            });
        });

        this.initializeMD5Cracker();
    }

    initializeMD5Cracker() {
        const md5Window = document.getElementById('md5-cracker-window');
        if (!md5Window) return;

        const input = md5Window.querySelector('#md5-input');
        const button = md5Window.querySelector('#start-crack');
        const resultContainer = md5Window.querySelector('#result-container');
        const passwordElement = md5Window.querySelector('#crack-password');
        const copyButton = md5Window.querySelector('#copy-password');

        if (button && input && resultContainer && passwordElement && copyButton) {
            button.addEventListener('click', () => {
                const hash = input.value.trim();
                if (hash) {
                    resultContainer.style.display = 'flex';
                    passwordElement.textContent = 'Cracking...';
                    // Simulated cracking process
                    setTimeout(() => {
                        passwordElement.textContent = 'password123';
                    }, 2000);
                }
            });

            copyButton.addEventListener('click', () => {
                const password = passwordElement.textContent;
                if (password && password !== 'Cracking...') {
                    navigator.clipboard.writeText(password);
                }
            });
        }
    }

    initializeTaskbar() {
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    setupWindowControls(id) {
        const window = this.windows[id];
        if (!window) return;

        const controls = window.element.querySelector('.window-controls');
        if (!controls) return;

        controls.querySelector('.minimize')?.addEventListener('click', () => this.minimizeWindow(id));
        controls.querySelector('.maximize')?.addEventListener('click', () => this.maximizeWindow(id));
        controls.querySelector('.close')?.addEventListener('click', () => this.closeWindow(id));

        window.element.addEventListener('mousedown', () => this.focusWindow(id));
    }

    setupWindowDragging(windowElement) {
        const header = windowElement.querySelector('.window-header');
        if (!header) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            isDragging = true;
            windowElement.style.transition = 'none';

            initialX = e.clientX - windowElement.offsetLeft;
            initialY = e.clientY - windowElement.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            windowElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            windowElement.style.transition = '';

            const windowId = windowElement.id;
            if (this.windows[windowId]) {
                this.windows[windowId].position = { x: currentX, y: currentY };
            }
        });
    }

    openWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        if (!window.element.classList.contains('active')) {
            this.resetWindow(id);
        }

        window.element.classList.add('active');
        window.element.style.display = 'flex';
        window.minimized = false;
        this.focusWindow(id);
        this.updateTaskbar();

        if (id === 'md5-cracker-window') {
            this.initializeMD5Cracker();
        } else if (id === 'tools-window') {
            this.initializeToolWindows();
        } else if (id === 'tasks-window') {
            this.initializeTaskFolders();
        }
    }

    closeWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        window.element.style.display = 'none';
        window.element.classList.remove('active');
        this.updateTaskbar();
    }

    minimizeWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        window.element.style.display = 'none';
        window.minimized = true;
        this.updateTaskbar();
    }

    maximizeWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        window.maximized = !window.maximized;
        window.element.classList.toggle('maximized');
        
        if (!window.maximized) {
            window.element.style.transform = `translate(${window.position.x}px, ${window.position.y}px)`;
        }
    }

    focusWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        this.activeWindow = id;
        Object.values(this.windows).forEach(w => {
            w.element.style.zIndex = w === window ? ++this.zIndex : this.zIndex - 1;
        });
    }

    resetWindow(id) {
        const window = this.windows[id];
        if (!window) return;

        const { element, initialState } = window;
        
        element.style.transform = `translate(${initialState.position.x}px, ${initialState.position.y}px)`;
        element.style.width = '';
        element.style.height = '';
        element.style.top = '';
        element.style.left = '';
        
        const contentElement = element.querySelector('.window-content');
        if (contentElement) {
            contentElement.innerHTML = initialState.content;
        }

        window.minimized = false;
        window.maximized = false;
        window.position = { ...initialState.position };

        if (id === 'md5-cracker-window') {
            this.initializeMD5Cracker();
        } else if (id === 'tools-window') {
            this.initializeToolWindows();
        } else if (id === 'tasks-window') {
            this.initializeTaskFolders();
        }
    }

    updateTaskbar() {
        // Placeholder for taskbar updates
        // Can be implemented later for showing active windows
    }
}

export default WindowManager; 