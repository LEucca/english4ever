const cardElement = document.getElementById("card");
const categories = document.querySelectorAll(".category");
const scoreElement = document.getElementById("score");

let score = 0;
let totalCards = 10;
let currentCardIndex = 0;
let currentCardData = null;
let isDragging = false;

// Base de données des cartes (10 par catégorie)
let cards = [
  // True
  { text: "Sing-Sang-Sung-Chanter", category: "true" },
  { text: "Build-Built-Built-Construire", category: "true" },
  { text: "Run-Ran-Run-Courir", category: "true" },
  { text: "Mean-Meant-Meant-Signifier", category: "true" },
  { text: "Swim-Swam-Swum-Nager", category: "true" },
  { text: "Buy-Bought-Bought-Acheter", category: "true" },
  { text: "Eat-Ate-Eaten-Manger", category: "true" },
  { text: "Keep-Kept-Kept-Garder", category: "true" },
  { text: "Show-Showed-Shown-Montrer", category: "true" },
  { text: "Speak-Spoke-Spoken-Parler", category: "true" },

  // False
  { text: "To be-was-been-être", category: "false" },
  { text: "Fell-Felt-Felen-se sentir", category: "false" },
  { text: "Give-Gave-Guve-Donner", category: "false" },
  { text: "Hear-Heard-Hearen-Entendre", category: "false" },
  { text: "Leave-Left-Leften-Partir/quitter/laisser", category: "false" },
  { text: "Steal-Stole-Stealen-Voler/dérober", category: "false" },
  { text: "Write-Wrote-Wrotten-Écrire", category: "false" },
  { text: "Throw-Threw-Throw-Jeter/lancer", category: "false" },
  { text: "Wear-Wore-Wore-Porter-un vêtement", category: "false" },
];

// Mise à jour de la carte
function updateCard() {
  if (currentCardIndex >= totalCards || cards.length === 0) return endGame();

  // Sélectionne une carte aléatoire
  const randomIndex = Math.floor(Math.random() * cards.length);
  currentCardData = cards[randomIndex];
  
  // Affiche la carte
  cardElement.textContent = currentCardData.text;
  cardElement.dataset.category = currentCardData.category;

  // Supprime la carte du tableau pour qu'elle n'apparaisse plus
  cards.splice(randomIndex, 1);

  // Réinitialisation de la carte et placement centré
  cardElement.style.top = "50%";
  cardElement.style.left = "50%";
  cardElement.style.transform = "translate(-50%, -50%)";
  cardElement.classList.remove("vibrate");

  // La carte est prête à être déplacée
  isDragging = false;
}

// Vibrations en cas d'erreur
function vibrateCard() {
  cardElement.classList.add("vibrate");
  setTimeout(() => {
    cardElement.classList.remove("vibrate");
  }, 300);
}

// Déposer la carte
function dropCard() {
  if (!isDragging) return;

  let validDrop = false;

  categories.forEach((category) => {
    const cardRect = cardElement.getBoundingClientRect();
    const categoryRect = category.getBoundingClientRect();

    if (
      cardRect.right > categoryRect.left &&
      cardRect.left < categoryRect.right &&
      cardRect.bottom > categoryRect.top &&
      cardRect.top < categoryRect.bottom
    ) {
      validDrop = true;
      if (category.id === currentCardData.category) {
        score++;
        scoreElement.textContent = score;
        category.classList.add("active");
        displayMessage("Correct !");
        setTimeout(() => category.classList.remove("active"), 300);

        // Vérifier si le score est de 10 et lancer les confettis
        if (score === 10) {
          lancerConfetti();
        }
      } else {
        vibrateCard();
        displayMessage("Incorrect !");
      }
    }
  });

  if (!validDrop) {
    vibrateCard();
    displayMessage("Incorrect !");
  }

  isDragging = false;
  currentCardIndex++;
  updateCard();
}

// Afficher un message temporaire
function displayMessage(text) {
  const message = document.createElement("div");
  message.textContent = text;
  message.style.position = "absolute";
  message.style.top = "10%";
  message.style.left = "50%";
  message.style.transform = "translateX(-50%)";
  message.style.padding = "10px 20px";
  message.style.backgroundColor = text === "Correct !" ? "#4CAF50" : "#F44336";
  message.style.color = "white";
  message.style.borderRadius = "5px";
  message.style.fontWeight = "bold";
  document.body.appendChild(message);

  setTimeout(() => {
    document.body.removeChild(message);
  }, 1000);
}

// Lancer les confettis
function lancerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Fonction pour afficher le bouton "Réessayer" à la fin de la partie
function endGame() {
  displayMessage(`Finished game! Scoring: ${score}/${totalCards}`);

  // Créer un élément de bouton "Réessayer"
  const retryButton = document.createElement("button");
  retryButton.classList.add("retry-button");
  retryButton.innerHTML = `<i class="retry-icon">&#8635;</i> Retry`;

  // Ajouter un événement pour recharger la page lorsque le bouton est cliqué
  retryButton.onclick = function() {
    window.location.reload();
  };

  // Ajouter le bouton à la fin du body ou à un conteneur spécifique
  document.body.appendChild(retryButton);
}

// Gestion des événements
cardElement.addEventListener("mousedown", () => {
  isDragging = true;
  cardElement.classList.add("dragging");
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    cardElement.style.left = `${e.pageX}px`;
    cardElement.style.top = `${e.pageY}px`;
  }
});

document.addEventListener("mouseup", () => {
  cardElement.classList.remove("dragging");
  dropCard();
});

// Appeler updateCard() dès le début pour afficher la première carte
window.onload = function() {
  updateCard();  // Met à jour la première carte au chargement de la page
};

// Fonction pour envoyer les logs au serveur à la fin du jeu
function logGameOver(score, totalCards) {
  const deviceInfo = navigator.userAgent;

  fetch('/game-over', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      score,
      totalCards,
      deviceInfo
    })
  }).then(response => {
    if (response.ok) {
      console.log('Log de fin de partie envoyé avec succès.');
    } else {
      console.error('Erreur lors de l\'envoi du log de fin de partie.');
    }
  });
}

// Fonction pour afficher le bouton "Réessayer" à la fin de la partie
function endGame() {
  displayMessage(`Finished game! Scoring: ${score}/${totalCards}`);

  // Log de fin de partie avec le score
  logGameOver(score, totalCards);

  // Créer un élément de bouton "Réessayer"
  const retryButton = document.createElement("button");
  retryButton.classList.add("retry-button");
  retryButton.innerHTML = `<i class="retry-icon">&#8635;</i> Retry`;

  // Ajouter un événement pour recharger la page lorsque le bouton est cliqué
  retryButton.onclick = function() {
    window.location.reload();
  };

  // Ajouter le bouton à la fin du body ou à un conteneur spécifique
  document.body.appendChild(retryButton);
}

// JS to hide/reveal the navbar on scroll
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    header.classList.add('hidden');  // Hide header on scroll down
  } else {
    header.classList.remove('hidden'); // Show header on scroll up
  }
  lastScrollY = window.scrollY;
});
