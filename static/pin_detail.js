$(function () {
    $('[data-toggle="tooltip"]').tooltip({
      delay: { "show": 1, "hide": 100 }
    })
  })

  function submitForm(form) {
    form.submit();
    return false;  // normal form gönderimini engelledik
}

// reaksiyon paneli ayarları
$(document).ready(function(){
  $(".btn-xl").hover(function(){
      $(".reaction-panel").show();
  }, function(){
      setTimeout(function(){
          if (!$(".reaction-panel:hover").length) {
              $(".reaction-panel").hide();
          }
      }, 100);
  });

  $(".reaction-panel").hover(null, function(){
      $(this).hide();
  });
});

//popovers ayarları
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl, {
      html: true,
      trigger: 'hover', 
      container: 'body',  
  });
});


//beğenme butonu ayarları 
$(document).ready(function() {
let originalButtonContent = $(".btn-xl").html();
let isButtonClicked = false;

$(".btn-xl").click(function() {
    if (isButtonClicked) {
        let pinId = $(".btn-xl").data('pin-id');
        let apiUrl = '/board/add_reaction/' + pinId + '/';

        $.post(apiUrl, {remove: true}, function(response) {
            if (response.status === "success") {
                let newReactionCount = response.new_reaction_count;
                $(".badge").text(newReactionCount);
                $(".selected-reactions").empty();
                isButtonClicked = false;
                $(".btn-xl").html(originalButtonContent);
            }
        });
    }
});

$(".reaction-panel button, .emoji-btn").click(function(event) {
    event.stopPropagation();  // Diğer event'lerin tetiklenmesini engelliyoruz

    if (isButtonClicked && $(this).find("lottie-player").attr("src") === $(".btn-xl lottie-player").attr("src")) {
        $(".btn-xl").html(originalButtonContent);
        isButtonClicked = false;
        return;
    }

    let reactionType = $(this).find("lottie-player").attr("src");

    let newButton = $(this).clone();
    newButton.removeAttr("data-bs-toggle");
    newButton.removeAttr("data-bs-placement");
    newButton.removeAttr("data-bs-original-title");
    newButton.removeAttr("data-trigger");

    newButton.find("lottie-player").css({
        "width": "45px",
        "height": "45px",
        "margin-top": "-7px",
        "margin-left": "-10px",
        "display": "block"
    });

    $(".btn-xl").html(newButton.html());
    $(".reaction-panel").hide();

    let selectedContent = $(this).html();
    $(".selected-reaction").append($(selectedContent).clone().css("margin-right", "5px"));

    let selectedEmojiUrl = $(this).find("lottie-player").attr("src");
    let pinId = $(".btn-xl").data('pin-id');
    if (!pinId) {
        console.error("pinId değeri alınamıyor!");
        return;
    }

    let apiUrl = '/board/add_reaction/' + pinId + '/';

    console.log("API URL:", apiUrl);

    $.post(apiUrl, {emoji_url: selectedEmojiUrl}, function(response) {
        if (response.status === "success") {
            let newReactionCount = response.new_reaction_count;
            $(".badge").text(newReactionCount);

            // reaksiyonları güncelle
            let selectedReactionsDiv = $(".selected-reactions");
            selectedReactionsDiv.empty();  // Mevcut reaksiyonları temizle
    
            response.unique_reactions.forEach(function(reaction) {
                let lottieElement = document.createElement("lottie-player");
                lottieElement.setAttribute("src", reaction.emoji_url);
                lottieElement.setAttribute("background", "transparent");
                lottieElement.setAttribute("speed", "1");
                lottieElement.setAttribute("style", "width: 45px; height: 45px;");
                lottieElement.setAttribute("loop", "");
                lottieElement.setAttribute("autoplay", "");
    
                selectedReactionsDiv.append(lottieElement);
            });

            isButtonClicked = true;
        }
    });
});
});


//yorum yapma ayarları
$('.yorumYap form').submit(function(event) {
event.preventDefault();

let formData = $(this).serialize();
let actionURL = $(this).attr('action');

$.post(actionURL, formData)
.done(function(response) {
    if (response.status === "success") {
        let deleteLink = '';
        if (response.is_current_user) {
          deleteLink = `<a href="/board/delete_comment/${response.comment_id}/">Yorumu Sil</a>`;
        }
        let newCommentHTML = `
          <div class="d-flex align-items-start mt-2">
            <img src="${response.user_image}" alt="Commenter Avatar" class="rounded-circle" style="width: 40px; height: 40px;">
            <div class="ms-3">
                <strong>${response.username}</strong>
                <p>${response.comment_content}</p>
                <small class="text-muted">${response.comment_date}</small>
                ${deleteLink}
            </div>
          </div>`;
          console.log(newCommentHTML);

        
        // Eğer "Henüz yorum yok" mesajı varsa kaldır
        $(".no-comments-message").parent().remove();

        // "Yorumlar" başlığından hemen sonra yeni yorumu ekledik
        $("#comments-section h4").after(newCommentHTML);


        // Yorum yapma inputunu temizle
        $('.comment-input').val('');
    } else {
        alert(response.error_message);
        console.log(response.form_errors);
        alert(response.error_message || "Yorum eklenirken bir hata oluştu.");
    }
})
.fail(function(jqXHR, textStatus, errorThrown) {
  console.log("Request failed: " + textStatus);
  console.log(jqXHR.responseText);
});
});



// emoji butonunun ayarları
document.addEventListener('DOMContentLoaded', function() {
  const emojiButton = document.querySelector('.emoji-button');
  const emojiContainer = document.createElement('div');
  const commentInput = document.querySelector('.comment-input');

  emojiButton.addEventListener('click', function() {
      fetch('https://emoji-api.com/emojis?access_key=453f5559a8b010009449d63e77bef132add80dad')
          .then(response => response.json())
          .then(data => {
              emojiContainer.innerHTML = '';  // önceki emojileri temizle
              data.forEach(emoji => {
                  let emojiElem = document.createElement('span');
                  emojiElem.innerText = emoji.character;
                  emojiElem.style.cursor = 'pointer';
                  emojiElem.addEventListener('click', function() {
                      commentInput.value += emoji.character;  // emoji'yi inputa ekle
                  });
                  emojiContainer.appendChild(emojiElem);
              });
          });

      // Emoji penceresini göster veya gizle
      if (!emojiContainer.parentNode) {
          document.body.appendChild(emojiContainer);
          const rect = emojiButton.getBoundingClientRect();
          emojiContainer.style.position = 'absolute';
          emojiContainer.style.top = rect.top - 200 + 'px';
          emojiContainer.style.left = rect.left + 'px';
          emojiContainer.style.border = '1px solid #ccc';
          emojiContainer.style.background = '#fff';
          emojiContainer.style.width = '200px';
          emojiContainer.style.height = '200px';
          emojiContainer.style.overflowY = 'scroll';
      } else {
          emojiContainer.parentNode.removeChild(emojiContainer);
      }
  });

  // Diğer herhangi bir yere tıklanırsa emoji penceresini gizle
  document.body.addEventListener('click', function(e) {
      if (e.target !== emojiButton && !emojiContainer.contains(e.target) && emojiContainer.parentNode) {
          emojiContainer.parentNode.removeChild(emojiContainer);
      }
  });
});



//pano ayarları
let savePanel;

document.addEventListener("DOMContentLoaded", function() {
   function addPanoClickListener(pano) {
       pano.addEventListener('click', function(event) {
           if (event.target.classList.contains('delete-board-btn')) return;

           let selectedBoardName = pano.textContent.trim().replace('Sil', '');
           let selectedBoardButton = document.querySelector('.selected-board');
           selectedBoardButton.textContent = selectedBoardName;
           savePanel.style.display = "none";
       });
   }

   function addDeleteButton(pano) {
       const deleteButton = pano.querySelector('.delete-board-btn');
       deleteButton.addEventListener('click', function() {
           pano.remove();
       });
   }

   const saveButton = document.querySelector('.left button');
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
   createPanoButton.addEventListener('click', function() {
       const modal = new bootstrap.Modal(document.getElementById('createPanoModal'));
       modal.show();
   });

   let submitPanoButton = document.getElementById('submitPano');
   let panoNameInput = document.getElementById('panoNameInput');
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

   // Mevcut panolara tıklanma olayını ve silme butonu ekleme
   const existingPanos = document.querySelectorAll('.pano-name');
   existingPanos.forEach(pano => {
       addPanoClickListener(pano);
       addDeleteButton(pano);
   });
});


// Kaydet e  tıklandığında AJAX isteği gönderelim
$(".kaydet").click(function() {
event.preventDefault();
let boardId = $(".selected-board").siblings(".save-panel").find(".pano-name").attr("data-board-id");
console.log("AJAX İsteğinde Gönderilen Pano ID:", boardId);
let boardName = $(".selected-board").text().trim();
if (boardName === "Liste") {
    alert("Lütfen bir pano seçin!");
    return;
}

let pinId = $("#pinId").val(); 
console.log("AJAX İsteğinde Gönderilen Pin ID:", pinId);


let csrfToken = $("[name=csrfmiddlewaretoken]").val(); 

$.ajax({
    url: "/board/save_pin_to_board/",
    method: "POST",
    data: {
        'board_id': boardId,
        'pin_id': pinId,
        'csrfmiddlewaretoken': csrfToken 
    },
    success: function(response) {
        if (response.status === "success") {
            window.location.href = "/board/pin_detail/" + pinId + "/";
        } else {
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX Hatası:", textStatus, errorThrown);
        console.error("Hata :", jqXHR.responseText);
    }
});
});

//takip etme ayarları
$(document).ready(function() {
    $('.follow-btn').on('click', function() {
        let userId = $(this).attr('data-user-id');
        let isFollowing = $(this).text() === 'Takibi Bırak';
        let url = isFollowing ? `/user/unfollow/${userId}/` : `/user/follow/${userId}/`;

        $.ajax({
            url: url,
            type: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                if (response.status === 'followed') {
                    $('.follow-btn').text('Takibi Bırak');
                } else if (response.status === 'unfollowed') {
                    $('.follow-btn').text('Takip Et');
                }
            }
        });
    });
});

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

