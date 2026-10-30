/* SNUMOOD 홈페이지: 메뉴, 한국어/English 전환 */
(function () {
    'use strict';

    var EN = {
        skip: 'Skip to content',
        brand: 'SNUBH Mood Disorders Clinic',
        brandShort: 'Mood Disorders Clinic',
        navLabel: 'Main menu',
        nav1: 'Surveys',
        nav2: 'Mood Journal & Guide',
        nav3: 'Breathing · Relaxation · Mindfulness',
        nav4: 'Resources & Research',
        menuOpen: 'Open menu',
        menuClose: 'Close menu',
        heroTitle: 'Seoul National University Bundang Hospital<br>Mood Disorders Clinic',
        heroLead: 'Welcome to the Mood Disorders Clinic at Seoul National University Bundang Hospital. These materials were made to support the care of people visiting our clinic and to provide information about mood disorders.',
        qChart: 'Online Mood Journal',
        qChartD: 'Record daily on phone, tablet or PC',
        qSurvey: 'Surveys & results',
        qSurveyD: 'Compare your symptoms and traits with others',
        qBreath: 'Breathing exercise',
        qBreathD: 'Practise daily for moments of anxiety or panic',
        surveysTitle: 'Surveys and self-assessment',
        surveysP: 'Please try the questionnaires below. Many people who have visited our clinic have taken part. By taking part, you can see how your symptoms and personality compare with others. The questionnaires are free of charge.',
        surveysNote: 'When signing up, enter the number written on the card you received in the clinic. All surveys and assessments below require signing up and logging in. (The survey pages are in Korean.)',
        signup: 'Take the survey',
        signupD: 'First time? Sign up first',
        login: 'See survey results',
        loginD: 'Login required',
        lsTitle: 'Lifestyle score',
        lsP: 'Check your lifestyle over the past month: sleep, activity, meals, alcohol and other habits that affect mood.',
        lsGo: 'Check my lifestyle',
        needLogin: 'Log in with your survey ID',
        msTitle: 'Mood stability questionnaire',
        msP: 'Check regularly whether your symptoms are improving.',
        msGo: 'Assess my mood stability',
        chartTitle: 'Mood Journal and mood disorder guides',
        chartP1: 'To overcome a mood disorder, it is important to understand the illness well and to observe your own mood carefully.',
        chartP2: 'The Mood Journal works on phones, tablets and PCs. Bookmark the link below (or add it to your home screen) and record every day. You can sign up anonymously.',
        chartGo: 'Open the online Mood Journal',
        bookletsTitle: 'Read these first',
        guideSecTitle: 'How to keep the mood journal',
        illnessT: 'Mood Disorder Guide',
        illnessD: 'What mood disorders are, their symptoms and course, causes, kinds of treatment, circadian rhythm and lifestyle, step by step.',
        guideT: 'How to Keep Your Mood Journal',
        guideD: 'How to record mood, emotional reactivity, motivation and thinking, sleep, weight, alcohol and life events, with examples.',
        read: 'Read →',
        epsTitle: 'Mood Disorder Guide videos',
        epsP: 'Ten guide videos in English with English subtitles (4:00–13:14 each).',
        epsAria: 'Mood Disorder Guide video',
        epsList: 'Video list',
        ep1: "What kind of illness is a mood disorder?",
        ep2: "Symptoms of mood disorders",
        ep3: "The many courses of mood change",
        ep4: "Why do mood disorders happen?",
        ep5: "Treatment and recovery",
        ep6: "Medication ① Types of medicine and side effects",
        ep7: "Medication ② Taking medicine well",
        ep8: "Psychotherapy and mindfulness",
        ep9: "Lifestyle and circadian rhythm",
        ep10: "Symptoms that can come along",
        aiNote: 'These videos were made with AI. The narration is AI voice synthesis based on Prof. Woojae Myung’s voice.',
        howtoTitle: 'Video: how to keep the mood journal',
        howtoP: 'Each item of the mood journal is explained with examples. (11:58, in English with English subtitles)',
        howtoAria: 'Video on how to keep the mood journal',
        howtoHd: 'Switch to high quality (1080p)',
        howtoSd: 'Switch to standard quality (720p)',
        printTitle: 'Paper journal (printable PDF)',
        printP: 'PDFs you can print or write on with a tablet. They open in your browser, where you can save or print them. (Korean only.)',
        pdf1: 'Mood Journal 1 (2026–2028)',
        pdf2: 'Mood Journal 2 (2029–2031)',
        pdf3: 'Mood Journal guide (original of the guidebook)',
        relaxTitle: 'Breathing, relaxation and mindfulness',
        breathTitle: 'Breathing exercise',
        breathP: 'A simple technique that can greatly help control anxiety, panic and impulses. Without regular practice it is hard to use during a panic attack. Bookmark the link below and practise ten or more times a day.',
        breathGo: 'Start breathing exercise',
        breathGoD: 'Breathe in and out with the balloon',
        videoTitle: 'Abdominal breathing and muscle relaxation videos',
        videoP: 'Abdominal breathing and muscle relaxation training videos from the National Center for Mental Health (in Korean).',
        v1: 'Abdominal breathing training for calming the mind',
        v2: 'Muscle relaxation training for calming the mind (sign language)',
        mindTitle: 'Mindfulness',
        mindP: 'Mindfulness-based therapy can help a great deal in regulating mood. Listen to the introduction and follow the basic course (in Korean).',
        v3: 'Mindfulness, taking care of you (Sebasi talk 1739, Jeongeun Yu)',
        v4: '7-day basic mindfulness meditation course (Mabo)',
        resTitle: 'Resources and research output',
        wbTitle: 'Workbook',
        wbP: '“The Dialectical Behavior Therapy Skills Workbook for Bipolar Disorder” (Korean edition) collects techniques that help in overcoming mood disorders. You can read it and practise along.',
        wbGo: 'DBT Skills Workbook for Bipolar Disorder',
        wbGoD: 'View on Kyobo Book Centre (purchase link)',
        rsTitle: 'Research',
        rsP: 'See the research of the SNUBH mood disorders team.',
        rsGo: 'Our team’s papers (PubMed)',
        rsGoD: 'Newest first',
        helpTitle: 'If you need help now',
        c109: 'Suicide prevention hotline (24 h, Korea)',
        c1577: 'Mental health crisis line (24 h, Korea)',
        c119: 'Emergency · nearest emergency room',
        hospTitle: 'Seoul National University Bundang Hospital',
        hospAddr: '82 Gumi-ro 173beon-gil, Bundang-gu, Seongnam-si, Gyeonggi-do, Korea',
        hospTel: 'Main phone',
        hospWeb: 'Hospital website (appointments)',
        aboutTitle: 'About this site',
        aboutP: 'The materials on this site are educational aids to support care and do not replace medical consultation. Always talk with your doctor before changing or stopping medication. This site does not respond to emergencies.',
        legal: '© SNUBH Mood Disorders Clinic · SNUMOOD',
        breathH1: 'Calm breathing',
        dirLabel: 'Balloon direction',
        dirShrink: 'Shrink on inhale',
        dirGrow: 'Grow on inhale',
        breathHint: 'Breathe along with the balloon.',
        timerLabel: 'Practice time',
        breathNote: 'Without regular practice it is hard to use during a panic attack. Bookmark this page (or add it to your home screen) and practise ten or more times a day.',
        backRelax: '← Back to breathing, relaxation and mindfulness',
        miniHelp: 'If you need help now'
    };
    // 화질 버튼은 눌린 상태에 따라 키가 바뀌므로 한국어 문구를 미리 둔다 (영어 화면에서 처음 바뀌어도 한국어로 돌아오게)
    var KO = { howtoHd: '고화질(1080p)로 바꾸기', howtoSd: '표준 화질(720p)로 바꾸기' };
    var KEY = 'snumood-lang';
    var lang = 'ko';
    var mediaLang = [];

    function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* 저장 불가 */ } }
    function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

    function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

    function applyLang(next) {
        lang = next === 'en' ? 'en' : 'ko';
        var en = lang === 'en';
        document.documentElement.lang = lang;
        each('[data-i18n]', function (el) {
            var k = el.getAttribute('data-i18n');
            if (!(k in KO)) KO[k] = el.textContent;
            el.textContent = en && EN[k] ? EN[k] : KO[k];
        });
        each('[data-i18n-html]', function (el) {
            var k = el.getAttribute('data-i18n-html');
            if (!(k in KO)) KO[k] = el.innerHTML;
            el.innerHTML = en && EN[k] ? EN[k] : KO[k];
        });
        each('[data-i18n-aria]', function (el) {
            var k = el.getAttribute('data-i18n-aria');
            if (!(k in KO)) KO[k] = el.getAttribute('aria-label');
            el.setAttribute('aria-label', en && EN[k] ? EN[k] : KO[k]);
        });
        each('[data-i18n-title]', function (el) {
            var k = 't:' + el.getAttribute('data-i18n-title');
            if (!(k in KO)) KO[k] = el.getAttribute('title');
            el.setAttribute('title', en && EN[k.slice(2)] ? EN[k.slice(2)] : KO[k]);
        });
        each('[data-href-en]', function (el) {
            if (!el.hasAttribute('data-href-ko')) el.setAttribute('data-href-ko', el.getAttribute('href'));
            el.setAttribute('href', el.getAttribute(en ? 'data-href-en' : 'data-href-ko'));
        });
        each('[data-src-en]', function (el) {
            if (!el.hasAttribute('data-src-ko')) el.setAttribute('data-src-ko', el.getAttribute('src'));
            el.setAttribute('src', el.getAttribute(en ? 'data-src-en' : 'data-src-ko'));
        });
        var btn = document.getElementById('lang-btn');
        btn.textContent = en ? '한국어' : 'EN';
        btn.setAttribute('lang', en ? 'ko' : 'en');
        btn.setAttribute('aria-label', en ? '한국어로 보기' : 'Switch to English');
        var root = document.documentElement;
        if (!root.hasAttribute('data-title-ko')) root.setAttribute('data-title-ko', document.title);
        document.title = en ? (root.getAttribute('data-title-en') || 'SNUBH Mood Disorders Clinic | SNUMOOD') : root.getAttribute('data-title-ko');
        syncMenuLabel();
        mediaLang.forEach(function (sync) { sync(); });
    }

    var menuBtn, nav, mq;

    function menuOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }

    function syncMenuLabel() {
        if (!menuBtn) return;
        var k = menuOpen() ? 'menuClose' : 'menuOpen';
        menuBtn.setAttribute('aria-label', lang === 'en' ? EN[k] : (k === 'menuOpen' ? '메뉴 열기' : '메뉴 닫기'));
    }

    // 접힌 휴대폰 메뉴는 탭 이동·스크린리더에서 빠지도록 inert 처리
    function setMenu(open, focusBack) {
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.classList.toggle('open', open);
        if (mq.matches) {
            if (open) nav.removeAttribute('inert'); else nav.setAttribute('inert', '');
        }
        syncMenuLabel();
        if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
        else if (focusBack) menuBtn.focus();
    }

    function onLayout() {
        if (mq.matches) {
            if (!menuOpen()) nav.setAttribute('inert', '');
        } else {
            nav.removeAttribute('inert');
            nav.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            syncMenuLabel();
        }
    }

    function initMenu() {
        menuBtn = document.getElementById('menu-btn');
        nav = document.getElementById('site-nav');
        mq = window.matchMedia('(max-width: 900px)');
        onLayout();
        if (mq.addEventListener) mq.addEventListener('change', onLayout); else mq.addListener(onLayout);
        menuBtn.addEventListener('click', function () { setMenu(!menuOpen(), false); });
        nav.addEventListener('click', function (e) { if (e.target.closest('a') && mq.matches) setMenu(false, false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) setMenu(false, true); });
        document.addEventListener('click', function (e) {
            if (menuOpen() && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false, false);
        });

        // 지금 보고 있는 장을 메뉴에 표시
        var links = {};
        each('#site-nav a[href^="#"]', function (a) { links[a.getAttribute('href').slice(1)] = a; });
        if ('IntersectionObserver' in window) {
            var visible = {};
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
                var cur = Object.keys(links).filter(function (id) { return visible[id]; }).pop();
                Object.keys(links).forEach(function (id) {
                    if (id === cur) links[id].setAttribute('aria-current', 'true'); else links[id].removeAttribute('aria-current');
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
        }
    }

    // Only quality changes keep the position; translated narration has different timing.
    function setVideo(video, src, poster, subtitles, keepPosition, play) {
        if (video._pendingMetadata) video.removeEventListener('loadedmetadata', video._pendingMetadata);
        video._pendingMetadata = null;
        video.pause();
        video.hidden = !src;
        var source = video.querySelector('source');
        var oldTrack = video.querySelector('track');
        var captionsOn = oldTrack && oldTrack.track && oldTrack.track.mode === 'showing';
        if (oldTrack) oldTrack.remove();
        if (!src) {
            video.removeAttribute('src');
            source.removeAttribute('src');
            video.removeAttribute('poster');
            video.load();
            return;
        }
        var track = document.createElement('track');
        track.kind = 'subtitles';
        track.src = subtitles;
        track.srclang = lang;
        track.label = lang === 'en' ? 'English' : '한국어';
        video.appendChild(track);
        video.poster = poster;
        source.src = src;
        video.src = src;
        video._pendingMetadata = function once() {
            video.removeEventListener('loadedmetadata', once);
            video._pendingMetadata = null;
            if (keepPosition) video.currentTime = Math.min(keepPosition, video.duration || keepPosition);
            track.track.mode = captionsOn ? 'showing' : 'disabled';
            if (play) video.play().catch(function () { /* User can press play. */ });
        };
        video.addEventListener('loadedmetadata', video._pendingMetadata);
        video.load();
    }

    // How-to: switch both the language and quality of the media.
    function initVideo() {
        var btn = document.getElementById('howto-hd');
        var video = document.querySelector('.howto video');
        if (!btn || !video) return;
        var hd = false;
        function sync(t, play) {
            var stem = 'moodchart-howto' + (lang === 'en' ? '-en' : '');
            setVideo(video, 'https://snumood.com/media/' + stem + (hd ? '-1080p.mp4' : '-720p.mp4'),
                'guide/media/' + stem + '-poster.jpg', 'guide/media/' + stem + '.' + lang + '.vtt', t, play);
        }
        mediaLang.push(function () { sync(0, !video.paused); });
        btn.addEventListener('click', function () {
            hd = !hd;
            sync(video.currentTime, !video.paused);
            btn.setAttribute('aria-pressed', hd ? 'true' : 'false');
            btn.setAttribute('data-i18n', hd ? 'howtoSd' : 'howtoHd');
            btn.textContent = lang === 'en' ? EN[hd ? 'howtoSd' : 'howtoHd'] : (hd ? '표준 화질(720p)로 바꾸기' : '고화질(1080p)로 바꾸기');
        });
    }

    // 가이드북 영상 묶음: 목록에서 고르면 위 플레이어에서 재생 (화질 선택 유지)
    function initEpisodes() {
        var box = document.querySelector('.eps');
        if (!box) return;
        var video = box.querySelector('video');
        var btn = document.getElementById('eps-hd'), now = box.querySelector('.eps-now');
        var cur = '01', hd = false;
        function load(t, play) {
            var stem = 'illness-ep' + cur + (lang === 'en' ? '-en' : '');
            setVideo(video, 'https://snumood.com/media/' + stem + (hd ? '-1080p.mp4' : '-720p.mp4') + (cur === '06' && lang === 'ko' ? '?v=20261031' : ''),
                'guide/media/' + stem + '-poster.jpg', 'guide/media/' + stem + '.' + lang + '.vtt', t, play);
        }
        mediaLang.push(function () {
            box.querySelectorAll('.ep').forEach(function (b) {
                var ep = b.getAttribute('data-ep'), en = lang === 'en';
                b.querySelector('img').src = 'guide/media/illness-ep' + ep + (en ? '-en' : '') + '-poster.jpg';
                b.querySelector('.ep-d').textContent = b.getAttribute(en ? 'data-duration-en' : 'data-duration-ko');
            });
            load(0, !video.paused);
        });
        box.querySelectorAll('.ep').forEach(function (b) {
            b.addEventListener('click', function () {
                cur = b.getAttribute('data-ep');
                box.querySelectorAll('.ep').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
                var n = String(Number(cur)), k = 'ep' + n;
                now.innerHTML = '<b></b> <span data-i18n="' + k + '"></span>';
                now.querySelector('b').textContent = n;
                now.querySelector('span').textContent = b.querySelector('[data-i18n]').textContent;   // 목록의 현재 언어 그대로
                load(0, true);
                var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                video.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
            });
        });
        btn.addEventListener('click', function () {
            hd = !hd;
            load(video.currentTime, !video.paused);
            btn.setAttribute('aria-pressed', hd ? 'true' : 'false');
            btn.setAttribute('data-i18n', hd ? 'howtoSd' : 'howtoHd');
            btn.textContent = lang === 'en' ? EN[hd ? 'howtoSd' : 'howtoHd'] : (hd ? '표준 화질(720p)로 바꾸기' : '고화질(1080p)로 바꾸기');
        });
    }

    function init() {
        initMenu();
        initVideo();
        initEpisodes();
        var q = /[?&]lang=(en|ko)\b/.exec(location.search);
        // 기본은 한국어. 영어는 직접 고르거나(저장) ?lang=en 으로 들어온 경우만
        var initial = q ? q[1] : stored();
        if (initial === 'en') applyLang('en');
        document.getElementById('lang-btn').addEventListener('click', function () {
            applyLang(lang === 'en' ? 'ko' : 'en');
            store(lang);
            // 주소의 ?lang= 도 맞춰 두어 새로고침해도 고른 언어가 유지되게
            if (/[?&]lang=/.test(location.search) && window.history && history.replaceState) {
                var qs = location.search.replace(/([?&])lang=(en|ko)\b/, '$1lang=' + lang);
                history.replaceState(null, '', location.pathname + qs + location.hash);
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
