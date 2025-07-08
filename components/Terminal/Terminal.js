/**
 * Terminal Component
 * Handles terminal functionality and task execution
 */
class Terminal {
    constructor() {
        this.element = document.getElementById('terminal');
        this.currentTask = null;
        this.initializeTerminal();
    }

    initializeTerminal() {
        if (!this.element) return;
        this.clear();
        this.print('Welcome to CyberShell OS Terminal');
        this.print('Type "help" for available commands');
        this.newLine();
    }

    startTask(taskId) {
        this.currentTask = taskId;
        this.clear();
        
        switch(taskId) {
            case '1':
                this.print('Task 1: Power Grid - Coming Soon');
                this.print('----------------------------------------');
                this.print('This task is currently under development.');
                this.print('Please check back later for the full implementation.');
                this.print('');
                this.print('Type "exit" to close this window.');
                break;
            default:
                this.print(`Task ${taskId} is not available.`);
        }
    }

    clear() {
        if (this.element) {
            this.element.innerHTML = '';
        }
    }

    print(text) {
        if (this.element) {
            const line = document.createElement('div');
            line.textContent = text;
            this.element.appendChild(line);
        }
    }

    newLine() {
        this.print('');
    }
}

export default Terminal; 