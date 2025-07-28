/**
 * Terminal Component
 * Handles terminal functionality and task execution
 */
class Terminal {
    constructor() {
        this.element = document.getElementById('terminal');
        this.currentTask = null;
        this.currentSlide = 0;
        this.score = 10;
        this.currentEmail = 0;
        this.hintsUsed = [];
        
        // Load session state
        this.loadSessionState();
        
        // Initialize terminal
        this.initializeTerminal();
        
        // Ensure terminal element exists
        if (!this.element) {
            console.error('Terminal element not found');
            return;
        }

        // Set initial styles
        this.element.style.height = '100%';
        this.element.style.overflow = 'auto';
        this.element.style.padding = '1rem';
        this.element.style.fontFamily = 'Courier New, monospace';
        this.element.style.lineHeight = '1.4';
        this.element.style.color = '#00ff00';
        this.element.style.backgroundColor = '#000000';
    }

    loadSessionState() {
        const state = sessionStorage.getItem('terminalState');
        if (state) {
            const {
                currentTask,
                currentSlide,
                score,
                currentEmail,
                hintsUsed,
                completedTasks
            } = JSON.parse(state);

            this.currentTask = currentTask;
            this.currentSlide = currentSlide;
            this.score = score;
            this.currentEmail = currentEmail;
            this.hintsUsed = hintsUsed;
            this.completedTasks = new Set(completedTasks);
        } else {
            this.completedTasks = new Set();
        }
    }

    saveSessionState() {
        const state = {
            currentTask: this.currentTask,
            currentSlide: this.currentSlide,
            score: this.score,
            currentEmail: this.currentEmail,
            hintsUsed: this.hintsUsed,
            completedTasks: Array.from(this.completedTasks)
        };
        sessionStorage.setItem('terminalState', JSON.stringify(state));
    }

    initializeTerminal() {
        if (!this.element) {
            console.error('Terminal element not found during initialization');
            return;
        }
        this.clear();
        this.print('Welcome to CyberShell OS Terminal');
        this.print('Type "help" for available commands');
        this.newLine();
    }

    startTask(taskId) {
        if (!this.element) {
            this.element = document.getElementById('terminal');
            if (!this.element) {
                console.error('Terminal element not found when starting task');
                return;
            }
        }

        // Check if task is already completed
        if (this.completedTasks.has(taskId)) {
            this.clear();
            this.print('Task already completed!');
            this.print('Move on to the next available task.');
            return;
        }
        
        this.currentTask = taskId;
        this.clear();
        
        switch(taskId) {
            case '1':
                if (this.currentEmail > 0) {
                    // Resume from last position
                    this.showEmail(this.currentEmail);
                } else {
                    this.startPhishingTask();
                }
                break;
            default:
                this.print(`Task ${taskId} is not available.`);
        }
    }

    startPhishingTask() {
        this.currentSlide = 0;
        this.score = 10;
        this.currentEmail = 0;
        this.hintsUsed = [];
        this.showIntroductionSlide();
    }

    showIntroductionSlide() {
        this.clear();
        const slides = [
            {
                title: "What is Phishing?",
                content: [
                    "Phishing is a cybercrime where attackers impersonate legitimate",
                    "institutions to steal sensitive information.",
                    "",
                    "• 90% of data breaches involve phishing",
                    "• Over 3.4 billion fake emails are sent daily",
                    "• 30% of phishing emails get opened"
                ]
            },
            {
                title: "Common Phishing Tactics",
                content: [
                    "Attackers use various techniques to deceive users:",
                    "",
                    "• Creating urgency or threat",
                    "• Impersonating trusted entities",
                    "• Using similar-looking domains",
                    "• Requesting sensitive information",
                    "• Poor grammar and spelling"
                ]
            },
            {
                title: "How to Protect Yourself",
                content: [
                    "Key steps to identify phishing attempts:",
                    "",
                    "• Verify sender email addresses",
                    "• Check for suspicious attachments",
                    "• Look for poor grammar/spelling",
                    "• Never click suspicious links",
                    "• Be wary of urgent requests"
                ]
            },
            {
                title: "Challenge Introduction",
                content: [
                    "Your mission:",
                    "",
                    "• Analyze 6 different emails",
                    "• Mark each as legitimate or phishing",
                    "• Use hints carefully - they affect your score",
                    "",
                    "Scoring System:",
                    "• Starting score: 10 points",
                    "• Correct without hints: +2 points",
                    "• Using hints reduces points (-1 to -2.5)",
                    "• Wrong answers: -1 point"
                ]
            }
        ];

        const currentSlide = slides[this.currentSlide];
        this.print('='.repeat(60));
        this.print(`${currentSlide.title}`);
        this.print('='.repeat(60));
        this.newLine();
        
        currentSlide.content.forEach(line => this.print(line));
        this.newLine();
        
        // Create navigation buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'terminal-button';
        nextButton.textContent = this.currentSlide < 3 ? 'Next' : 'Start Challenge';
        nextButton.onclick = () => {
            this.currentSlide++;
            if (this.currentSlide < 4) {
                this.showIntroductionSlide();
            } else {
                this.startEmailChallenge();
            }
        };
        
        buttonContainer.appendChild(nextButton);
        this.element.appendChild(buttonContainer);
    }

    handleSlideNavigation(event) {
        if (event.key === 'Enter') {
            this.currentSlide++;
            if (this.currentSlide < 4) {
                this.showIntroductionSlide();
            } else {
                this.startEmailChallenge();
            }
        }
    }

    startEmailChallenge() {
        this.showEmail(this.currentEmail);
    }

    showEmail(index) {
        const emails = [
            {
                from: "amazon-support@arnazon.com",
                subject: "Urgent: Your Account Will Be Suspended",
                content: [
                    "Dear Valued Customer,",
                    "",
                    "We have noticed suspicious activity on your Amazon account.",
                    "Your account will be suspended within 24 hours unless you verify",
                    "your information immediately.",
                    "",
                    "Click here to verify your account: http://arnazon.com/verify",
                    "",
                    "Best regards,",
                    "Amazon Support Team"
                ]
            },
            {
                from: "hr@company.com",
                subject: "Company Policy Update",
                content: [
                    "Dear Team,",
                    "",
                    "Please find attached our updated company policy document",
                    "for 2024. Review it at your earliest convenience.",
                    "",
                    "Key changes include:",
                    "- Updated remote work guidelines",
                    "- New security protocols",
                    "- Benefits adjustments",
                    "",
                    "Best regards,",
                    "HR Department"
                ]
            },
            {
                from: "security@g00gle.com",
                subject: "⚠️ Google Account Security Alert ⚠️",
                content: [
                    "Dear User,",
                    "",
                    "Someone just logged into your account from a new device:",
                    "Location: Moscow, Russia",
                    "Time: 2:34 AM GMT",
                    "",
                    "If this wasn't you, click here immediately to secure",
                    "your account: https://g00gle.com/security",
                    "",
                    "Don't delay - act now to protect your account!",
                    "",
                    "Google Security Team"
                ]
            },
            {
                from: "newsletter@spotify.com",
                subject: "Your Weekly Music Mix Is Ready!",
                content: [
                    "Hi there,",
                    "",
                    "We've curated a new playlist just for you based on",
                    "your recent listening history. This week features:",
                    "",
                    "- New releases from your favorite artists",
                    "- Similar tracks you might enjoy",
                    "- Throwback hits you love",
                    "",
                    "Open Spotify to start listening!",
                    "",
                    "Enjoy the music,",
                    "Your Spotify Team"
                ]
            },
            {
                from: "paypal@secure-paypal.net",
                subject: "PayPal: Unusual Transaction Detected",
                content: [
                    "Dear PayPal Customer,",
                    "",
                    "We detected an unusual transaction on your account:",
                    "Amount: $750.00",
                    "Date: Today",
                    "Location: Lagos, Nigeria",
                    "",
                    "Your account has been temporarily limited.",
                    "Click here to verify this transaction:",
                    "https://secure-paypal.net/verify",
                    "",
                    "WARNING: Failure to verify will result in account closure.",
                    "",
                    "PayPal Security Department"
                ]
            },
            {
                from: "no-reply@netflix.com",
                subject: "Netflix: Update Payment Information",
                content: [
                    "Dear Netflix Member,",
                    "",
                    "We're having trouble with your current billing information.",
                    "To avoid service interruption, please update your payment",
                    "method as soon as possible.",
                    "",
                    "Update now: https://netflix.com/account/billing",
                    "",
                    "If you need help, visit our Help Center.",
                    "",
                    "Thanks,",
                    "The Netflix Team"
                ]
            }
        ];

        if (index >= emails.length) {
            this.showFinalResults();
            return;
        }

        const email = emails[index];
        this.clear();
        
        // Create email container
        const emailContainer = document.createElement('div');
        emailContainer.className = 'email-display';
        
        // Email header
        this.print('='.repeat(60));
        this.print(`Email ${index + 1}/6`);
        this.print('='.repeat(60));
        this.newLine();
        
        // Email content
        this.print(`From: ${email.from}`);
        this.print(`Subject: ${email.subject}`);
        this.print('-'.repeat(60));
        this.newLine();
        email.content.forEach(line => this.print(line));
        
        this.newLine();
        this.print('-'.repeat(60));
        this.print('Score: ' + this.score);
        this.newLine();

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Create action buttons
        const legitButton = document.createElement('button');
        legitButton.className = 'terminal-button legitimate';
        legitButton.textContent = 'Mark as Legitimate';
        legitButton.onclick = () => this.checkAnswer(false);

        const phishingButton = document.createElement('button');
        phishingButton.className = 'terminal-button phishing';
        phishingButton.textContent = 'Mark as Phishing';
        phishingButton.onclick = () => this.checkAnswer(true);

        const hintButton = document.createElement('button');
        hintButton.className = 'terminal-button hint';
        hintButton.textContent = 'Request Hint';
        hintButton.onclick = () => this.showHint();

        const solutionButton = document.createElement('button');
        solutionButton.className = 'terminal-button solution';
        solutionButton.textContent = 'View Solution';
        solutionButton.onclick = () => this.showSolution();

        // Add buttons to container
        buttonContainer.appendChild(legitButton);
        buttonContainer.appendChild(phishingButton);
        buttonContainer.appendChild(hintButton);
        buttonContainer.appendChild(solutionButton);

        // Add button container to terminal
        this.element.appendChild(buttonContainer);
    }

    handleEmailResponse(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case 'l':
            case 'p':
                this.checkAnswer(key === 'p');
                break;
            case 'h':
                this.showHint();
                break;
            case 's':
                this.showSolution();
                break;
        }
    }

    checkAnswer(isPhishing) {
        const answers = [true, false, true, false, true, true]; // true = phishing
        const correct = answers[this.currentEmail] === isPhishing;
        
        if (correct) {
            if (this.hintsUsed[this.currentEmail]) {
                this.score += 1;
            } else {
                this.score += 2;
            }
            this.print('Correct! Moving to next email...');
        } else {
            this.score -= 1;
            this.print('Incorrect! Moving to next email...');
        }

        // Create continue button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const continueButton = document.createElement('button');
        continueButton.className = 'terminal-button';
        continueButton.textContent = 'Continue';
        continueButton.onclick = () => {
            this.currentEmail++;
            this.showEmail(this.currentEmail);
            this.saveSessionState();
        };
        
        buttonContainer.appendChild(continueButton);
        this.element.appendChild(buttonContainer);
    }

    showHint() {
        if (!this.hintsUsed[this.currentEmail]) {
            this.score -= 1;
            this.hintsUsed[this.currentEmail] = 1;
        }

        const hints = [
            "Check the sender's email address carefully. Look for misspellings.",
            "Is there an unusual sense of urgency?",
            "Hover over links to see their true destination."
        ];

        this.newLine();
        this.print('HINT:');
        this.print(hints[0]); // Show first hint
        this.newLine();
        
        // Update the display
        this.showEmail(this.currentEmail);
    }

    showSolution() {
        this.score -= 5;
        
        const solutions = [
            "This is a phishing email. The domain 'arnazon.com' is misspelled (notice the 'rn' instead of 'm'). This is a common tactic used by phishers.",
            "This is a legitimate company email. The sender domain matches the company, there's no urgency, and it contains specific business-related information.",
            "This is a phishing email. Notice the domain 'g00gle.com' uses zeros instead of 'o's. Also, the urgent tone and threat of account compromise are red flags.",
            "This is a legitimate Spotify email. The domain is correct, content is personalized, and there's no request for sensitive information.",
            "This is a phishing email. The domain 'secure-paypal.net' is not PayPal's real domain. Also notice the urgency and threat of account closure.",
            "This is a legitimate Netflix email. The domain is correct, and it directs to Netflix's actual billing page. The tone is professional without urgency."
        ];

        this.newLine();
        this.print('SOLUTION:');
        this.print(solutions[this.currentEmail]);
        this.newLine();

        // Create continue button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const continueButton = document.createElement('button');
        continueButton.className = 'terminal-button';
        continueButton.textContent = 'Continue to Next Email';
        continueButton.onclick = () => {
            this.currentEmail++;
            this.showEmail(this.currentEmail);
            this.saveSessionState();
        };
        
        buttonContainer.appendChild(continueButton);
        this.element.appendChild(buttonContainer);
    }

    showFinalResults() {
        this.clear();
        this.print('='.repeat(60));
        this.print('Challenge Complete!');
        this.print('='.repeat(60));
        this.newLine();
        
        this.print(`Final Score: ${this.score}/20`);
        this.print(`Hints Used: ${this.hintsUsed.filter(Boolean).length}`);
        this.newLine();
        
        if (this.score >= 15) {
            this.print('Excellent! You\'re well-prepared to identify phishing attempts!');
        } else if (this.score >= 10) {
            this.print('Good job! Keep practicing to improve your skills.');
        } else {
            this.print('More practice needed. Review the guidelines and try again.');
        }
        
        this.newLine();
        this.print('Task 1 completed! Task 2 is now unlocked.');

        // Create finish button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const finishButton = document.createElement('button');
        finishButton.className = 'terminal-button';
        finishButton.textContent = 'Finish';
        finishButton.onclick = () => {
            // Mark task as completed
            this.completedTasks.add('1');
            this.saveSessionState();

            // Unlock next task
            this.unlockNextTask();
            
            this.initializeTerminal();
        };
        
        buttonContainer.appendChild(finishButton);
        this.element.appendChild(buttonContainer);
    }

    unlockNextTask() {
        // Find the current task folder and the next one
        const currentTaskFolder = document.querySelector(`[data-task="1"]`);
        const nextTaskFolder = document.querySelector(`[data-task="2"]`);

        if (currentTaskFolder && nextTaskFolder) {
            // Blur completed task
            currentTaskFolder.style.opacity = '0.5';
            currentTaskFolder.style.cursor = 'not-allowed';
            currentTaskFolder.classList.add('completed');

            // Unlock next task
            nextTaskFolder.classList.remove('disabled');
            nextTaskFolder.querySelector('span').textContent = 'Task 2: Network Security';
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
            this.element.scrollTop = this.element.scrollHeight;
        }
    }

    newLine() {
        this.print('');
    }
}

export default Terminal; 