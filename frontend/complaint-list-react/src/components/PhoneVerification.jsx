import { useEffect, useRef, useState } from 'react';
import { postPhoneVerification } from '../api.js';

const PHONE_PATTERN = /^01[0-9]{8,9}$/;
const CODE_SECONDS = 180;

const digitsOnly = (value) => String(value || '').replace(/[^0-9]/g, '');
const formatTimer = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
};

/**
 * 휴대전화 인증 블록.
 *
 * static/js/mypage.js 의 명령형 DOM 조작(hidden 토글, setInterval, classList)을
 * 그대로 상태(useState)와 정리 함수(useEffect cleanup)로 옮긴 부분이다.
 */
export default function PhoneVerification({
  phone,
  originalPhone,
  token,
  onTokenChange,
  serverError,
}) {
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [phoneMessageOk, setPhoneMessageOk] = useState(false);
  const [codeMessage, setCodeMessage] = useState('');
  const [codeMessageOk, setCodeMessageOk] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const codeInputRef = useRef(null);

  const unchanged = digitsOnly(phone) === digitsOnly(originalPhone);

  // 연락처를 바꾸면 이전 인증 결과를 모두 무효화한다.
  useEffect(() => {
    onTokenChange('');
    setVisible(false);
    setCode('');
    setRemaining(0);
    setCodeMessage('');
    setCodeMessageOk(false);
    if (unchanged) {
      setPhoneMessage('현재 등록된 연락처입니다.');
      setPhoneMessageOk(true);
    } else {
      setPhoneMessage('연락처를 변경하려면 휴대전화 인증이 필요합니다.');
      setPhoneMessageOk(false);
    }
    // onTokenChange는 부모에서 useCallback으로 고정되어 있다.
  }, [phone, originalPhone, unchanged, onTokenChange]);

  // 남은 시간 카운트다운. 0이 되면 토큰을 버린다.
  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          onTokenChange('');
          setCodeMessage('인증시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.');
          setCodeMessageOk(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [remaining > 0, onTokenChange]); // eslint-disable-line react-hooks/exhaustive-deps

  async function requestCode() {
    const phoneNumber = digitsOnly(phone);
    if (!PHONE_PATTERN.test(phoneNumber)) {
      setPhoneMessage('올바른 휴대전화 번호를 입력해 주세요.');
      setPhoneMessageOk(false);
      return;
    }
    if (unchanged) {
      setPhoneMessage('현재 등록된 연락처와 같습니다.');
      setPhoneMessageOk(true);
      return;
    }

    setRequesting(true);
    setPhoneMessage('인증번호를 발송하고 있습니다.');
    setPhoneMessageOk(false);
    try {
      const result = await postPhoneVerification(
        '/api/phone-verifications/request',
        { phone: phoneNumber },
      );
      setVisible(true);
      setCode('');
      setCodeMessage('');
      setRemaining(CODE_SECONDS);
      setPhoneMessage(result.message);
      setPhoneMessageOk(true);
      window.setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch (exception) {
      setPhoneMessage(exception.message);
      setPhoneMessageOk(false);
    } finally {
      setRequesting(false);
    }
  }

  async function verifyCode() {
    const verificationCode = digitsOnly(code);
    if (!/^[0-9]{6}$/.test(verificationCode)) {
      setCodeMessage('인증번호 6자리를 입력해 주세요.');
      setCodeMessageOk(false);
      return;
    }

    setVerifying(true);
    try {
      const result = await postPhoneVerification(
        '/api/phone-verifications/verify',
        { phone: digitsOnly(phone), code: verificationCode },
      );
      onTokenChange(result.verificationToken);
      setRemaining(0);
      setCodeMessage(result.message);
      setCodeMessageOk(true);
    } catch (exception) {
      onTokenChange('');
      setCodeMessage(exception.message);
      setCodeMessageOk(false);
    } finally {
      setVerifying(false);
    }
  }

  const verified = Boolean(token);

  return (
    <>
      <p className={phoneMessageOk ? 'field-message success' : 'field-error'}>
        {phoneMessage}
      </p>
      <div className="field-inline">
        <button type="button" onClick={requestCode} disabled={requesting || unchanged}>
          {requesting ? '발송 중…' : '인증번호 요청'}
        </button>
      </div>

      {visible && (
        <div className={verified ? 'field verification is-verified' : 'field verification'}>
          <label htmlFor="profile-phone-code">휴대전화 인증</label>
          <div className="field-inline">
            <div className="code-wrap">
              <input
                id="profile-phone-code"
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="인증번호 6자리"
                value={code}
                disabled={verified}
                onChange={(event) => {
                  setCode(digitsOnly(event.target.value).slice(0, 6));
                  onTokenChange('');
                }}
              />
              <span className="timer">{formatTimer(remaining)}</span>
            </div>
            <button type="button" onClick={verifyCode} disabled={verifying || verified}>
              {verified ? '인증완료' : '인증확인'}
            </button>
          </div>
          {(codeMessage || serverError) && (
            <p className={codeMessageOk ? 'field-message success' : 'field-error'}>
              {codeMessage || serverError}
            </p>
          )}
        </div>
      )}
    </>
  );
}
