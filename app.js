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
