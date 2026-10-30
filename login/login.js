import { createClient } from '/vendor/supabase-js.js?v=20261030a';
import { SB_URL, SB_KEY } from '/account/config.js?v=20261030a';
import { signIn, enforceLoginPolicy, keepLogin, resumeJournal, linkJournal, changePassword, signOutEverywhere, loginIdOf, safeNext, message, MIN_NEW_PASSWORD } from '/account/auth.js?v=20261030a';

const sb = createClient(SB_URL, SB_KEY);
const $ = id => document.getElementById(id);
const LANG_KEY = 'snumood-lang';
let lang = 'ko';
try { lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ko'; } catch { /* 저장 불가 */ }

const EN = {
    home: '← Mood Disorders Clinic home', title: 'SNUMOOD account',
    id: 'ID', pw: 'Password', newId: 'New ID', signIn: 'Sign in',
    newJournal: 'Create a new mood-journal account', newSurvey: 'Survey sign-up (with a hospital code and patient number)',
    doctor: 'Doctor sign-in', signedInAs: 'Signed in as', openJournal: 'Open the mood journal', openSurvey: 'Surveys and results',
    linkTitle: 'Connect mood-journal records', linkLead: 'Bring the records from your old mood journal with the same ID into this account. Both passwords are checked.',
    legacyPw: 'Old mood-journal password', accountPw: 'Current account (survey) password', linkBtn: 'Connect',
    pwTitle: 'Change password', pwOld: 'Current password', pwNew: 'New password (12 or more characters)', pwCfm: 'Confirm new password', pwBtn: 'Change',
    notice1: 'This is a free online program for people who find it hard to use the paper mood chart, the mood disorder guide or the clinical mood disorder questionnaires. It is not a medical device, and the person who writes in it is responsible for its use. Security cannot be guaranteed, so do not write personally identifying or sensitive information. Do not use a user ID that could identify you. Because the program is anonymous, a lost account cannot be recovered. Back up your data to a file regularly. In the care-team view, your records appear only if you turn sharing on. System administrators can still access data on the server for operation and security checks.',
    notice2: '※ Do not enter any personal information, such as ID numbers, names or contact details, anywhere.',
    pnTitle: 'Link hospital code and patient number',
    pnLead: 'Linking the code of the hospital where you are treated and your patient number lets you take the surveys and share your journal with a clinician you choose. Linking alone does not share anything.',
    pnCode: 'Hospital code', pnNum: 'Patient number (8 digits)', pnDob: 'Year and month of birth (e.g. 1980-05)', pnBtn: 'Link',
    signOut: 'Sign out', keep: 'Stay signed in on this device (not on shared devices)'
};
const KO = {};
const T = {
    ko: {
        signingIn: '로그인하는 중…', moving: '예전 기분기록지 기록을 옮기는 중입니다. 잠시만 기다려 주세요…',
        moved: n => `예전 기분기록지 기록 ${n}건을 통합 계정으로 옮겼습니다.`,
        weak: `비밀번호가 ${MIN_NEW_PASSWORD}자보다 짧습니다. 아래 "비밀번호 바꾸기"에서 더 긴 비밀번호로 바꾸는 것을 권합니다.`,
        resumed: '끝나지 않았던 기록 옮기기를 마쳤습니다.', linkAvail: '같은 아이디의 예전 기분기록지 기록이 있습니다. 아래 "기분기록지 기록 연결"에서 가져올 수 있어요.',
        linked: n => `기분기록지 기록 ${n}건을 연결했습니다.`, pwDone: '비밀번호를 바꿨습니다.', mismatch: '새 비밀번호가 서로 다릅니다.',
        journalOnly: '이 계정은 기분기록지 전용입니다. 설문은 병원코드·환자번호가 연결된 뒤에 할 수 있어요.', need: '아이디와 비밀번호를 적어 주세요.',
        pnBad: '병원코드, 8자리 환자번호, 생년월(YYYY-MM)을 확인해 주세요.', pnDone: '병원코드와 환자번호를 연결했습니다.',
        pnFail: '연결하지 못했습니다. 병원코드와 환자번호를 확인하거나 병원에 문의해 주세요.'
    },
    en: {
        signingIn: 'Signing in…', moving: 'Moving your old mood-journal records. Please wait…',
        moved: n => `Moved ${n} old mood-journal records into the combined account.`,
        weak: `Your password is shorter than ${MIN_NEW_PASSWORD} characters. We recommend changing it below under "Change password".`,
        resumed: 'Finished moving the records that were left unfinished.', linkAvail: 'There are old mood-journal records with the same ID. You can bring them in below under "Connect mood-journal records".',
        linked: n => `Connected ${n} mood-journal records.`, pwDone: 'Your password has been changed.', mismatch: 'The new passwords do not match.',
        journalOnly: 'This account is for the mood journal only. Surveys become available once a hospital code and patient number are linked.', need: 'Please enter your ID and password.',
        pnBad: 'Please check the hospital code, the 8-digit patient number and the year-month of birth (YYYY-MM).', pnDone: 'Your hospital code and patient number are linked.',
        pnFail: 'Could not link. Please check the hospital code and patient number, or ask the hospital.'
    }
};
const t = k => T[lang][k];
const say = (el, text, kind = 'info') => { el.textContent = text || ''; el.dataset.kind = kind; };

function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(el => {
        const k = el.dataset.t;
        if (!(k in KO)) KO[k] = el.textContent;
        el.textContent = lang === 'en' && EN[k] ? EN[k] : KO[k];
    });
    $('lang-btn').textContent = lang === 'en' ? '한국어' : 'EN';
    $('lang-btn').lang = lang === 'en' ? 'ko' : 'en';
    document.title = lang === 'en' ? 'Sign in · SNUMOOD' : '로그인 · SNUMOOD';
}
$('lang-btn').addEventListener('click', () => {
    lang = lang === 'en' ? 'ko' : 'en';
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* 저장 불가 */ }
    applyLang();
});

const params = new URLSearchParams(location.search);
const next = safeNext(params.get('next'), '');
const countOf = c => Number(c?.records_legacy ?? 0) || 0;

async function showAccount(notes = []) {
    const { data } = await sb.auth.getUser();
    if (!data?.user) return showSignin();
    $('who').textContent = loginIdOf(data.user);
    const { data: prof } = await sb.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    const role = prof?.role || '';
    $('go-survey').hidden = role === 'journal';
    $('pn-box').hidden = role !== 'journal';
    if (role === 'journal' && location.hash === '#link') $('pn-box').open = true;
    if (role === 'doctor') $('go-survey').href = '/survey/doctor.html';
    if (role === 'admin') $('go-survey').href = '/survey/admin.html';
    const msgs = [...notes];
    if (role === 'journal') msgs.push(t('journalOnly'));
    if (role === 'patient' || role === 'journal') {
        const st = await resumeJournal(sb);
        if (st.result === 'resumed') msgs.push(t('resumed'));
        $('link-box').hidden = st.result !== 'link_available';
        if (st.result === 'link_available') { msgs.push(t('linkAvail')); $('link-box').dataset.legacy = st.legacy_username; }
    }
    say($('account-msg'), msgs.join('\n'));
    $('signin').hidden = true;
    $('account').hidden = false;
}

function showSignin() {
    $('account').hidden = true;
    $('signin').hidden = false;
    $('s-id').focus();
}

$('signin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('signin-msg'), btn = $('signin-btn');
    const id = $('s-id').value.trim(), pw = $('s-pw').value;
    const newId = $('newid-wrap').hidden ? null : $('s-newid').value.trim();
    if (!id || !pw) return say(msg, t('need'), 'error');
    btn.disabled = true;
    say(msg, t('signingIn'));
    const slow = setTimeout(() => say(msg, t('moving')), 1500);
    const r = await signIn(sb, id, pw, { newUsername: newId || null, keep: $('s-keep').checked });
    clearTimeout(slow);
    btn.disabled = false;
    if (!r.ok) {
        if (['needs_new_username', 'invalid_new_username', 'username_taken'].includes(r.reason)) {
            $('newid-wrap').hidden = false;
            $('s-newid').focus();
        }
        return say(msg, message(r.reason, lang), 'error');
    }
    $('s-pw').value = '';
    const notes = [];
    if (r.migrated) notes.push(t('moved')(countOf(r.counts)));
    if (r.weak) notes.push(t('weak'));
    if (next && !r.weak && !r.migrated) return location.replace(next);
    await showAccount(notes);
    if (r.weak) $('pw-box').open = true;
});

$('link-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('link-msg');
    const r = await linkJournal(sb, $('link-box').dataset.legacy || '', $('k-legacy').value, $('k-account').value);
    $('k-legacy').value = ''; $('k-account').value = '';
    if (r.result !== 'linked') return say(msg, message(r.result, lang), 'error');
    say(msg, t('linked')(countOf(r.counts)), 'ok');
    $('link-box').open = false;
    $('link-box').hidden = true;
    say($('account-msg'), t('linked')(countOf(r.counts)), 'ok');
});

$('pn-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('pn-msg');
    const code = $('p-code').value.trim().toUpperCase(), num = $('p-num').value.trim(), dob = $('p-dob').value.trim();
    if (!code || !/^[0-9]{8}$/.test(num) || !/^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$/.test(dob)) return say(msg, t('pnBad'), 'error');
    const { data, error } = await sb.rpc('link_patient_number', { p_hospital_code: code, p_patient_number: num, p_dob: dob });
    if (error || data?.status !== 'linked') return say(msg, t('pnFail'), 'error');
    ['p-code', 'p-num', 'p-dob'].forEach(id => { $(id).value = ''; });
    $('pn-box').open = false;
    await showAccount([t('pnDone')]);
});

$('pw-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('pw-msg');
    if ($('c-new').value !== $('c-cfm').value) return say(msg, t('mismatch'), 'error');
    const r = await changePassword(sb, $('c-old').value, $('c-new').value);
    ['c-old', 'c-new', 'c-cfm'].forEach(id => { $(id).value = ''; });
    say(msg, r.ok ? t('pwDone') : message(r.reason, lang), r.ok ? 'ok' : 'error');
});

$('signout').addEventListener('click', async () => {
    await signOutEverywhere(sb);
    location.replace('/login/');
});

applyLang();
$('s-keep').checked = keepLogin();
if (await enforceLoginPolicy(sb)) {
    if (next) location.replace(next);
    else await showAccount();
} else {
    showSignin();
}
