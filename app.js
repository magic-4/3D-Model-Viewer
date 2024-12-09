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

    reader.readAsArrayBuffer(file);
}
