// 데이터 저장소
let classes = [];

// 요일 이름
const days = ['월요일', '화요일', '수요일', '목요일', '금요일'];
const daysEn = ['mon', 'tue', 'wed', 'thu', 'fri'];

// 시간 목록
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadClasses();
    renderTimetable();
    updateSummary();
    
    // 폼 제출 이벤트
    document.getElementById('classForm').addEventListener('submit', addClass);
});

// 강의 추가
function addClass(e) {
    e.preventDefault();
    
    const className = document.getElementById('className').value;
    const classRoom = document.getElementById('classRoom').value;
    const classCredit = parseInt(document.getElementById('classCredit').value);
    const classDay = parseInt(document.getElementById('classDay').value);
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    // 시간 유효성 검사
    if (startTime >= endTime) {
        alert('시작 시간이 종료 시간보다 작아야 합니다.');
        return;
    }
    
    const newClass = {
        id: Date.now(),
        name: className,
        room: classRoom,
        credit: classCredit,
        day: classDay,
        startTime: startTime,
        endTime: endTime
    };
    
    classes.push(newClass);
    saveClasses();
    renderClassList();
    renderTimetable();
    updateSummary();
    
    // 폼 초기화
    document.getElementById('classForm').reset();
}

// 강의 제거
function removeClass(id) {
    classes = classes.filter(cls => cls.id !== id);
    saveClasses();
    renderClassList();
    renderTimetable();
    updateSummary();
}

// 강의 목록 렌더링
function renderClassList() {
    const classList = document.getElementById('classList');
    classList.innerHTML = '';
    
    if (classes.length === 0) {
        classList.innerHTML = '<p style="color: #FFB6D9; text-align: center;">아직 추가된 강의가 없어요!</p>';
        return;
    }
    
    classes.forEach(cls => {
        const classItem = document.createElement('div');
        classItem.className = 'class-item';
        classItem.innerHTML = `
            <div class="class-item-info">
                <div class="class-item-name">${cls.name}</div>
                <div class="class-item-details">
                    ${days[cls.day]} ${cls.startTime} ~ ${cls.endTime}<br>
                    ${cls.room} | ${cls.credit}학점
                </div>
            </div>
            <button class="remove-btn" onclick="removeClass(${cls.id})">❌</button>
        `;
        classList.appendChild(classItem);
    });
}

// 시간표 렌더링
function renderTimetable() {
    const timetable = document.getElementById('timetable');
    timetable.innerHTML = '';
    
    // 요일 헤더
    const emptyHeader = document.createElement('div');
    timetable.appendChild(emptyHeader);
    
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'timetable-header';
        header.textContent = day;
        timetable.appendChild(header);
    });
    
    // 시간별 셀
    times.forEach(time => {
        // 시간 레이블
        const timeLabel = document.createElement('div');
        timeLabel.className = 'timetable-time';
        timeLabel.textContent = time;
        timetable.appendChild(timeLabel);
        
        // 각 요일별 셀
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
            const cell = document.createElement('div');
            cell.className = 'timetable-cell';
            
            // 해당 시간, 요일의 강의 찾기
            const classInCell = classes.find(cls => {
                return cls.day === dayIndex && cls.startTime === time;
            });
            
            if (classInCell) {
                // 강의의 지속 시간 계산
                const startIdx = times.indexOf(classInCell.startTime);
                const endIdx = times.indexOf(classInCell.endTime);
                const duration = endIdx - startIdx;
                
                cell.style.gridRow = `span ${duration}`;
                cell.innerHTML = `
                    <div class="class-block">
                        <div class="class-block-name">${classInCell.name}</div>
                        <div class="class-block-info">${classInCell.startTime} ~ ${classInCell.endTime}</div>
                        <div class="class-block-info">${classInCell.room}</div>
                    </div>
                `;
            }
            
            timetable.appendChild(cell);
        }
    });
}

// 요약 정보 업데이트
function updateSummary() {
    // 총 학점
    const totalCredits = classes.reduce((sum, cls) => sum + cls.credit, 0);
    document.getElementById('totalCredits').textContent = `${totalCredits}학점`;
    
    // 수강 과목
    const totalClasses = classes.length;
    document.getElementById('totalClasses').textContent = `${totalClasses}과목`;
    
    // 이번 주 수업 (모든 강의의 총 시간)
    let weeklyHours = 0;
    classes.forEach(cls => {
        const startIdx = times.indexOf(cls.startTime);
        const endIdx = times.indexOf(cls.endTime);
        weeklyHours += (endIdx - startIdx);
    });
    document.getElementById('weeklyHours').textContent = `${weeklyHours}시간`;
}

// 로컬스토리지에 저장
function saveClasses() {
    localStorage.setItem('classes', JSON.stringify(classes));
}

// 로컬스토리지에서 불러오기
function loadClasses() {
    const saved = localStorage.getItem('classes');
    if (saved) {
        classes = JSON.parse(saved);
        renderClassList();
    }
}