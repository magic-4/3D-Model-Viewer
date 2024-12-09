// 전역 변수
const categories = {}; // 카테고리별 파일 저장
let viewer; // Three.js 렌더러

// 카테고리 추가
function addCategory() {
    const categoryInput = document.getElementById("newCategory");
    const categoryName = categoryInput.value.trim();

    if (categoryName === "") {
        alert("Category name cannot be empty!");
        return;
    }

    if (categories[categoryName]) {
        alert("Category already exists!");
        return;
    }

    // 카테고리 추가
    categories[categoryName] = [];
    updateCategoryList();
    updateCategorySelect();

    categoryInput.value = ""; // 입력 초기화
}

// 카테고리 리스트 업데이트
function updateCategoryList() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    Object.keys(categories).forEach(category => {
        const li = document.createElement("li");
        li.textContent = category;
        li.onclick = () => showFilesInCategory(category);
        categoryList.appendChild(li);
    });
}

// 카테고리 선택 드롭다운 업데이트
function updateCategorySelect() {
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = "<option value='' disabled selected>Select a category</option>";

    Object.keys(categories).forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 파일 업로드
function uploadFile() {
    const fileInput = document.getElementById("fileUpload");
    const categorySelect = document.getElementById("categorySelect");
    const file = fileInput.files[0];
    const selectedCategory = categorySelect.value;

    if (!file || !selectedCategory) {
        alert("Please select a file and a category!");
        return;
    }

    if (!file.name.endsWith(".stl")) {
        alert("Only STL files are supported!");
        return;
    }

    // 파일 저장
    categories[selectedCategory].push(file);
    fileInput.value = ""; // 파일 선택 초기화
    alert(`File uploaded to category: ${selectedCategory}`);
}

// 카테고리의 파일 표시
function showFilesInCategory(category) {
    const files = categories[category];
    const fileList = document.getElementById("viewer");
    fileList.innerHTML = `<h3>Files in Category: ${category}</h3>`;

    files.forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.name;
        li.onclick = () => renderSTL(file);
        fileList.appendChild(li);
    });
}

// STL 렌더링
function renderSTL(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const arrayBuffer = event.target.result;

        // Three.js 설정
        const scene = new THREE.Scene();

        // 배경색 설정 (밝은 회색)
        scene.background = new THREE.Color(0xf0f0f0);

        // 카메라 설정
        const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
        camera.position.set(0, 0, 200); // 카메라 위치 조정

        // 렌더러 설정
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(600, 400);

        // 기존 뷰어 초기화
        const viewer = document.getElementById('viewer');
        while (viewer.firstChild) {
            viewer.removeChild(viewer.firstChild);
        }
        viewer.appendChild(renderer.domElement);

        // STLLoader 사용
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(arrayBuffer);

        // 모델 크기 확인 및 조정
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const sizeX = boundingBox.max.x - boundingBox.min.x;
        const sizeY = boundingBox.max.y - boundingBox.min.y;
        const sizeZ = boundingBox.max.z - boundingBox.min.z;
        const maxSize = Math.max(sizeX, sizeY, sizeZ);

        const scale = 100 / maxSize; // 모델 크기를 100 단위로 조정
        geometry.scale(scale, scale, scale);

        // 모델 중심 이동
        const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
        const centerY = (boundingBox.max.y + boundingBox.min.y) / 2;
        const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;
        geometry.translate(-centerX, -centerY, -centerZ);

        // 재질(Material) 설정
        const material = new THREE.MeshPhongMaterial({ color: 0x5555ff, specular: 0x555555, shininess: 50 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // 조명 추가
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // 부드러운 주변광
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 방향성 조명
        directionalLight.position.set(0, 100, 100).normalize();
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 500);
        pointLight.position.set(50, 50, 50);
        scene.add(pointLight);

        // 애니메이션
        const animate = function () {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();
    };

    // 사용자 데이터 관리
const users = {
    admin: { password: "admin123", role: "admin", categories: [] }, // 관리자는 모든 카테고리에 접근 가능
    user1: { password: "user123", role: "user", categories: ["Category1", "Category2"] }, // 예제 사용자
};

let currentUser = null; // 현재 로그인한 사용자

// 로그인 함수
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (users[username] && users[username].password === password) {
        currentUser = { username, ...users[username] };
        alert(`Welcome, ${username}!`);
        updateUI();
    } else {
        alert("Invalid username or password!");
    }
}

// 로그아웃 함수
function logout() {
    currentUser = null;
    alert("Logged out successfully.");
    updateUI();
}

// UI 업데이트
function updateUI() {
    const loginSection = document.getElementById("loginSection");
    const logoutSection = document.getElementById("logoutSection");
    const categoryList = document.getElementById("categoryList");

    if (currentUser) {
        loginSection.style.display = "none";
        logoutSection.style.display = "block";
        document.getElementById("currentUser").textContent = currentUser.username;

        // 카테고리 표시
        categoryList.innerHTML = "";

        const accessibleCategories =
            currentUser.role === "admin"
                ? Object.keys(categories) // 관리자는 모든 카테고리
                : currentUser.categories; // 사용자는 할당된 카테고리만

        accessibleCategories.forEach(category => {
            const li = document.createElement("li");
            li.textContent = category;
            li.onclick = () => showFilesInCategory(category);
            categoryList.appendChild(li);
        });
    } else {
        loginSection.style.display = "block";
        logoutSection.style.display = "none";
        categoryList.innerHTML = ""; // 카테고리 숨기기
    }
}
// 전역 변수
let isLoggedIn = false;
let isAdmin = false;
const categories = {}; // 카테고리별 파일 저장
let viewer; // Three.js 렌더러

// 로그인 기능
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // 간단한 예시: 관리자 계정 (username: admin, password: admin123)
    if (username === "admin" && password === "admin123") {
        isLoggedIn = true;
        isAdmin = true;
        document.getElementById("loginPage").style.display = "none";
        alert("Admin logged in.");
        updateCategoryList();
    } else if (username === "user" && password === "user123") {
        isLoggedIn = true;
        isAdmin = false;
        document.getElementById("loginPage").style.display = "none";
        alert("User logged in.");
        updateCategoryList();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

// 카테고리 추가 (관리자만 가능)
function addCategory() {
    if (!isLoggedIn) {
        alert("Please log in first!");
        return;
    }

    if (!isAdmin) {
        alert("Only admin can add categories.");
        return;
    }

    const categoryInput = document.getElementById("newCategory");
    const categoryName = categoryInput.value.trim();

    if (categoryName === "") {
        alert("Category name cannot be empty!");
        return;
    }

    if (categories[categoryName]) {
        alert("Category already exists!");
        return;
    }

    // 카테고리 추가
    categories[categoryName] = [];
    updateCategoryList();
    updateCategorySelect();

    categoryInput.value = ""; // 입력 초기화
}

// 카테고리 리스트 업데이트 (관리자 또는 사용자 권한에 맞게 표시)
function updateCategoryList() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    if (isLoggedIn) {
        const categoriesToShow = isAdmin ? categories : getUserCategories();
        
        Object.keys(categoriesToShow).forEach(category => {
            const li = document.createElement("li");
            li.textContent = category;
            li.onclick = () => showFilesInCategory(category);
            categoryList.appendChild(li);
        });
    } else {
        alert("Please log in first!");
    }
}

// 관리자가 지정한 카테고리만 사용자에게 표시
function getUserCategories() {
    // 예를 들어, 관리자가 "user" 계정에 대한 카테고리를 지정
    return {
        "Category1": categories["Category1"],
        "Category2": categories["Category2"]
    };
}

// 파일 업로드
function uploadFile() {
    const fileInput = document.getElementById("fileUpload");
    const categorySelect = document.getElementById("categorySelect");
    const file = fileInput.files[0];
    const selectedCategory = categorySelect.value;

    if (!file || !selectedCategory) {
        alert("Please select a file and a category!");
        return;
    }

    if (!file.name.endsWith(".stl")) {
        alert("Only STL files are supported!");
        return;
    }

    // 파일 저장
    categories[selectedCategory].push(file);
    fileInput.value = ""; // 파일 선택 초기화
    alert(`File uploaded to category: ${selectedCategory}`);
}

// 카테고리의 파일 표시
function showFilesInCategory(category) {
    const files = categories[category];
    const fileList = document.getElementById("viewer");
    fileList.innerHTML = `<h3>Files in Category: ${category}</h3>`;

    files.forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.name;
        li.onclick = () => renderSTL(file);
        fileList.appendChild(li);
    });
}


    reader.readAsArrayBuffer(file);
}
