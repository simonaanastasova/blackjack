var deck = shuffle(newDeck()); // Генерира и разбърква тестето
/* Пример за генериран масив(списък) с обекти на разбъркано тесте [
  { point: 9, suit: 'diamonds' },
  { point: 1, suit: 'spades' },
  { point: 5, suit: 'clubs' },
  { point: 10, suit: 'hearts' },
  { point: 2, suit: 'diamonds' },
  { point: 6, suit: 'clubs' },
  { point: 3, suit: 'hearts' },
  { point: 9, suit: 'spades' }
];*/

// Масив в който се пазят текущите ръце на дилъра и на играча
var dealerHand = [];
var playerHand = [];

// Взима последната карта от даден списък с карти и я добавя на игралното поле на дадения играч
function dealCard(deck, hand, element, holecard) {
  card = deck.pop(); // Взима последната карта от тестето
  hand.push(card); // Добавя взетата карта в изиграните карти от играча
  var cardHTML;
  // Генерира картинката за картата която е изтеглена
  if (holecard) {
    cardHTML = '<img class="card animated slideInLeft hole" src="images/back_of_card.jpeg" alt="' + getCardImageUrl(card) + '"/>';
  } else {
    cardHTML = '<img class="card animated slideInLeft" src="' + getCardImageUrl(card) + '"/>';
  }

  // Добавя картата на игралното поле (като html елемент)
  $(element).append(cardHTML);
};

// Връща броя точки спрямо списък от изиграни карти
function calculatePoints(hand) {
  hand.slice(0);
  function compare(card1, card2) {
    return card2.point - card1.point;
  }
  hand.sort(compare);
  var points = 0;
  for(var i = 0; i < hand.length; i++) {
    var card = hand[i];
    if (card.point > 10) {
      points = points + 10;
    } else if (card.point === 1) {
      if (points + 11 <= 21) {
        points = points + 11;
      } else {
        points = points + 1;
      }
    } else {
      points = points + card.point;
    }
  }
  return points;
};

// Калкулира натрупаните точки и обновява резултата на масата за Играча
function displayPlayerPoints() {
  var playerPoints = calculatePoints(playerHand);
  $('#player-points').text(playerPoints);
};

// Калкулира натрупаните точки и обновява резултата на масата за Дилъра
function displayDealerPoints() {
  var dealerPoints = calculatePoints(dealerHand);
  $('#dealer-points').text(dealerPoints);
};

// Проверява резултата дали печелиш или губиш
function checkForBusts() {
  var playerPoints = calculatePoints(playerHand);
  if (playerPoints > 21) {
    $('#messages').text("You busted. Better luck next time!");
    $(".card.hole").attr("src", getCardImageUrl(dealerHand[0]));
    var currentPlayerMoney = Number($('#player-money').text());
    var totalBet = 500 - currentPlayerMoney;
    $('#player-money').text(currentPlayerMoney - totalBet);
    return true;
  }
  var dealerPoints = calculatePoints(dealerHand);
  if (dealerPoints > 21) {
    $('#messages').text("Dealer busted. You won!");
    $(".card.hole").attr("src", getCardImageUrl(dealerHand[0]));
    var currentPlayerMoney = Number($('#player-money').text());
    var totalBet = 500 - currentPlayerMoney;
    $('#player-money').text(currentPlayerMoney + totalBet + totalBet);
    return true;
  }
  return false;
};

// Играта започва наново
function resetGame() {
  deck = shuffle(newDeck());
  dealerHand = [];
  playerHand = [];
  $('#player-points').text('');
  $('#dealer-points').text('');
  $('#messages').text('');
  $('#player-hand').html('');
  $('#dealer-hand').html('');
  $('#hit-button').prop('disabled', false);
  $('#stand-button').prop('disabled', false);
}

// Връща адрес до снимката спрямо типа на картата
function getCardImageUrl(card) {
  var cardName;
  if(card.point === 1) {
    cardName = 'ace';
  } else if(card.point === 11) {
    cardName = 'jack';
  } else if (card.point === 12) {
    cardName = 'queen';
  } else if (card.point === 13) {
    cardName = 'king';
  } else {
    cardName = card.point;
  }
  var result = 'images/' + cardName + '_of_' + card.suit + '.png';
  return result;
};

// Тази функция генерира тестето, което не е разбъркано
function newDeck() {
  var deck = [];
  var suits = ['spades', 'hearts', 'clubs', 'diamonds'];
  for (var point = 1; point <= 13; point++) {
    for (var i = 0; i < suits.length; i++) {
      var suit = suits[i];
      deck.push({point: point, suit: suit});
    }
  }
  return deck;
};

// Тази функция разбърква генерираното тесте, за да не се повтаря играта всеки път
function shuffle(cards) {
  var newCards = [];
  while (cards.length > 0) {
    var idx = Math.floor(Math.random() * cards.length);
    newCards.push(cards[idx]);
    cards.splice(idx, 1);
  }
  return newCards;
}

// Подготвя цялата игра
  $(function() {
    // Закача действието на бутона за ново раздаване
    $('#deal-button').click(function() {
      var card;
      resetGame();
      dealCard(deck, playerHand, '#player-hand');
      dealCard(deck, dealerHand, '#dealer-hand', true);
      dealCard(deck, playerHand, '#player-hand');
      dealCard(deck, dealerHand, '#dealer-hand');
      displayPlayerPoints();
      checkForBusts();

    });

    //Закача действието за теглене на нова карта за играча
    $('#hit-button').click(function() {
      dealCard(deck, playerHand, '#player-hand');
      displayPlayerPoints();
      checkForBusts();
    });
    //Закача действието за теглене на нови карти от дилъра
    $('#stand-button').click(function() {
      var dealerPoints = calculatePoints(dealerHand);
      while(dealerPoints < 17) {
        dealCard(deck, dealerHand, '#dealer-hand');
        dealerPoints = calculatePoints(dealerHand);
      }
      displayPlayerPoints();
      $(".card.hole").attr("src", getCardImageUrl(dealerHand[0]));
      displayDealerPoints();
      if (!checkForBusts()) {
        displayDealerPoints();
        //determine winner
        var playerPoints = calculatePoints(playerHand);
        var dealerPoints = calculatePoints(dealerHand);
        if (playerPoints > dealerPoints) {
          $('#messages').text('YOU WON!');
          $('#hit-button').prop('disabled', true);
          $('#stand-button').prop('disabled', true);
          //to give player table money
          var currentPlayerMoney = Number($('#player-money').text());
          var totalBet = 500 - currentPlayerMoney;
          $('#player-money').text(currentPlayerMoney + totalBet + totalBet);
        } else if (playerPoints === dealerPoints) {
          $('#messages').text('Push');
          $('#hit-button').prop('disabled', true);
          $('#stand-button').prop('disabled', true);
        } else {
          $('#messages').text('Sorry, You lose!');
          $('#hit-button').prop('disabled', true);
          $('#stand-button').prop('disabled', true);
        }
      }
    });

    // Закача действието на бутона за увеличаване със 100$ на залога
    $('#bet-button').click(function() {
      var currentPlayerMoney = Number($('#player-money').text());
      var total = currentPlayerMoney - 100;
      $('#player-money').text(total);
      var totalBet = 500 - Number($('#player-money').text());
      if (currentPlayerMoney <= 0) {
        alert('You are out of Money!! No, worries here is more');
        $('#player-money').text('500');
      }
    })
  });
