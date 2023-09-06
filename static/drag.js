$(function () {
    $('[data-toggle="tooltip"]').tooltip({
      delay: { "show": 1, "hide": 100 }
    })
  })      
  // dots dropdown menu ayar
  function toggleMenu(menuId) {
    var menu = document.getElementById(menuId);
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }    
  // container çoğaltma ve silme fonksiyonu
  function duplicateContainer() {
      var mainContainer = document.getElementById('main-container');
      var originalContainer = document.querySelector('.container');
      var clonedContainer = originalContainer.cloneNode(true);
      
      var clonedDropdownMenu = clonedContainer.querySelector('.dropdown-menu');
      if (clonedDropdownMenu) {
          clonedDropdownMenu.style.display = 'none';
      }
  
      mainContainer.appendChild(clonedContainer);
      closeDropdownMenu();
  }
  
  function removeContainer() {
      var mainContainer = document.getElementById('main-container');
      var containers = mainContainer.querySelectorAll('.container');
      if (containers.length > 1) { 
          mainContainer.removeChild(containers[containers.length - 1]);
      }
      closeDropdownMenu();
  }
  
  function closeDropdownMenu() {
      var dropdownMenu = document.getElementById('dropdown-menu-1');
      if (dropdownMenu) {
          dropdownMenu.style.display = 'none';
      }
  }





//radio input ayarları
document.addEventListener('DOMContentLoaded', function() {
    const radios = document.querySelectorAll('input[name="details"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Tüm bölümleri gizlememiz lazım
            document.getElementById('cookingTime').style.display = 'none';
            document.getElementById('portion').style.display = 'none';
            document.getElementById('materials').style.display = 'none';
            document.getElementById('difficultyLevel').style.display = 'none';
            document.getElementById('notesArea').style.display = 'none';

            // seçilen radyo düğmesine göre ilgili bölümü gösterelim
            switch (this.value) {
                case 'ingredients1':
                    document.getElementById('cookingTime').style.display = 'block';
                    document.getElementById('portion').style.display = 'block'; 
                    document.getElementById('materials').style.display = 'block'; 
                    break;
                case 'ingredients2':
                    document.getElementById('difficultyLevel').style.display = 'block';
                    document.getElementById('materials').style.display = 'block'; 
                    break;
                case 'notes':
                    document.getElementById('notesArea').style.display = 'block';
                    break;
            }
        });
    });
});


// daha fazla seçenek ayarları 
function toggleOptions() {
    const content = document.getElementById("optionsContent");
    const arrow = document.querySelector(".arrow-icon");
    if (content.style.display === "none") {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    } else {
        content.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
    }
}

// Medyanın sunucuya gönderilmesi işlemi
function uploadIdeaPinMedia(file) {
    let formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'idea_pin'); 
    
    fetch('/board/upload_media/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.file_url) {
            let hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'image_url';
            hiddenInput.value = data.file_url;
            document.querySelector('form').appendChild(hiddenInput);
            
            // Yüklenen medyanın ekran üzerinde gösterilmesi
            displayUploadedMedia(data.file_url);

            window.location.href = `/board/drag/?mediaUrl=${data.file_url}`;
            sessionStorage.setItem('last_uploaded_media_url', data.file_url);
            
        } else {
            console.error("Bir hata oluştu. Sunucu yanıtı:", data);
        }
    });
}

function displayUploadedMedia(mediaUrl) {
    const mediaDisplay = document.getElementById('mediaDisplay');
    if (mediaDisplay) {
        // Önceki medya öğelerini temizlemeliyiz
        while (mediaDisplay.firstChild) {
            mediaDisplay.removeChild(mediaDisplay.firstChild);
        }

        if (mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.png') || mediaUrl.endsWith('.jpeg')) {
            const img = document.createElement('img');
            img.src = mediaUrl;
            mediaDisplay.appendChild(img);
        } else if (mediaUrl.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            mediaDisplay.appendChild(video);
        }
    } else {
        console.error("mediaDisplay elementi bulunamadı!");
    }
}



document.addEventListener('DOMContentLoaded', function() {

    // mediaurl i tanıt
    const mediaUrl = new URLSearchParams(window.location.search).get('mediaUrl');
    if (mediaUrl) {
        // Formdaki varolan hidden input'u bulun veya yeni bir tane oluşturun
        let hiddenInput = document.getElementById('mediaUrl');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'image_url';
            hiddenInput.id = 'mediaUrl';
            document.querySelector('form').appendChild(hiddenInput);
        }
        // Hidden input'un değerini ayarla
        hiddenInput.value = mediaUrl;

        // media display i dolduralım
    }
    const mediaDisplay = document.getElementById('mediaDisplay');
    if (mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.jpeg') || mediaUrl.endsWith('.png')) {
        const img = document.createElement('img');
        img.src = mediaUrl;
            mediaDisplay.appendChild(img);
        } else if (mediaUrl.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            mediaDisplay.appendChild(video);
        }
    });




// Pini panoya kaydetme
function savePinToBoard(pinId, boardId) {
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
    let selectedBoardInput = document.getElementById('selectedBoardInput');
    selectedBoardInput.value = boardId;
    fetch('/board/save_to_board/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
        },
        body: `pin_id=${pinId}&board_id=${boardId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Pin başarıyla panoya kaydedildi!');
        } else {
            alert('Bir hata oluştu.');
        }
    });
}


// Pano ayarları
let savePanel;
   
document.addEventListener("DOMContentLoaded", function() {
    function addPanoClickListener(pano) {
        pano.addEventListener('click', function(event) {
            if (event.target.classList.contains('delete-board-btn')) return;
    
            let selectedBoardName = pano.textContent.trim().replace('Sil', '');
            let selectedBoardButton = document.querySelector('.pano');
            selectedBoardButton.textContent = selectedBoardName;
    
            let pinId = document.getElementById("pinId").value;
            let boardId = pano.getAttribute('data-board-id');
            savePinToBoard(pinId, boardId);
            
            savePanel.style.display = "none";
        });
    }

    function addDeleteButton(pano) {
        const deleteButton = pano.querySelector('.delete-board-btn');
        deleteButton.addEventListener('click', function() {
            pano.remove();
        });
    }

    const saveButton = document.querySelector('.pano');
    savePanel = document.querySelector('.save-panel');

    saveButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (savePanel.style.display === "none") {
            savePanel.style.display = "block";
        } else {
            savePanel.style.display = "none";
        }
    });

    const createPanoButton = document.querySelector('.create-pano-btn');
    createPanoButton.addEventListener('click', function(event) {
        event.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('createPanoModal'));
        modal.show();
    });


    let submitPanoButton = document.getElementById('savePano');
    let panoNameInput = document.getElementById('panoName');
    submitPanoButton.addEventListener('click', function() {
        const panoName = panoNameInput.value;
        if (panoName) {
            const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
            fetch('/board/create_board/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken
                },
                body: `board_name=${panoName}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const panoElement = document.createElement('div');
                    panoElement.classList.add('pano-name');
                    panoElement.textContent = panoName;
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Sil';
                    deleteBtn.classList.add('delete-board-btn');
                    panoElement.appendChild(deleteBtn);
                    
                    const panoList = document.querySelector('.pano-list');
                    panoList.appendChild(panoElement);
                    addPanoClickListener(panoElement);
                    addDeleteButton(panoElement);
                    
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createPanoModal'));
                    modal.hide();
                    panoNameInput.value = "";
                } else {
                    alert(data.message);
                }
            });
        } else {
            alert('Pano ismi boş olamaz!');
        }
    });

    // Mevcut panolara tıklanma olayını ve silme butonu ekleme işlemi
    const existingPanos = document.querySelectorAll('.pano-name');
    existingPanos.forEach(pano => {
        addPanoClickListener(pano);
        addDeleteButton(pano);
    });
});
