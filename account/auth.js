// SNUMOOD 통합 계정: 기분기록지·설문·홈페이지가 같은 출처(snumood.com)에서 함께 쓰는 로그인 도우미.
// 계정은 설문 프로젝트의 Supabase Auth 하나. 옛 기분기록지 계정은 첫 로그인 때 journal-migrate 함수가 옮긴다.
// 비밀번호는 Supabase(HTTPS)로만 보내고 저장·기록하지 않는다. 각 페이지는 자기 supabase 클라이언트를 넘긴다.

export const PATIENT_DOMAIN = 'patient.local';
export const MIN_NEW_PASSWORD = 12;

// 서버 jm_email_for 와 같은 규칙: 이메일로 바꿀 수 있는 아이디만 Auth 로 바로 로그인한다.
const EMAIL_SAFE = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,62}[A-Za-z0-9]$/;
export function emailFor(id) {
    const s = String(id ?? '').trim();
    return EMAIL_SAFE.test(s) && !s.includes('..') ? `${s.toLowerCase()}@${PATIENT_DOMAIN}` : null;
}

export function loginIdOf(user) {
    const email = String(user?.email ?? '');
    return email.endsWith('@' + PATIENT_DOMAIN) ? email.slice(0, -PATIENT_DOMAIN.length - 1) : (user?.user_metadata?.username || email);
}

// 같은 사이트 안의 경로만 돌아갈 곳으로 받는다.
export function safeNext(raw, fallback = '/') {
    const s = String(raw ?? '');
    if (!s.startsWith('/') || s.startsWith('//') || s.includes('\\') || /[\u0000-\u001f\u007f]/.test(s)) return fallback;
    return s;
}

async function callMigrate(sb, body, withSession) {
    const headers = {};
    if (withSession) {
        const { data } = await sb.auth.getSession();
        if (!data?.session) return { status: 401, result: 'login_required' };
        headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    const { data, error } = await sb.functions.invoke('journal-migrate', { body, headers });
    if (!error) return { status: 200, ...(data || {}) };
    const res = error.context;
    if (res && typeof res.json === 'function') {
        try { return { status: res.status, ...(await res.json()) }; } catch { /* 본문 없음 */ }
        return { status: res.status, result: 'retry_later' };
    }
    return { status: 0, result: 'network' };
}

/**
 * 아이디·비밀번호 로그인. 통합 계정이 없고 옛 기분기록지 계정이 있으면 그 자리에서 옮긴 뒤 로그인한다.
 * 결과: {ok:true, migrated, counts, weak(짧은 옛 비밀번호 → 바꾸기 권유)} 또는 {ok:false, reason}
 *   reason: invalid | locked | already_migrated | collision | needs_new_username | invalid_new_username |
 *           username_taken | busy | retry_later | rate_limited | network
 */
export async function signIn(sb, id, password, { newUsername = null } = {}) {
    const loginId = String(id ?? '').trim();
    if (!loginId || !password) return { ok: false, reason: 'invalid' };
    const email = emailFor(loginId);
    if (email && !newUsername) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (!error && data?.session) {
            const st = await resumeJournal(sb);
            return { ok: true, migrated: false, journal: st, weak: !!data.weak_password || password.length < MIN_NEW_PASSWORD };
        }
        // Auth 자체의 잠금·장애일 때는 옛 계정으로 넘어가지 않는다(계정 없음·비밀번호 틀림일 때만).
        if (error && error.code !== 'invalid_credentials') {
            return { ok: false, reason: error.status === 429 ? 'rate_limited' : (error.status ? 'retry_later' : 'network') };
        }
    }
    const r = await callMigrate(sb, { action: 'migrate', username: loginId, password, new_username: newUsername || undefined }, false);
    if (r.result !== 'migrated') return { ok: false, reason: r.result || 'retry_later' };
    const { data, error } = await sb.auth.signInWithPassword({ email: r.email, password });
    if (error || !data?.session) return { ok: false, reason: 'retry_later' };
    return { ok: true, migrated: true, counts: r.counts || null, loginId: r.email.split('@')[0],
             weak: password.length < MIN_NEW_PASSWORD };
}

// 로그인한 사람: 끝나지 않은 이전을 이어서 하고, 같은 아이디의 옛 기록이 남아 있으면 알려 준다.
// 결과 result: none | done | resumed | link_available(legacy_username) | busy | retry_later
export async function resumeJournal(sb) {
    try {
        return await callMigrate(sb, { action: 'status' }, true);
    } catch {
        return { result: 'retry_later' };
    }
}

// 설문 계정과 이름이 같은 옛 기분기록지 계정을 연결(두 비밀번호 모두 확인).
export async function linkJournal(sb, legacyUsername, legacyPassword, accountPassword) {
    return callMigrate(sb, { action: 'link', username: legacyUsername, password: legacyPassword, survey_password: accountPassword }, true);
}

// 기분기록지 전용 새 계정(환자번호 없음). 비밀번호는 12자 이상(서버 정책).
export async function signUpJournal(sb, id, password) {
    const loginId = String(id ?? '').trim();
    const email = emailFor(loginId);
    if (!email) return { ok: false, reason: 'invalid_username' };
    if (String(password ?? '').length < MIN_NEW_PASSWORD) return { ok: false, reason: 'weak_password' };
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { role: 'journal', username: loginId } } });
    if (error) {
        if (error.code === 'user_already_exists' || error.code === 'email_exists') return { ok: false, reason: 'username_taken' };
        if (error.code === 'weak_password') return { ok: false, reason: 'weak_password' };
        return { ok: false, reason: error.status === 429 ? 'rate_limited' : 'retry_later' };
    }
    if (!data?.session) return { ok: false, reason: 'retry_later' };
    return { ok: true };
}

// 현재 비밀번호를 다시 확인한 뒤 바꾼다. 새 비밀번호는 12자 이상.
export async function changePassword(sb, currentPassword, newPassword) {
    const { data: u } = await sb.auth.getUser();
    if (!u?.user?.email) return { ok: false, reason: 'login_required' };
    if (String(newPassword ?? '').length < MIN_NEW_PASSWORD) return { ok: false, reason: 'weak_password' };
    const { error: e1 } = await sb.auth.signInWithPassword({ email: u.user.email, password: currentPassword });
    if (e1) return { ok: false, reason: e1.code === 'invalid_credentials' ? 'invalid' : 'retry_later' };
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, reason: error.code === 'weak_password' ? 'weak_password' : (error.code === 'same_password' ? 'same_password' : 'retry_later') };
    return { ok: true };
}

// 한 출처라 로그아웃 한 번으로 기분기록지·설문·홈페이지 모두 나간다(설문 출입 쿠키 포함).
export async function signOutEverywhere(sb) {
    try { await sb.auth.signOut({ scope: 'local' }); } catch { /* 이미 만료 */ }
    try { await fetch('/_gate/logout', { method: 'POST', credentials: 'same-origin', keepalive: true }); } catch { /* 게이트 없음 */ }
}

export const MESSAGES = {
    ko: {
        invalid: '아이디가 없거나 비밀번호가 틀립니다.',
        locked: '로그인 시도가 너무 많아 잠시 잠겼습니다. 15분 뒤 다시 시도해 주세요.',
        rate_limited: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.',
        already_migrated: '이 기분기록지 계정은 이미 통합 계정으로 옮겨졌습니다. 옮긴 뒤의 아이디·비밀번호로 로그인해 주세요.',
        collision: '같은 아이디의 설문 계정이 이미 있습니다. 설문 비밀번호로 로그인한 뒤 "기분기록지 기록 연결"을 눌러 주세요.',
        needs_new_username: '이 아이디는 새 계정에서 쓸 수 없는 글자가 있습니다. 새 아이디(영문·숫자, 2~64자)를 정해 주세요.',
        invalid_new_username: '새 아이디는 영문·숫자로 시작하고 끝나야 하며 2~64자여야 합니다(. _ + - 사용 가능).',
        username_taken: '이미 사용 중인 아이디입니다. 다른 아이디를 정해 주세요.',
        invalid_username: '아이디는 영문·숫자로 시작하고 끝나야 하며 2~64자여야 합니다(. _ + - 사용 가능).',
        weak_password: `비밀번호는 ${MIN_NEW_PASSWORD}자 이상이어야 합니다.`,
        same_password: '지금 비밀번호와 다른 비밀번호를 적어 주세요.',
        busy: '이전 작업이 진행 중입니다. 1~2분 뒤 다시 시도해 주세요.',
        retry_later: '잠시 문제가 생겼습니다. 조금 뒤 다시 시도해 주세요.',
        network: '서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.',
        login_required: '다시 로그인해 주세요.',
        survey_password_invalid: '통합 계정(설문) 비밀번호가 틀립니다.',
        username_mismatch: '로그인한 아이디와 같은 이름의 기분기록지 계정만 연결할 수 있습니다.',
        already_linked: '이 계정에는 이미 다른 기분기록지 기록이 연결되어 있습니다.',
        orphan_conflict: '자동으로 연결할 수 없습니다. 관리자에게 문의해 주세요.',
        account_not_eligible: '이 계정은 기분기록지를 쓸 수 없습니다.'
    },
    en: {
        invalid: 'The ID does not exist or the password is wrong.',
        locked: 'Too many attempts. Please try again in 15 minutes.',
        rate_limited: 'Too many requests. Please try again shortly.',
        already_migrated: 'This mood-journal account has already moved to the combined account. Please sign in with the ID and password you used after the move.',
        collision: 'A survey account with the same ID already exists. Sign in with the survey password, then choose "Connect mood-journal records".',
        needs_new_username: 'This ID contains characters the new account cannot use. Please choose a new ID (letters and numbers, 2–64).',
        invalid_new_username: 'A new ID must start and end with a letter or number and be 2–64 characters (. _ + - allowed).',
        username_taken: 'That ID is already in use. Please choose another.',
        invalid_username: 'An ID must start and end with a letter or number and be 2–64 characters (. _ + - allowed).',
        weak_password: `The password must be at least ${MIN_NEW_PASSWORD} characters.`,
        same_password: 'Please choose a password different from the current one.',
        busy: 'A move is in progress. Please try again in a minute or two.',
        retry_later: 'Something went wrong. Please try again shortly.',
        network: 'Could not reach the server. Please check your connection.',
        login_required: 'Please sign in again.',
        survey_password_invalid: 'The combined-account (survey) password is wrong.',
        username_mismatch: 'Only a mood-journal account with the same ID as your sign-in can be connected.',
        already_linked: 'Other mood-journal records are already connected to this account.',
        orphan_conflict: 'This cannot be connected automatically. Please contact the administrator.',
        account_not_eligible: 'This account cannot use the mood journal.'
    }
};

export function message(reason, lang = 'ko') {
    const t = MESSAGES[lang === 'en' ? 'en' : 'ko'];
    return t[reason] || t.retry_later;
}
