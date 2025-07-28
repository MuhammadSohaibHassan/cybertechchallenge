/**
 * Window Manager Class
 * Handles all window-related operations including creation, movement, and state management
 */
class WindowManager {
    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        this.emailData = [
            {
                id: 1,
                subject: 'Account Security Update Required',
                from: 'security@bank.com',
                content: 'Dear valued customer,\n\nWe have detected unusual activity in your account. Please click the link below to verify your identity and secure your account.\n\n[Suspicious Link]\n\nIf you do not verify within 24 hours, your account will be suspended.\n\nSecurity Team',
                isPhishing: true,
                hint: 'Pay attention to how the email tries to make you act quickly.',
                solution: 'This is a phishing attempt using urgency and threats. The generic greeting and suspicious link are red flags.'
            },
            {
                id: 2,
                subject: 'Your Monthly Account Statement',
                from: 'statements@chase.com',
                content: 'Dear John Smith,\n\nYour monthly account statement for ending July 2023 is now available in your online banking portal.\n\nTo view your statement, please log in to your account at chase.com and visit the Statements section.\n\nNote: This is an automated message. Please do not reply.\n\nThank you,\nChase Bank',
                isPhishing: false,
                hint: 'Check how the email asks you to access your information.',
                solution: 'This is a legitimate email. It directs you to log in through the official website rather than clicking a link, uses your actual name, and doesn\'t create urgency.'
            },
            {
                id: 3,
                subject: 'HR: Urgent Salary Update',
                from: 'hr@company-payroll.net',
                content: 'Dear Employee,\n\nThere has been an error in your latest salary payment. Please provide your bank details immediately to receive the correction payment.\n\nClick here to update: [Suspicious Link]\n\nHR Department',
                isPhishing: true,
                hint: 'Think about the normal process for handling payroll issues in a company.',
                solution: 'This is a phishing email. HR would never request bank details via email, and the domain is suspicious.'
            },
            {
                id: 4,
                subject: 'Your Order has Shipped',
                from: 'auto-confirm@amazon.com',
                content: 'Hello John Smith,\n\nYour order #112-3456789-0123456 has shipped!\n\nEstimated delivery: July 25, 2023\n\nOrder Details:\n- Wireless Mouse ($24.99)\n- USB Cable ($9.99)\n\nTrack your package at amazon.com/orders\n\nThanks for shopping with us!\nAmazon.com',
                isPhishing: false,
                hint: 'Look at the level of specific details provided in the email.',
                solution: 'This is a legitimate email from Amazon. It includes specific order details, your name, and directs to the main website for tracking.'
            },
            {
                id: 5,
                subject: 'IT Support: Required Password Change',
                from: 'support@techdesk.org',
                content: 'Dear User,\n\nOur security scan has detected weak passwords in your accounts. You must update your password within 2 hours.\n\nClick to change password: [Suspicious Link]\n\nIT Support Desk',
                isPhishing: true,
                hint: 'Consider the timeframe given and how IT typically handles password changes.',
                solution: 'This is a phishing email using time pressure and security fears. IT support would use official company domains and not force immediate password changes via email links.'
            }
        ];
        this.hintShown = false;

        // Initialize progress
        this.progress = {
            totalScore: 0,
            currentTaskScore: 0,
            completedTasks: new Set(),
            completedEmails: new Set(),
            hasSeenIntro: false,
            maxTasks: 5  // Add maxTasks property
        };

        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem('taskProgress');
        if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            this.progress = {
                ...this.progress,
                totalScore: parsed.totalScore || 0,
                currentTaskScore: parsed.currentTaskScore || 0,
                completedTasks: new Set(parsed.completedTasks || []),
                completedEmails: new Set(parsed.completedEmails || []),
                hasSeenIntro: parsed.hasSeenIntro || false,
                maxTasks: 5  // Ensure maxTasks is set even when loading from localStorage
            };
        }

        this.initializeWindows();
        this.initializeDesktopIcons();
        this.initializeTaskbar();
        this.initializeProgressIndicators();
        this.updateClock();
        this.initializeToolWindows();
        this.initializeTaskFolders();
        this.initializeTask1Window();
        this.initializeResetButton();
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

    initializeProgressIndicators() {
        // Load progress from localStorage
        const savedProgress = localStorage.getItem('taskProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.progress = {
                ...this.progress,
                ...progress,
                completedTasks: new Set(progress.completedTasks || []),
                completedEmails: new Set(progress.completedEmails || [])
            };
        }

        this.updateProgressDisplay();

        // Initialize reset button
        const resetButton = document.getElementById('reset-progress');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetProgress());
        }
    }

    updateProgressDisplay() {
        const totalScoreElement = document.getElementById('total-score');
        const tasksProgressElement = document.getElementById('tasks-progress');

        if (totalScoreElement) {
            totalScoreElement.textContent = this.progress.totalScore;
        }
        if (tasksProgressElement) {
            tasksProgressElement.textContent = `${this.progress.completedTasks.size}/${this.progress.maxTasks}`;
        }
    }

    resetProgress() {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Reset progress object
        this.progress = {
            totalScore: 0,
            completedTasks: new Set(),
            maxTasks: 5,
            hasSeenIntro: false,
            completedEmails: new Set(),
            currentTaskScore: 0
        };

        // Reset UI state
        this.updateProgressDisplay();
        this.initializeTaskFolders();
        
        // Close all windows
        Object.keys(this.windows).forEach(windowId => {
            this.closeWindow(windowId);
        });

        // Reset Task 1 state
        this.currentEmail = null;
        const task1Window = document.getElementById('task1-window');
        if (task1Window) {
            const emailContent = task1Window.querySelector('.email-content');
            const analysisContent = task1Window.querySelector('.analysis-content');
            if (emailContent) emailContent.innerHTML = '';
            if (analysisContent) analysisContent.innerHTML = '';
        }

        // Show welcome message
        this.openWindow('tasks-window');
    }

    initializeTask1Window() {
        const task1Window = document.getElementById('task1-window');
        if (!task1Window) return;

        // Disable close button until task completion
        const closeButton = task1Window.querySelector('.close');
        if (closeButton) {
            closeButton.classList.add('disabled');
        }

        // Enable maximize button
        const maximizeButton = task1Window.querySelector('.maximize');
        if (maximizeButton) {
            maximizeButton.style.cursor = 'pointer';
            maximizeButton.onclick = () => this.maximizeWindow('task1-window');
        }

        // Initialize email list
        const emailList = task1Window.querySelector('.email-list');
        if (emailList) {
            // First, check if intro has been seen
            if (!this.progress.hasSeenIntro) {
                this.showTask1Intro();
                return;
            }

            // Sample emails - replace with actual data
            const sampleEmails = [
                { id: 1, subject: 'Account Security Update Required', from: 'security@bank.com' },
                { id: 2, subject: 'Your Package Delivery', from: 'delivery@shipping.com' },
                { id: 3, subject: 'Urgent: Password Reset', from: 'support@company.com' }
            ];

            emailList.innerHTML = sampleEmails.map(email => `
                <div class="email-item" data-email-id="${email.id}">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-from">${email.from}</div>
                </div>
            `).join('');

            // Add click handlers to email items
            emailList.querySelectorAll('.email-item').forEach(item => {
                item.addEventListener('click', () => this.showEmailContent(item.dataset.emailId));
            });
        }

        // Initialize action buttons
        const legitimateButton = task1Window.querySelector('#mark-legitimate');
        const phishingButton = task1Window.querySelector('#mark-phishing');

        if (legitimateButton && phishingButton) {
            legitimateButton.addEventListener('click', () => this.handleEmailClassification('legitimate'));
            phishingButton.addEventListener('click', () => this.handleEmailClassification('phishing'));
        }
    }

    showTask1Intro() {
        const task1Window = document.getElementById('task1-window');
        if (!task1Window) return;

        const windowContent = task1Window.querySelector('.window-content');
        if (!windowContent) return;

        // Replace content with intro sequence
        windowContent.innerHTML = `
            <div class="intro-sequence">
                <div class="intro-step active" data-step="1">
                    <h2>Welcome to Phishing Detection Training</h2>
                    <p>In this task, you'll learn to identify phishing emails and protect yourself from cyber threats.</p>
                    <button class="task-button" onclick="window.windowManager.nextIntroStep(1);">Next</button>
                </div>
                <div class="intro-step" data-step="2">
                    <h2>Your Mission</h2>
                    <p>You'll be presented with several emails. Your job is to analyze each one and determine if it's legitimate or a phishing attempt.</p>
                    <button class="task-button" onclick="window.windowManager.nextIntroStep(2);">Next</button>
                </div>
                <div class="intro-step" data-step="3">
                    <h2>What to Look For</h2>
                    <ul>
                        <li>Suspicious sender addresses</li>
                        <li>Urgent or threatening language</li>
                        <li>Grammar and spelling errors</li>
                        <li>Requests for sensitive information</li>
                    </ul>
                    <button class="task-button" onclick="window.windowManager.nextIntroStep(3);">Next</button>
                </div>
                <div class="intro-step" data-step="4">
                    <h2>How to Play</h2>
                    <p>1. Select an email from the list</p>
                    <p>2. Read the content carefully</p>
                    <p>3. Click "Legitimate" or "Phishing" based on your analysis</p>
                    <p>4. Get instant feedback and learn from your choices</p>
                    <button class="task-button" onclick="window.windowManager.startTask1();">Start Task</button>
                </div>
            </div>
        `;
    }

    nextIntroStep(currentStep) {
        const task1Window = document.getElementById('task1-window');
        if (!task1Window) return;

        const currentStepEl = task1Window.querySelector(`.intro-step[data-step="${currentStep}"]`);
        const nextStepEl = task1Window.querySelector(`.intro-step[data-step="${currentStep + 1}"]`);

        if (currentStepEl && nextStepEl) {
            currentStepEl.classList.remove('active');
            nextStepEl.classList.add('active');
        }
    }

    startTask1() {
        this.progress.hasSeenIntro = true;
        this.progress.currentTaskScore = 0;
        this.progress.completedEmails = new Set();
        
        localStorage.setItem('taskProgress', JSON.stringify({
            ...this.progress,
            completedTasks: Array.from(this.progress.completedTasks),
            completedEmails: Array.from(this.progress.completedEmails),
            hasSeenIntro: true
        }));

        const task1Window = document.getElementById('task1-window');
        if (!task1Window) return;

        const windowContent = task1Window.querySelector('.window-content');
        if (!windowContent) return;

        windowContent.innerHTML = `
            <div class="score-display">
                <i class="fas fa-star"></i>
                <span>Score: <span id="current-score">0</span></span>
            </div>
            <div class="task-container">
                <!-- Email List Section -->
                <div class="task-section">
                    <div class="task-section-header">
                        <i class="fas fa-envelope"></i> Emails
                    </div>
                    <div class="email-list">
                        ${this.emailData.map(email => `
                            <div class="email-item ${this.progress.completedEmails.has(email.id) ? 'completed' : ''}" data-email-id="${email.id}">
                                <div class="email-subject">${email.subject}</div>
                                <div class="email-from">${email.from}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Email Content Section -->
                <div class="task-section">
                    <div class="task-section-header">
                        <i class="fas fa-file-alt"></i> Email Content
                    </div>
                    <div class="email-content">
                        <div class="empty-state">
                            <i class="fas fa-envelope-open"></i>
                            <p>Select an email to view its content</p>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="task-button" id="mark-legitimate">
                            <i class="fas fa-check"></i> Legitimate
                        </button>
                        <button class="task-button danger" id="mark-phishing">
                            <i class="fas fa-exclamation-triangle"></i> Phishing
                        </button>
                    </div>
                    <div class="help-buttons">
                        <button class="help-button" id="show-hint">
                            <i class="fas fa-lightbulb"></i> Hint
                            <span class="points">-1</span>
                        </button>
                        <button class="help-button" id="show-solution">
                            <i class="fas fa-key"></i> Solution
                            <span class="points">-5</span>
                        </button>
                    </div>
                </div>

                <!-- Analysis Section -->
                <div class="task-section">
                    <div class="task-section-header">
                        <i class="fas fa-chart-bar"></i> Analysis
                    </div>
                    <div class="analysis-content">
                        <div class="empty-state">
                            <i class="fas fa-chart-line"></i>
                            <p>Make a decision to see the analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.initializeEmailHandlers(windowContent);
        this.initializeHelpButtons(windowContent);
        this.updateScoreDisplay();
    }

    showEmailContent(emailId) {
        const contentSection = document.querySelector('.email-content');
        if (!contentSection) return;

        const email = this.emailData.find(e => e.id === parseInt(emailId));
        if (email) {
            contentSection.innerHTML = `
                <div class="email-header">
                    <h3>${email.subject}</h3>
                    <p>From: ${email.from}</p>
                </div>
                <div class="email-body">
                    ${email.content.replace(/\n/g, '<br>')}
                </div>
            `;
            this.currentEmail = email;
            this.hintShown = false;

            // Enable action buttons
            const actionButtons = document.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.classList.add('active');
                actionButtons.querySelectorAll('button').forEach(button => {
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                });
            }

            // Reset and enable help buttons
            const helpButtons = document.querySelectorAll('.help-button');
            helpButtons.forEach(button => {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            });

            // Clear analysis content
            const analysisContent = document.querySelector('.analysis-content');
            if (analysisContent) {
                analysisContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <p>Make a decision to see the analysis</p>
                    </div>
                `;
            }
        }
    }

    initializeEmailHandlers(windowContent) {
        const emailItems = windowContent.querySelectorAll('.email-item');
        emailItems.forEach(item => {
            if (!this.progress.completedEmails.has(parseInt(item.dataset.emailId))) {
                item.addEventListener('click', () => {
                    emailItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.showEmailContent(item.dataset.emailId);
                });
            }
        });

        const legitimateButton = windowContent.querySelector('#mark-legitimate');
        const phishingButton = windowContent.querySelector('#mark-phishing');

        if (legitimateButton && phishingButton) {
            legitimateButton.addEventListener('click', () => this.handleEmailClassification('legitimate'));
            phishingButton.addEventListener('click', () => this.handleEmailClassification('phishing'));
        }
    }

    initializeHelpButtons(windowContent) {
        const hintButton = windowContent.querySelector('#show-hint');
        const solutionButton = windowContent.querySelector('#show-solution');

        if (hintButton) {
            hintButton.addEventListener('click', () => this.showHint());
        }
        if (solutionButton) {
            solutionButton.addEventListener('click', () => this.showSolution());
        }
    }

    showHint() {
        if (!this.currentEmail || this.hintShown) return;

        const hint = this.currentEmail.hint;
        if (!hint) return;

        this.hintShown = true;
        this.updateScore(-5);
        this.showPointsAnimation(-5);

        // Disable hint button
        const hintButton = document.querySelector('#show-hint');
        if (hintButton) {
            hintButton.disabled = true;
            hintButton.style.opacity = '0.5';
            hintButton.style.cursor = 'not-allowed';
        }

        const analysisContent = document.querySelector('.analysis-content');
        if (analysisContent) {
            analysisContent.innerHTML = `
                <div class="analysis-result">
                    <i class="fas fa-lightbulb"></i>
                    <p>${hint}</p>
                </div>
            `;
        }
    }

    showSolution() {
        if (!this.currentEmail) return;

        // Show solution and mark as completed
        const analysisContent = document.querySelector('.analysis-content');
        if (analysisContent) {
            analysisContent.innerHTML = `
                <div class="analysis-result">
                    <i class="fas fa-key"></i>
                    <p>${this.currentEmail.solution}</p>
                </div>
            `;
        }

        // Disable both help buttons
        const helpButtons = document.querySelectorAll('.help-button');
        helpButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });

        // Disable action buttons
        const actionButtons = document.querySelectorAll('.action-buttons button');
        actionButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });

        // Mark email as completed
        this.progress.completedEmails.add(this.currentEmail.id);
        
        // Update UI
        const emailItem = document.querySelector(`.email-item[data-email-id="${this.currentEmail.id}"]`);
        if (emailItem) {
            emailItem.classList.remove('active');
            emailItem.classList.add('completed');
        }

        // Deduct points and show animation
        this.updateScore(-5);
        this.showPointsAnimation(-5);

        // Check if all emails are completed
        if (this.progress.completedEmails.size === this.emailData.length) {
            this.handleTaskCompletion();
        }

        // Save progress
        localStorage.setItem('taskProgress', JSON.stringify({
            ...this.progress,
            completedTasks: Array.from(this.progress.completedTasks),
            completedEmails: Array.from(this.progress.completedEmails)
        }));
    }

    showPointsAnimation(points) {
        const pointsPopup = document.createElement('div');
        pointsPopup.className = `points-popup ${points < 0 ? 'negative' : ''}`;
        pointsPopup.textContent = points > 0 ? `+${points}` : points;

        // Position near the score display
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            const rect = scoreDisplay.getBoundingClientRect();
            pointsPopup.style.left = `${rect.left}px`;
            pointsPopup.style.top = `${rect.top - 30}px`;
            document.body.appendChild(pointsPopup);

            // Remove after animation
            setTimeout(() => pointsPopup.remove(), 1000);
        }
    }

    updateScore(points) {
        this.progress.currentTaskScore += points;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = this.progress.currentTaskScore;
        }
    }

    handleEmailClassification(classification) {
        if (!this.currentEmail || this.progress.completedEmails.has(this.currentEmail.id)) return;

        const isCorrect = (classification === 'phishing') === this.currentEmail.isPhishing;
        
        if (isCorrect) {
            this.updateScore(10);
            this.showPointsAnimation(10);
        } else {
            this.updateScore(-5);
            this.showPointsAnimation(-5);
        }

        // Mark email as completed
        this.progress.completedEmails.add(this.currentEmail.id);
        
        // Update UI
        const emailItem = document.querySelector(`.email-item[data-email-id="${this.currentEmail.id}"]`);
        if (emailItem) {
            emailItem.classList.remove('active');
            emailItem.classList.add('completed');
        }

        // Disable help buttons after decision
        const helpButtons = document.querySelectorAll('.help-button');
        helpButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });

        // Show feedback
        const analysisContent = document.querySelector('.analysis-content');
        if (analysisContent) {
            analysisContent.innerHTML = `
                <div class="analysis-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    <p>${isCorrect ? 'Correct!' : 'Incorrect!'}</p>
                    <p>${isCorrect ? '+10 points' : '-5 points'}</p>
                    <p>${this.currentEmail.solution}</p>
                </div>
            `;
        }

        // Check if all emails are completed
        if (this.progress.completedEmails.size === this.emailData.length) {
            this.handleTaskCompletion();
        }

        // Save progress
        localStorage.setItem('taskProgress', JSON.stringify({
            ...this.progress,
            completedTasks: Array.from(this.progress.completedTasks),
            completedEmails: Array.from(this.progress.completedEmails)
        }));
    }

    initializeLearningWindow() {
        const learningWindow = document.getElementById('learning-window');
        if (!learningWindow) return;

        const content = learningWindow.querySelector('.learning-content');
        if (!content) return;

        content.innerHTML = `
            <div class="learning-section">
                <h3>Understanding Phishing Emails</h3>
                <p>Phishing is a cybersecurity threat where attackers attempt to steal sensitive information by impersonating legitimate organizations. Learning to identify phishing emails is crucial for protecting yourself online.</p>
            </div>

            <div class="learning-section">
                <h3>Common Signs of Phishing Emails</h3>
                <ul class="learning-list">
                    <li>Urgency and Threats: Messages that create pressure to act quickly</li>
                    <li>Generic Greetings: Using "Dear Customer" instead of your name</li>
                    <li>Suspicious Links: Requests to click on embedded links</li>
                    <li>Spelling and Grammar: Poor writing quality or typos</li>
                    <li>Mismatched URLs: Email addresses that mimic legitimate domains</li>
                    <li>Requests for Sensitive Information: Asking for passwords or financial details</li>
                </ul>
            </div>

            <div class="learning-section">
                <h3>Real-World Examples</h3>
                <div class="example-box">
                    <div class="title">Example 1: Bank Security Alert</div>
                    <p>A phishing email might claim your account is locked and require immediate action. Legitimate banks never ask for sensitive information via email.</p>
                </div>
                <div class="example-box">
                    <div class="title">Example 2: Package Delivery Scam</div>
                    <p>Scammers often pose as shipping companies, asking you to verify details or pay fees. Always check tracking numbers on official websites.</p>
                </div>
            </div>

            <div class="learning-section">
                <h3>Best Practices</h3>
                <ul class="learning-list">
                    <li>Never click on suspicious links - type URLs directly into your browser</li>
                    <li>Check the sender's email address carefully</li>
                    <li>Be wary of unexpected requests for personal information</li>
                    <li>Look for personalized information that proves legitimacy</li>
                    <li>When in doubt, contact the company directly using official channels</li>
                </ul>
            </div>
        `;
    }

    handleTaskCompletion() {
        const maxPossibleScore = this.emailData.length * 10;
        const passingScore = maxPossibleScore * 0.5;
        const passed = this.progress.currentTaskScore >= passingScore;

        const task1Window = document.getElementById('task1-window');
        if (passed && task1Window) {
            task1Window.classList.add('completed');
        }

        // Create completion dialog
        const dialog = document.createElement('div');
        dialog.className = `completion-dialog ${passed ? 'success' : 'failure'}`;
        dialog.innerHTML = `
            <i class="fas ${passed ? 'fa-trophy' : 'fa-exclamation-circle'}"></i>
            <h2>${passed ? 'Congratulations!' : 'Task Failed'}</h2>
            <p>
                ${passed ? 
                    `You've successfully identified phishing emails and scored ${this.progress.currentTaskScore}/${maxPossibleScore} points!` :
                    `You need more practice with identifying phishing emails. You scored ${this.progress.currentTaskScore}/${maxPossibleScore}. Please restart the task.`}
            </p>
            <button class="task-button" onclick="window.windowManager.handleTaskResult(${passed});">
                ${passed ? '<i class="fas fa-arrow-right"></i> Continue' : '<i class="fas fa-redo"></i> Start Over'}
            </button>
        `;
        document.body.appendChild(dialog);

        // Add confetti effect for success
        if (passed) {
            this.createConfetti();
        }
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => confetti.remove(), 2000);
        }
    }

    handleTaskResult(passed) {
        // Remove completion dialog
        const dialog = document.querySelector('.completion-dialog');
        if (dialog) {
            dialog.remove();
        }

        // Remove any remaining confetti
        document.querySelectorAll('.confetti').forEach(el => el.remove());

        if (passed) {
            // Update total score and mark task as completed
            this.progress.totalScore += this.progress.currentTaskScore;
            this.progress.completedTasks.add('1');
            this.updateProgressDisplay();
            
            // Close Task 1 window
            this.closeWindow('task1-window');

            // Create and show Task 2 window
            const task2Window = document.createElement('div');
            task2Window.id = 'task2-window';
            task2Window.className = 'window';
            task2Window.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Task 2: Network Security</span>
                    <div class="window-controls">
                        <span class="minimize">−</span>
                        <span class="maximize">□</span>
                        <span class="close">×</span>
                    </div>
                </div>
                <div class="window-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    <div style="text-align: center;">
                        <h2 style="font-size: 36px; margin-bottom: 20px; color: var(--accent-color);">Coming Soon</h2>
                        <p style="font-size: 18px; color: var(--text-color);">Task 2 is currently under development.</p>
                    </div>
                </div>
            `;

            document.querySelector('.desktop').appendChild(task2Window);
            this.windows['task2-window'] = {
                element: task2Window,
                minimized: false,
                maximized: false,
                position: { x: 0, y: 0 },
                initialState: {
                    position: { x: 0, y: 0 },
                    content: task2Window.querySelector('.window-content').innerHTML
                }
            };
            this.setupWindowControls('task2-window');
            this.setupWindowDragging(task2Window);
            this.openWindow('task2-window');
        } else {
            // Reset task for retry
            this.progress.currentTaskScore = 0;
            this.progress.completedEmails = new Set();
            this.startTask1();
        }

        // Save progress
        localStorage.setItem('taskProgress', JSON.stringify({
            ...this.progress,
            completedTasks: Array.from(this.progress.completedTasks),
            completedEmails: Array.from(this.progress.completedEmails)
        }));
    }

    initializeTaskFolders() {
        const taskWindow = document.getElementById('tasks-window');
        if (!taskWindow) return;

        const folders = taskWindow.querySelectorAll('.folder');
        folders.forEach(folder => {
            const taskId = folder.dataset.task;
            
            // Mark completed tasks
            if (this.progress.completedTasks.has(taskId)) {
                folder.classList.add('completed');
                folder.classList.remove('disabled');
                folder.style.cursor = 'not-allowed';
            }
            
            // Unlock next task after completed task
            const prevTaskId = String(parseInt(taskId) - 1);
            if (this.progress.completedTasks.has(prevTaskId)) {
                folder.classList.remove('disabled');
                if (taskId === '2') {
                    folder.querySelector('span').textContent = 'Task 2: Network Security';
                    folder.style.cursor = 'pointer';
                }
            }

            if (!folder.classList.contains('disabled') && !folder.classList.contains('completed')) {
                folder.style.cursor = 'pointer';
                const newFolder = folder.cloneNode(true);
                folder.parentNode.replaceChild(newFolder, folder);

                newFolder.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const taskId = newFolder.dataset.task;
                    if (taskId === '1') {
                        this.closeWindow('tasks-window'); // Close Tasks window first
                        this.openWindow('task1-window');
                        if (!this.progress.hasSeenIntro) {
                            this.showTask1Intro();
                        }
                    } else if (taskId === '2') {
                        this.closeWindow('tasks-window'); // Close Tasks window first
                        this.openWindow('task2-window');
                    } else if (taskId) {
                        this.openWindow('terminal-window');
                        if (window.terminal) {
                            window.terminal.startTask(taskId);
                        }
                    }
                });
            }
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
        // If opening a task window, close the tasks window first
        if (id === 'task1-window' || id === 'task2-window') {
            this.closeWindow('tasks-window');
        }

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

        // Center the window
        const desktop = document.querySelector('.desktop');
        if (desktop) {
            const desktopRect = desktop.getBoundingClientRect();
            const windowRect = window.element.getBoundingClientRect();
            
            const left = (desktopRect.width - windowRect.width) / 2;
            const top = (desktopRect.height - windowRect.height) / 2;
            
            window.element.style.transform = `translate(${left}px, ${top}px)`;
            window.position = { x: left, y: top };
        }

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

        // Prevent closing Task 1 window if not completed
        if (id === 'task1-window' && !this.isTask1Completed()) {
            const analysisContent = document.querySelector('.analysis-content');
            if (analysisContent) {
                analysisContent.innerHTML = `
                    <div class="analysis-result incorrect">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Please complete all emails before closing the window.</p>
                    </div>
                `;
            }
            return;
        }

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
        
        // Don't reset terminal window content
        if (id !== 'terminal-window') {
            const contentElement = element.querySelector('.window-content');
            if (contentElement) {
                contentElement.innerHTML = initialState.content;
            }
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

    isTask1Completed() {
        return this.progress.completedEmails.size === this.emailData.length;
    }

    // Add reset system functionality
    resetSystem() {
        // Create and show reset confirmation dialog
        const resetDialog = document.createElement('div');
        resetDialog.className = 'completion-dialog';
        resetDialog.innerHTML = `
            <i class="fas fa-undo"></i>
            <h2>Reset System</h2>
            <p>Are you sure you want to reset the system?<br>All progress will be lost.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="task-button" onclick="window.windowManager.handleConfirmReset()">
                    <i class="fas fa-check"></i> Confirm Reset
                </button>
                <button class="task-button danger" onclick="window.windowManager.handleCancelReset()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;

        document.querySelector('.desktop').appendChild(resetDialog);
    }

    handleConfirmReset() {
        // Close all windows first
        Object.keys(this.windows).forEach(windowId => {
            this.closeWindow(windowId);
        });

        // Remove the reset dialog
        const resetDialog = document.querySelector('.completion-dialog');
        if (resetDialog) {
            resetDialog.remove();
        }

        // Reset all progress
        this.progress = {
            totalScore: 0,
            currentTaskScore: 0,
            completedTasks: new Set(),
            completedEmails: new Set(),
            hasSeenIntro: false,
            maxTasks: 5  // Add maxTasks property here too
        };

        // Reset localStorage
        localStorage.removeItem('taskProgress');

        // Reset UI elements
        document.getElementById('total-score').textContent = '0';
        document.getElementById('tasks-progress').textContent = '0/5';

        // Reset task folders
        const folders = document.querySelectorAll('.folder');
        folders.forEach(folder => {
            const taskId = folder.dataset.task;
            if (taskId === '1') {
                folder.classList.remove('completed', 'disabled');
                folder.style.cursor = 'pointer';
            } else {
                folder.classList.add('disabled');
                folder.classList.remove('completed');
                folder.style.cursor = 'not-allowed';
                if (taskId === '2') {
                    folder.querySelector('span').textContent = 'Task 2: Locked';
                }
            }
        });

        // Show confirmation message
        const confirmationMessage = document.createElement('div');
        confirmationMessage.className = 'completion-dialog';
        confirmationMessage.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--accent-color);"></i>
            <h2>System Reset Complete</h2>
            <p>All progress has been reset to default.</p>
            <button class="task-button" onclick="window.windowManager.handleCloseMessage(this)">
                <i class="fas fa-check"></i> OK
            </button>
        `;
        document.querySelector('.desktop').appendChild(confirmationMessage);
    }

    handleCancelReset() {
        const resetDialog = document.querySelector('.completion-dialog');
        if (resetDialog) {
            resetDialog.remove();
        }
    }

    handleCloseMessage(button) {
        const messageDialog = button.closest('.completion-dialog');
        if (messageDialog) {
            messageDialog.remove();
        }
    }

    // Update the reset button initialization
    initializeResetButton() {
        const resetButton = document.getElementById('reset');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSystem();
            });
        }
    }
}

// Make windowManager accessible globally for intro sequence navigation
window.windowManager = null;
document.addEventListener('DOMContentLoaded', () => {
    window.windowManager = new WindowManager();
});

export default WindowManager; 