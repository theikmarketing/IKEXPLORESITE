# PayPal Integration Setup

## 설정 방법

1. **PayPal Developer Account 생성**
   - https://developer.paypal.com 에서 계정 생성
   - Dashboard > My Apps & Credentials 접속

2. **Sandbox App 생성**
   - "Create App" 클릭
   - App 이름 입력
   - Sandbox 환경 선택
   - Client ID와 Secret 복사

3. **환경 변수 설정**
   - `.env.local` 파일을 프로젝트 루트에 생성
   - 다음 내용 추가:
     ```
     NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
     ```
   - `.env.local.example` 파일을 참고하세요

4. **테스트**
   - Sandbox 계정으로 결제 테스트
   - PayPal Sandbox 테스트 계정 사용:
     - https://developer.paypal.com/dashboard/accounts
     - 테스트 계정 생성 또는 기존 계정 사용

## 주의사항

- **Sandbox**: 개발/테스트용 (실제 결제 아님)
- **Production**: 실제 결제를 위해 Live 환경의 Client ID 사용 필요
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

## Production 배포 시

1. PayPal Dashboard에서 Live 환경 앱 생성
2. Live Client ID로 환경 변수 업데이트
3. 백엔드에서 결제 검증 로직 구현 (권장)
