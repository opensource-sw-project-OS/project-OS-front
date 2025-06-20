<img src="https://capsule-render.vercel.app/api?type=venom&height=300&color=gradient&text=Project_OS_Front&fontColor=BLACK&fontSize=70&descAlign=50">


## 📜 GitHub 규칙

#### 👩‍💻 프로젝트 초반 : fork 후 test branch에서 commit하고 Pull Request
- 초반에는 간단한 구조이므로 fork 방식으로 진행
  
#### 👩‍💻 프로젝트 후반 : 기능 브랜치 따로 작업 후 dev에 merge, 최종적으로 main에 merge
- 후반에는 기능, 페이지가 많아지고 백엔드 연동 등 복잡도가 올라가여 브랜치 전략을 기능 단위 개발 및 테스트가 더 수월한 구조로 전환
- (작업을 진행하며 불편함을 느껴 기존 방식보다 실무적인 방식으로 구조 개선)
- ex)  [main] ← [dev] ← [feat/login], [feat/signup] 등 
  - main: 배포 가능 상태
  - dev: 테스트 및 feat 조립
  - feat/*: 기능 단위 개발 -> 버그 원인 파악, 롤백 용이
- Insights - Network
 
   ![image](https://github.com/user-attachments/assets/1e39ae4b-f991-4321-8181-8501e33070ff)


<br><br>

---


## 📎 front-end 사용 오픈소스 목록 

🔖 **Three.js** 감정 캐릭터를 3D로 시각화하기 위한 WebGL 라이브러리 - 따로 glb 파일 다운받아 해당 오픈소스로 3D 캐릭터 표시

🔖 **GLTFLoader / OrbitControls** Three.js에서 제공하는 3D 모델 로딩 및 카메라 컨트롤 기능

🔖 **Chart.js** 지출 데이터를 시각화하기 위한 차트 라이브러리

🔖 **affirmations** 사용자에게 긍정 문구 출력

🔖 **Cropper.js** 이미지 업로드 후 크롭 기능

🔖 **FullCalendar** 웹 페이지에 달력(캘린더) UI를 쉽게 구현 - 일정 추가, 드래그 이동, 일간/주간/월간 뷰 전환 등

🔖 (**SUIT 웹폰트** UI 텍스트에 적용 한글 폰트)

🔖 **[백엔드 구현 전 임시] CORS Anywhere** 외부 API 호출 시 CORS 우회를 위한 오픈소스 프록시 사용


---
<br>

# 📝 Project frond-end log 
### 2025-05-04
- 웹사이트 intro 페이지 (project_os_intro.html) 추가
<br>

### 2025-05-06 
- Tesseract.js(프론트엔드에서 가능)를 이용한 영수증 인식 페이지 (input-spending.html)추가

-> 예상보다 한글 인식이 잘 안됨

-> 백엔드를 이용한 오픈소스로 변경 필요

<br>

### 2025-05-08
- 대시보드 페이지 (dashboard.html) 추가 : 기능들 중앙 집중적 관리
- 예산 기능 추가
  - 사용자가 예산을 입력할 수 있는 폼 추가
  - Chart.js를 이용해 남은 예산을 파이 차트로 시각화
  - input validation 로직 간단히 구현
- 메뉴 추천 탭 추가
  - 사용자의 예산에 따른 메뉴 추천 기능 탭 추가
- 지출 기능 추가
  - 사용자의 지출 그래프 시각화 기능 추가

<br>


### 2025-05-09
- 감정 기능 추가
  - Three.js를 이용하여 사용자의 감정에 맞는 캐릭터 표시
  - Affirmations를 이용하여 긍정 문구 기능 추가


<br>


### 2025-05-10
- 대시보드 페이지 헤더 추가

<br>


### 2025-05-11
- 지출 입력 기능 추가
  - 사진 업로드 후 ocr -> 한글 인식 보완 예정
  - Cropper.js를 이용하여 이미지 업로드 후 크롭 기능 추가

<br>

### 2025-05-13
- 메뉴 추천 기능
  - Google Maps API 추가
- 감정 기능
  - 긍정 문구 출력 조건 추가 (부정적인 감정일 때만 출력)
 
<br>

### 2025-05-19
- feat/login : 로그인 페이지 추가
- feat/signup : 회원가입 페이지 추가

<br>

### 2025-05-25
- 그래프 탭 변경
  - 그래프 시각화 항목 변경
    - 감정별 지출 총액
    - 일별 감정/지출
    - (일별 지출)
    - 카테고리별 지출
- input 탭 지출/감정 통합
  - 지출, 감정 입력을 하나의 탭에서 입력하는 것으로 변경
 

<br>

### 2025-05-28
- 이번 달 달력 탭 추가
  - 이번 달의 감정과 지출 내역을 한눈에 볼 수 있도록
- 감정 다이어리
  - 입력했던 감정 문구를 날짜, 감정 이모티콘과 함께 출력
  - 이번 주 감정 평균을 캐릭터로 추력

<br>

### 2025-06-03
- html 백엔드 연동 완료
- html ui 수정
- 대시보드 입력창 변경
- 서버 api 코드 구현
- models/glb 
  - 기존 3d glb 파일들 삭제 - 감정 캐릭터
  - 새 3d glb 파일들 추가 - 표정 구현
- 서버 코드 수정하여 그래프 출력 에러 수정
- api 에러 수정

<br>

### 2025-06-04
- api 연동 수정 및 api 명세서 작성
- 예산 기능 남은 예산 및 초과 문구 추가
- 백엔드 연동시 에러 수정
- 최종발표 전 테스트


<br>

### 2025-06-11
- 프론트엔드 최종 구조 변경
  - public 폴더 : 정적 파일
      - css, js

<br>

---


## repository 구조

```
📁 models                       ← 감정을 나타내는 3D GLB 파일들
├── 📄 angry.glb                ← 분노 감정 모델 
├── 📄 anxious.glb              ← 불안 감정 모델 
├── 📄 happy.glb                ← 기쁨 감정 모델 
├── 📄 normal.glb               ← 중립 감정 모델 
└── 📄 sad.glb                  ← 슬픔 감정 모델 

📁 public                       ← 정적 파일(CSS, JS) 저장 위치 
├── 📁 css
│   └── 📄 dashboard.css        ← 대시보드의 스타일을 정의한 CSS 파일 
└── 📁 js
    └── 📄 dashboard.js         ← 대시보드의 주요 기능 구현 JavaScript 파일 

📁 template                     ← 렌더링될 HTML 템플릿 페이지들 
├── 📄 dashboard.html           ← 메인 대시보드 페이지
├── 📄 login.html               ← 로그인 페이지 
├── 📄 project_os_intro.html    ← 최초 접속 페이지 
└── 📄 signup.html              ← 회원가입 페이지 
```



