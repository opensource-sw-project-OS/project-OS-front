


        // 로그인된 유저 토큰 및 ID 저장
  let user_token = localStorage.getItem('token');
  let user_id = localStorage.getItem('Userid');


  if (!user_token) {
  alert("로그인이 필요합니다.");
  window.location.href = "login.html";
}


  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('Userid');
    window.location.href = 'project_os_intro.html';
  }


    async function POST(endpoint='/',payload={}) {

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user_token}`
        }
      });
      const data = await res.json();
      console.log(data)
      return data; // { date: ..., amount: ... }
    } catch (err) {
      console.error("OCR 업로드 오류:", err);
      return null;
    }
  }

  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }


    window.showReceiptInput = function showReceiptInput() {
    const main = document.getElementById("main");
    if (!main) return;

    main.innerHTML = `
      <div class="glass-row-2">
        <div class="glass-col">
          <h3>오늘의 지출을 입력해주세요.</h3>
          <input type="file" id="upload" accept="image/*" style="margin-top:10px; padding:8px 16px; border:none; background:#83A2DB; color:white; border-radius:8px;" />
          <img id="preview" style="max-width:100%; display:none;" />
          <img id="croppedResult" style="max-width:100%; display:none;" />
          <div id="ocrResult"></div>
          <br>
          <label>분야 선택:</label>
          <select id="category">
            <option value="식비">식비</option>
            <option value="교통">교통</option>
            <option value="편의점">편의점</option>
            <option value="구독">구독</option>
            <option value="기타">기타</option>
          </select>
          <br><br>
          <button id="confirmCrop" style="margin-top:10px; padding:8px 16px; border:none; background:#83A2DB; color:white; border-radius:8px;"> 크롭 </button>
          <button id="runOCR" style="margin-top:10px; padding:8px 16px; border:none; background:#83A2DB; color:white; border-radius:8px;"> OCR 실행 </button>

          <div style="margin-top:20px;">
            <input type="text" id="manualDate" placeholder="날짜 (예: 2025-06-01)" value="${getTodayDate()}" />
            <input type="number" id="manualAmount" placeholder="총합 금액 (₩)" />
          </div>
        </div>

        <div class="glass-col">
          <h3>오늘의 감정을 입력해주세요.</h3>
          <input type="text" id="dailyFeelingInput" />
          <button id="submitBtn" style="margin-top:10px; padding:8px 16px; border:none; background:#83A2DB; color:white; border-radius:8px;">오늘의 기록 저장</button>
          <div id="submitResult"></div>
        </div>
      </div>
    `;

    let cropper = null;
    let croppedBlob = null;

    document.getElementById("upload").addEventListener("change", () => {
      const file = upload.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
        if (cropper) cropper.destroy();
        cropper = new Cropper(preview, { aspectRatio: NaN, viewMode: 1 });
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("confirmCrop").addEventListener("click", () => {
      if (!cropper) return;

      const canvas = cropper.getCroppedCanvas();
      
      // ✅ base64 문자열로 변환
      const base64Data = canvas.toDataURL("image/png");

      // base64 저장
      window.base64Cropped = base64Data;

      // 미리보기 업데이트
      croppedResult.src = base64Data;
      croppedResult.style.display = 'block';
      preview.style.display = 'none';

      cropper.destroy();
    });

    document.getElementById("runOCR").addEventListener("click", async () => {
      
      if (!window.base64Cropped) return alert("크롭 후 OCR 실행해주세요");
      
      const OCR_result = await POST('/api/ocr', payload={data: window.base64Cropped});
      console.log(OCR_result)
      if (OCR_result && !OCR_result.err) {
        document.getElementById("manualDate").value = OCR_result.date || getTodayDate();
        document.getElementById("manualAmount").value = OCR_result.total || "";
        document.getElementById("ocrResult").innerText = "OCR 인식 성공";
      } else {
        document.getElementById("ocrResult").innerText = "OCR 실패";
      }
    });

    document.getElementById("submitBtn").addEventListener("click", async () => {
      const date = document.getElementById("manualDate").value;
      const total = document.getElementById("manualAmount").value;
      const emotion = document.getElementById("dailyFeelingInput").value;
      const category = document.getElementById("category").value;
      const resultBox = document.getElementById("submitResult");

      if (!date || !total || !emotion || !category) {
        resultBox.innerText = "모든 항목을 입력해주세요.";
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/data", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${user_token}`
          },
          body: JSON.stringify({
            date,
            total,
            emotion_string: emotion,
            category
          })
        });

        const data = await res.json();
        if (!data.err) {
          resultBox.innerText = `저장 완료: ${data.emotion_response || "처리됨"}`;
        } else {
          resultBox.innerText = `에러 발생: ${data.err}`;
        }
      } catch (err) {
        resultBox.innerText = `전송 실패: ${err.message}`;
      }
    });
  }

  

  function toggleResult() {
    const container = document.getElementById("resultContainer");
    container.style.display = (container.style.display === "none") ? "block" : "none";
  }

  async function loadAffirmation() {
    try {
      const res = await fetch("http://localhost:3000/api/affirmation");
      if (!res.ok) throw new Error("리소스 요청 실패");

      const data = await res.json();
      const quote = data.affirmation;

      document.getElementById("affirmationBox").innerHTML = `
        <h3>오늘의 긍정 문구 🌼</h3>
        <p style="font-size:18px;">"${quote}"</p>
      `;
    } catch (err) {
      document.getElementById("affirmationBox").innerHTML = `<p>긍정 문구를 불러오지 못했습니다.</p>`;
      console.error("오류 발생:", err);
    }
  }

window.showBudget = async function showBudget() {
  const main = document.getElementById("main");

  // 이번 달 사용 금액 서버에서 받아오기
  let usedAmount = 0;
  try {
    const res = await fetch(`http://localhost:3000/api/receipts/usage/month/${user_id}`, {
      headers: { Authorization: `Bearer ${user_token}` }
    });
    const data = await res.json();
    usedAmount = data.total_used || 0;
  } catch (err) {
    console.error("이번 달 사용 금액 조회 실패:", err);
  }

  main.innerHTML = `
    <div class="glass-box">
      <h2>이번 달 예산</h2>
      <p style="font-size: 16px; margin-bottom: 15px;">이번 달 지출 총합: <strong>${usedAmount.toLocaleString()}원</strong></p>
      <input type="number" id="totalBudget" placeholder="총 예산 입력 (₩)" style="padding: 5px 16px; margin-bottom: 10px; border-radius: 8px;" />
      <input type="number" id="usedBudget" value="${usedAmount}" readonly style="padding: 5px 16px; margin-bottom: 20px; border-radius: 8px; background:#eee; display: none;" />
      <button onclick="drawChart()" style="margin-top:10px; padding:8px 16px; border:none; background:#83A2DB; color:white; border-radius:8px;">한눈에 확인</button>
      <canvas id="budgetChart" width="300" height="300"></canvas>
    </div>
  `;

  // 전역변수로 저장
  window.usedAmount = usedAmount;
}


  
      function drawChart() {
        const total = parseInt(document.getElementById("totalBudget").value);
        const used = parseInt(document.getElementById("usedBudget").value);
        const remain = total - used;
  
        const ctx = document.getElementById('budgetChart').getContext('2d');
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['사용한 금액', '남은 금액'],
            datasets: [{
              data: [used, remain],
              backgroundColor: ['#CE6969', '#83A2DB'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: {
                    family: 'SUIT',
                    size: 14
                  }
                }
              }
            }
          }
        });
      }
  



  window.showEmotionDiary=async function showEmotionDiary() {
  const main = document.getElementById("main");

  const today = new Date();
  const end = today.toISOString().split('T')[0];

  const past = new Date();
  past.setDate(today.getDate() - 13); // 최근 14일 범위 조회
  const start = past.toISOString().split('T')[0];

  main.innerHTML = `
    <div id="calendar-view">
      <div class="emotion-diary-container">
        <div class="glass-col emotion-table">
          <h2 style="text-align:center; font-weight:bold;">감정 다이어리</h2>
          <table id="diaryTable">
            <thead>
              <tr>
                <th>날짜</th>
                <th>감정</th>
                <th>그날의 문장</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="3" style="text-align:center;">데이터 로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
        <div class="glass-col" style="flex: 1;">
          <h3 style="font-size:25px;">이번 주의 감정</h3>
          <canvas id="threeCanvas" style="width: 100%; height: 300px;"></canvas>
        </div>
      </div>
    </div>
  `;

  const url = `http://localhost:3000/api/emotion-diary/range?userId=${user_id}&start=${start}&end=${end}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${user_token}` }
    });
    const data = await res.json();

    if (data.err) {
      if (data.err.name === "TokenExpiredError") {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "login.html";
        return;
      }
      throw new Error(data.err.message || "서버 에러");
    }

    const tbody = document.querySelector("#diaryTable tbody");
    const emotionMap = {
      '기쁨': '😄',
      '중립': '😐',
      '불안': '🥶',
      '슬픔': '😭',
      '분노': '😡'
    };
    const emotionCount = {};

    function toKSTDateOnly(dateStr) {
      const utc = new Date(dateStr);
      const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
      return kst.toISOString().slice(0, 10);
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">감정 일기 데이터가 없습니다.</td></tr>`;
    } else {
      tbody.innerHTML = "";

      data.forEach(entry => {
        const dateOnly = toKSTDateOnly(entry.date);
        const dateFormatted = dateOnly.slice(5).replace('-', '/');
        const emoji = emotionMap[entry.emotion] || '❓';

        tbody.innerHTML += `
          <tr>
            <td>${dateFormatted}</td>
            <td style="font-size:24px;">${emoji}</td>
            <td>${entry.sentence || ''}</td>
          </tr>
        `;
      });

      // 🎯 최근 7일 감정만 따로 카운트
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6); // 오늘 포함 7일
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const last7DaysData = data.filter(entry => {
        const date = new Date(entry.date);
        return date >= sevenDaysAgo;
      });

      last7DaysData.forEach(entry => {
        if (entry.emotion) {
          emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
        }
      });

      const topEmotion = Object.entries(emotionCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // 캐릭터 설정
      const modelConfigMap = {
        '기쁨': { file: 'happy.glb', scale: [20, 20, 20], position: [-45, 0, 0], rotationY: -Math.PI / 2 },
        '중립': { file: 'normal.glb', scale: [20, 20, 20], position: [114, 0, -4.0], rotationY: -Math.PI / 2 },
        '불안': { file: 'anxious.glb', scale: [20, 20, 20], position: [-6, 0, 0], rotationY: -Math.PI / 2 },
        '슬픔': { file: 'sad.glb', scale: [20, 20, 20], position: [-127, 0, -6.0], rotationY: -Math.PI / 2 },
        '분노': { file: 'angry.glb', scale: [20, 20, 20], position: [72, 0, -4.0], rotationY: -Math.PI / 2 },
      };

      const config = modelConfigMap[topEmotion];

      if (config) {
        init3D();
        const loader = new THREE.GLTFLoader();
        // loader.load(`../models/${config.file}`, (gltf) => {
        loader.load(`http://localhost:3000/models/${config.file}`, (gltf) => {

          if (model) scene.remove(model);
          model = gltf.scene;

          model.scale.set(...config.scale);
          model.position.set(...config.position);
          model.rotation.y = config.rotationY;

          scene.add(model);
        });
      }

      // 긍정 문구 삽입
      const negativeEmotions = ['분노', '불안', '슬픔'];
      if (negativeEmotions.includes(topEmotion)) {
        const affirmationBox = document.createElement("div");
        affirmationBox.className = "glass-box";
        affirmationBox.id = "affirmationBox";
        affirmationBox.style.maxWidth = "100%";
        affirmationBox.style.margin = "10px auto";
        affirmationBox.style.display = "block";
        affirmationBox.innerHTML = `<p style="font-size: 16px;">긍정 문구를 불러오는 중...</p>`;
        document.getElementById("calendar-view").appendChild(affirmationBox);

        loadAffirmation(); // 긍정 문구 불러오기 함수 호출
      }
    }
  } catch (err) {
    console.error("감정 일기 조회 실패:", err);
    const tbody = document.querySelector("#diaryTable tbody");
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
  }
}


window.showSpending = function showSpending() {
  document.getElementById("main").innerHTML = `
    <div class="glass-box">
      <h2></h2>
      <select id="chartSelector" style="padding: 8px 16px; margin-bottom: 20px; border-radius: 8px;">
        <option value="emotionTotal">감정별 지출 총액</option>
        <option value="dailyEmotion">일별 감정과 지출</option>
        <option value="perEmotion">내 감정 확인</option>
        <option value="categoryTotal">카테고리별 지출</option>
      </select>
      <canvas id="spendingChart" height="300"></canvas>
    </div>
  `;

  // chart 변수를 전역처럼 처리 (재사용 위해)
  let currentChart = null;

  const selector = document.getElementById("chartSelector");
  selector.addEventListener("change", drawSelectedChart);
  drawSelectedChart();  // 첫 실행

  async function drawSelectedChart() {
    const selected = selector.value;
    const canvas = document.getElementById("spendingChart");
    const ctx = canvas.getContext("2d");

    if (currentChart) {
      currentChart.destroy();
    }

    if (document.getElementById('emotionSummary')) {
      document.getElementById('emotionSummary').remove();
    }

    if (selected === "emotionTotal") {
      currentChart = await drawEmotionTotalChart(ctx);
    } else if (selected === "dailyEmotion") {
      currentChart = await drawDailyEmotionChart(ctx);
    } else if (selected === "categoryTotal") {
      currentChart = await drawCategoryChart(ctx);
    } else if (selected === "perEmotion") {
      currentChart = await perEmotion(ctx);
    }
  }

  async function drawEmotionTotalChart(ctx) {
    try {
      const res = await fetch("http://localhost:3000/api/graph/emotion", {
        headers: { Authorization: `Bearer ${user_token}` }
      });
      const data = await res.json();

      const labels = data.map(d => d.emotion);
      const values = data.map(d => d.total);
            
      // 중립 기쁨 불안 분노 슬픔
      const colors = ['#97C1A9', '#ce6969', '#CBAACB', '#FFE880', '#83A2DB'];
      const total = values.reduce((a, b) => a + b, 0);
      const percents = values.map(v => Math.round((v / total) * 100));
      const maxIndex = values.indexOf(Math.max(...values));

      const summary = document.createElement("h3");
      summary.id = "emotionSummary";
      summary.style.textAlign = "center";
      summary.style.marginBottom = "15px";
      summary.innerHTML = `최근 한 달 간 <span style="color:${colors[maxIndex]};  text-shadow:
        -0.5px -0.5px 0 gray,
         0.5px -0.5px 0 gray,
        -0.5px  0.5px 0 gray,
         0.5px  0.5px 0 gray; font-weight:bold; font-size:30px">${labels[maxIndex]}</span> 감정에서 지출이 가장 많아요<br>
        <span style="color:${colors[maxIndex]};  text-shadow:
        -0.5px -0.5px 0 gray,
         0.5px -0.5px 0 gray,
        -0.5px  0.5px 0 gray,
         0.5px  0.5px 0 gray; font-weight:bold; font-size:24px">${labels[maxIndex]}</span> 감정일 때 지출을 주의하세요!`;
      document.querySelector(".glass-box").insertBefore(summary, document.getElementById("spendingChart"));

      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '지출 총액',
            data: values,
            backgroundColor: colors,
            borderRadius: 10
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return `₩${ctx.raw.toLocaleString()} (${percents[ctx.dataIndex]}%)`;
                }
              }
            },
            legend: { display: false }
          },
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
    } catch (err) {
      console.error("emotion chart error:", err);
    }
  }
async function drawDailyEmotionChart(ctx) {
  try {
    const res = await fetch("http://localhost:3000/api/graph/daily", {
      headers: { Authorization: `Bearer ${user_token}` }
    });
    const rawData = await res.json();

    // 날짜 보정 (UTC → KST)
    function toKSTDateOnly(dateStr) {
      const utc = new Date(dateStr);
      const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
      return kst.toISOString().slice(0, 10);
    }

    // 날짜별로 총 지출 및 대표 감정 정리
    const dailyMap = {}; // { '2025-06-03': { total: 12000, emotion: '기쁨' } }
    rawData.forEach(d => {
      const date = toKSTDateOnly(d.date);
      if (!dailyMap[date]) {
        dailyMap[date] = { total: 0, emotion: d.emotion };
      }
      dailyMap[date].total += Number(d.total);

      // 대표 감정을 나중에 더 고도화하려면 여기에 조건 추가 가능
    });

    const dates = Object.keys(dailyMap).sort();
    const totals = dates.map(date => dailyMap[date].total);
    const emotions = dates.map(date => dailyMap[date].emotion);

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '일별 총 지출',
          data: totals,
          fill: false,
          borderColor: '#83A2DB',
          tension: 0.3
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const index = ctx.dataIndex;
                const emotion = emotions[index];
                const amount = totals[index];
                const date = dates[index];
                return [
                  `날짜: ${date}`,
                  `감정: ${emotion}`,
                  `지출: ₩${amount.toLocaleString()}`
                ];
              }
            }
          },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) {
    console.error("daily chart error:", err);
  }
}


  async function drawCategoryChart(ctx) {
    try {
      const res = await fetch("http://localhost:3000/api/graph/category", {
        headers: { Authorization: `Bearer ${user_token}` }
      });
      const data = await res.json();

      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.category),
          datasets: [{
            label: '카테고리별 지출',
            data: data.map(d => d.total),
            backgroundColor: '#83A2DB',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    } catch (err) {
      console.error("category chart error:", err);
    }
  }
}
async function perEmotion(ctx) {
  try {
    const res = await fetch("http://localhost:3000/api/graph/daily", {
      headers: { Authorization: `Bearer ${user_token}` }
    });
    const rawData = await res.json();

    // KST 보정 + 날짜별 감정별 그룹화
    function toKSTDateOnly(dateStr) {
      const utc = new Date(dateStr);
      const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
      return kst.toISOString().slice(0, 10);
    }

    // 날짜별 감정별 지출 구조로 만들기
    const grouped = {}; // { '2025-06-03': { 기쁨: 12000, 슬픔: 3000 } }
    rawData.forEach(d => {
      const date = toKSTDateOnly(d.date);
      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][d.emotion]) grouped[date][d.emotion] = 0;
      grouped[date][d.emotion] += Number(d.total);
    });

    // 각 감정별로 dataset 구성
    const emotions = ['기쁨', '슬픔', '분노', '불안', '중립'];
    const labels = Object.keys(grouped).sort();
    const datasets = emotions.map(emotion => ({
      label: emotion,
      data: labels.map(date => grouped[date][emotion] || 0),
      fill: false,
      tension: 0.3
    }));

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title: (ctx) => `날짜: ${ctx[0].label}`,
              label: (ctx) => {
                const emotion = ctx.dataset.label;
                const value = ctx.raw;
                return `감정: ${emotion}, 지출: ₩${value.toLocaleString()}`;
              }
            }
          },
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) {
    console.error("daily chart error:", err);
  }
}


  window.showCalendar = function showCalendar()  {
  document.getElementById("main").innerHTML = `
    <div id='calendar-container'>
      <div id='calendar'></div>
    </div>
  `;

  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ko',
    height: 'auto',
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    events: function(fetchInfo, successCallback, failureCallback) {
      // fetchInfo.startStr, fetchInfo.endStr 에 현재 달력에 보이는 시작, 끝 날짜(YYYY-MM-DD)
      fetch(`http://localhost:3000/api/receipts/usage/range?userId=${user_id}&start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`, {
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        // 서버에서 받은 데이터 [{date, emotion, amount}, ...]을
        // FullCalendar 이벤트 포맷으로 변환
        const events = data.map(item => ({
          start: item.date,
          extendedProps: {
            emotion: item.emotion,
            amount: item.amount
          }
        }));
        successCallback(events);
      })
      .catch(err => {
        console.error('이벤트 로드 실패:', err);
        failureCallback(err);
      });
    },
    eventContent: function (arg) {
      const emotionMap = {
        '기쁨': '😄',
        '중립': '😐',
        '불안': '🥶',
        '슬픔': '😭',
        '분노': '😡'
      };
      const emotion = arg.event.extendedProps.emotion || '';
      const emoji = emotionMap[emotion] || '❓';
      const amount = arg.event.extendedProps.amount || 0;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div style="font-size:35px;">${emoji}</div>
        <div style="font-size:12px; color:#444;">₩${amount.toLocaleString()}</div>
      `;
      return { domNodes: [wrapper] };
    },
    eventDidMount: function (info) {
      info.el.style.backgroundColor = 'transparent';
      info.el.style.border = 'none';
      info.el.style.textAlign = 'center';
    }
  });

  calendar.render();
  
}


      let scene, camera, renderer, model,controls;
    





    function init3D() {
      const canvas = document.getElementById('threeCanvas');
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.5,80);  // 멀리서 보기

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);  // 투명 배경

      // 조명
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(ambientLight, directionalLight);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.target.set(0, 0, 0);  // 모델 중심
      controls.update();


      // 리사이즈 대응
      window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });

      animate(); // 애니메이션 시작
    }



    // }

    function animate() {
      requestAnimationFrame(animate);
      // if (model) model.rotation.y += 0.005;  // 천천히 회전
      if (controls) controls.update();  // 마우스 회전 적용

      renderer.render(scene, camera);
    }





