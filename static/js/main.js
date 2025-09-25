// スコア計算用のヘルパー関数
function calculateSimilarity(str1, str2) {
    const s1 = str1.replace(/\s/g, '');
    const s2 = str2.replace(/\s/g, '');
    if (s1 === s2) return 100;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 100.0;
    const costs = [];
    for (let i = 0; i <= shorter.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= longer.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[longer.length] = lastValue;
    }
    const distance = costs[longer.length];
    const similarity = (longer.length - distance) / parseFloat(longer.length);
    return Math.round(similarity * 100);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 既存のアニメーション処理 ---
    const mainContainer = document.querySelector('main.container');
    if (mainContainer) mainContainer.style.opacity = '1';

    const themeButtons = document.querySelectorAll('.theme-button');
    if (themeButtons.length > 0) {
        anime({ targets: themeButtons, opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(100, {start: 300}), easing: 'easeOutExpo'});
    }
    const allButtons = document.querySelectorAll('button, a[role="button"]');
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('clicked');
            button.addEventListener('animationend', () => button.classList.remove('clicked'), { once: true });
        });
    });

    // --- 発音チャレンジ機能 (スコア計算付き) ---
    const startButton = document.getElementById('start-recognition');
    const articleElement = document.querySelector('article');
    const recognizedTextElement = document.getElementById('recognized-text');
    const scoreDisplayElement = document.getElementById('score-display');
    const scoreFeedbackElement = document.getElementById('score-feedback');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && articleElement) {
        // --- ▼▼▼ここからが変更点▼▼▼ ---
        // recognitionオブジェクトの作成を、ボタンがクリックされた時に移動

        const correctAnswerPronunciation = articleElement.querySelector('p').textContent.match(/\((.*?)\)/)[1].trim();

        startButton.addEventListener('click', () => {
            // ボタンが押されるたびに、新しい音声認識オブジェクトを作成する
            const recognition = new SpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.interimResults = false;

            // 認識が結果を返した時の処理を、毎回設定し直す
            recognition.onresult = (event) => {
                const spokenText = event.results[0][0].transcript;
                recognizedTextElement.textContent = `あなたの発音: 「${spokenText}」`;

                const score = calculateSimilarity(spokenText, correctAnswerPronunciation);
                
                scoreDisplayElement.textContent = `${score} 点`;
                scoreDisplayElement.className = '';
                
                if (score >= 80) {
                    scoreDisplayElement.classList.add('score-high');
                    scoreFeedbackElement.textContent = '素晴らしい！ネイティブのような発音です！👏';
                } else if (score >= 60) {
                    scoreDisplayElement.classList.add('score-mid');
                    scoreFeedbackElement.textContent = '上手です！自信を持って！';
                } else {
                    scoreDisplayElement.classList.add('score-low');
                    scoreFeedbackElement.textContent = '惜しい！もう一度お手本を聞いて挑戦してみよう！';
                }
            };

            // 認識が終了した時の処理
            recognition.onend = () => {
                startButton.textContent = 'もう一度チャレンジ';
                startButton.classList.remove('recording');
            };

            // エラー処理
            recognition.onerror = (event) => {
                recognizedTextElement.textContent = `エラーが発生しました: ${event.error}`;
                startButton.classList.remove('recording');
            };
            
            // 準備ができたので、音声認識を開始する
            try {
                recognition.start();
                startButton.textContent = '話してください...';
                startButton.classList.add('recording');
                recognizedTextElement.textContent = '';
                scoreDisplayElement.textContent = '';
                scoreFeedbackElement.textContent = '';
            } catch (error) {
                recognizedTextElement.textContent = 'エラー: 既に開始されています。';
            }
        });
        // --- ▲▲▲ここまでが変更点▲▲▲ ---

    } else {
        if(startButton) {
            startButton.textContent = 'お使いのブラウザは対応していません';
            startButton.disabled = true;
        }
    }

    // --- 正しい発音を読み上げる機能 ---
    const speakButton = document.getElementById('speak-button');
    const khmerTextElement = document.getElementById('correct-khmer-text');
    if ('speechSynthesis' in window && khmerTextElement) {
        const textToSpeak = khmerTextElement.querySelector('strong').textContent.trim();
        speakButton.addEventListener('click', () => {
            // 読み上げ中に、他の音声認識が動かないように一旦停止する
            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'km-KH';
            window.speechSynthesis.speak(utterance);
        });
    } else {
        if(speakButton) speakButton.style.display = 'none';
    }
});