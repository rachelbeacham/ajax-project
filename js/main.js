var $inputForm = document.querySelector('.city-input-form');
var $cityInput = document.querySelector('.city-input');
var $dataViews = document.querySelectorAll('.data-view');
var $optionList = document.querySelector('.option-list');
var $selectedBreweryName = document.querySelector('.selected-brewery-name');
var $selectedBreweryAddress = document.querySelector('.selected-brewery-address');
var $selectedBreweryWebsite = document.querySelector('.selected-brewery-website');
var $selectedBreweryPhone = document.querySelector('.selected-brewery-phone');
var $footerSearch = document.querySelector('.footer-search');
var $footerStar = document.querySelector('.footer-star');
var $favoritesButton = document.querySelector('.favorites-button');
var $reviewButton = document.querySelector('.review-button')
var $backButton = document.querySelector('.back-button');
var $headerName = document.querySelector('.header-name');
var $favoritesList = document.querySelector('.favorites-list');
var $reviewForm = document.querySelector('.review-form');
var $reviewerName = document.querySelector('#name');
var $reviewText = document.querySelector('#review');
var $reviewSection = document.querySelector('.review-section');
var $ratingStarsDiv = document.querySelector('.stars');
var $ratingStars = document.querySelectorAll('.rating-star');
var $rateExperience = document.querySelector('.rate-experience');
var $welcomeGreeting = document.querySelector('.welcome-greeting');
var $welcomeMessage = document.querySelector('.welcome-message');
var $emptyFavoritesMessage = document.querySelector('.empty-favorites-message')

$inputForm.addEventListener('submit', formSubmitted);

$reviewForm.addEventListener('submit', function (e){
  e.preventDefault();
  var newReview = {
    person: $reviewerName.value,
    reviewText: $reviewText.value,
    breweryReviewed: data.selected.name
  };
  data.reviews.push(newReview);
  data.view = 'brewery-details'
  viewSwapping(data);
  $reviewButton.textContent = 'Your review has been submitted!';
  $reviewButton.className = 'review-button added'
  $reviewForm.reset();
})

$optionList.addEventListener('click', optionSelected);

$favoritesList.addEventListener ('click', optionSelected);

$footerSearch.addEventListener('click', function() {
  data.view = 'welcome';
  data.brewArray = [];
  data.location = "";
  $optionList.innerHTML = '';
  viewSwapping(data);
});

$favoritesButton.addEventListener('click', function(){
  if ($favoritesButton.textContent === 'Add to favorites') {
    addToFavorites();
  } else {
    removeFromFavorites();
  }
});

$reviewButton.addEventListener('click', function(){
  data.view = 'review-form';
  viewSwapping(data);
})

$backButton.addEventListener('click', function() {
  if (data.location !== '') {
    data.view = 'brewery-options';
  } else {
    data.view = 'favorites';
  }
  viewSwapping(data)

});

window.addEventListener('beforeunload', function () {
  var favoritesJson = JSON.stringify(data.favorites);
  localStorage.setItem('favorites', favoritesJson);
  var reviewsJson = JSON.stringify(data.reviews);
  localStorage.setItem('reviews', reviewsJson);
  var ratingsJson = JSON.stringify(data.ratings);
  localStorage.setItem('ratings', ratingsJson);
});

document.addEventListener('DOMContentLoaded', function () {
  var favoritesData = localStorage.getItem('favorites');
  if (favoritesData !== null) {
    data.favorites = JSON.parse(favoritesData);
  }
  var reviewsData = localStorage.getItem('reviews');
  if (reviewsData !== null) {
    data.reviews = JSON.parse(reviewsData);
  }
  var ratingsData = localStorage.getItem('ratings');
  if (ratingsData !== null) {
    data.ratings = JSON.parse(ratingsData);
  }
});

$footerStar.addEventListener('click', function(){
  data.view = 'favorites';
  viewSwapping(data);
})

$ratingStarsDiv.addEventListener('click', starClicked)

function starClicked(e) {
  if (e.target.tagName === 'I') {
    var starSelected = e.target.getAttribute('star');
    var newRating = {}
    newRating.breweryRated = data.selected.name
    newRating.rating = starSelected
    data.ratings.push(newRating);
    updateRatingStars();
    }
  }

function updateRatingStars() {
  for (var j = 0; j < data.ratings.length; j++) {
    if (data.ratings[j].breweryRated === data.selected.name) {
      var current = data.ratings[j];
      $rateExperience.textContent = 'Thank you for rating!'
      for (var i = 0; i < $ratingStars.length; i++) {
        if ($ratingStars[i].getAttribute('star') <= current.rating) {
        $ratingStars[i].className = 'fas fa-star rating-star star-red';
        } else {
          $ratingStars[i].className = 'fas fa-star rating-star star-gray';
        }
      }
      break;
    }
    else {
      $rateExperience.textContent = 'Please rate your experience!'
      for (var k = 0; k < $ratingStars.length; k++) {
      $ratingStars[k].className = 'fas fa-star rating-star star-gray';
      }
    }
  }
}


function formSubmitted(e) {
  e.preventDefault();
  data.location = $cityInput.value
  var xhr = new XMLHttpRequest();
  $inputForm.reset();
  xhr.open('GET', 'https://api.openbrewerydb.org/breweries?by_city=' + data.location, true);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.brewArray = xhr.response;
    if (data.brewArray.length == 0) {
      data.view = 'welcome';
      viewSwapping(data);
      $welcomeGreeting.textContent = 'Uh-Oh!'
      $welcomeMessage.textContent = 'It looks like we were unable to find any results, please try again.'
    } else {
    for (var i = 0; i < data.brewArray.length; i++) {
      if (data.brewArray[i].street !== '' && data.brewArray[i].phone !== '' && data.brewArray[i].website_url !== '' && data.brewArray[i].name !== '') {
      $optionList.appendChild(renderOptions(data.brewArray[i]))
      }
    }
    data.view = 'brewery-options';
    viewSwapping(data);
    }
  });
  xhr.addEventListener('error', function(){
    $welcomeGreeting.textContent = 'Uh-Oh!'
    $welcomeMessage.textContent = 'It looks like we were unable to find any results, please try again.'
  });
  xhr.onprogress = loading();
  xhr.send();
}

function loading () {
  $welcomeGreeting.textContent = 'Loading...'
  $welcomeMessage.textContent = '';
  $inputForm.reset();
}

function optionSelected(e) {
  $reviewSection.innerHTML = '';
  $favoritesButton.textContent = 'Add to favorites';
  $favoritesButton.className = 'favorites-button';
  $reviewButton.textContent = 'Write a review';
  $reviewButton.className = 'review-button';
  $ratingStars.className = 'fas fa-star rating-star';
  if (e.target.className === 'brewName') {
  data.view = 'brewery-details';
  data.selected.name = e.target.textContent
  for (var i = 0; i < data.brewArray.length; i++) {
    if (data.brewArray[i].name === data.selected.name) {
      $selectedBreweryName.textContent = data.brewArray[i].name;
      $selectedBreweryAddress.textContent = data.brewArray[i].street + ', ' + data.brewArray[i].city + ', ' + data.brewArray[i].state + ' ' + data.brewArray[i].postal_code;
      $selectedBreweryWebsite.textContent = data.brewArray[i].website_url;
      $selectedBreweryWebsite.setAttribute("href", data.brewArray[i].website_url);
      $selectedBreweryPhone.textContent = 'Phone number: ' + data.brewArray[i].phone;
      $selectedBreweryPhone.setAttribute("href", "tel:" + data.brewArray[i].phone);
    }
  }
  for (var j = 0; j < data.favorites.length; j++) {
    if (data.favorites[j].name === data.selected.name) {
      data.selected.favorited = true;
      $favoritesButton.textContent = 'Remove from favorites';
      $favoritesButton.className = 'favorites-button added';
      $selectedBreweryName.textContent = data.favorites[j].name;
      $selectedBreweryAddress.textContent = data.favorites[j].address;
      $selectedBreweryWebsite.textContent = data.favorites[j].website;
      $selectedBreweryPhone.textContent = data.favorites[j].phone;
    } else {
      data.selected.favorited = false;
    }
  }
  for (var k = 0; k < data.reviews.length; k++) {
    if (data.selected.name === data.reviews[k].breweryReviewed) {
      var $reviewLabelBox = document.createElement('div');
      $reviewLabelBox.className = 'align-left';

      var $reviewLabel = document.createElement('h2');
      $reviewLabel.className = 'gray-text';
      $reviewLabel.textContent = "Review you sent to this brewery:";

      $reviewLabelBox.appendChild($reviewLabel);
      $reviewSection.appendChild($reviewLabelBox);
      $reviewSection.appendChild(renderReviews(data.reviews[k]))
    }
  }
  viewSwapping(data);
  updateRatingStars();
  }
}

function addToFavorites() {
  $favoritesButton.textContent = 'Remove from favorites';
  $favoritesButton.className = 'favorites-button added';
  var newFavorite = {};
  newFavorite.name = $selectedBreweryName.textContent;
  newFavorite.address = $selectedBreweryAddress.textContent;
  newFavorite.website = $selectedBreweryWebsite.textContent;
  newFavorite.phone = $selectedBreweryPhone.textContent;
  data.favorites.push(newFavorite);
}

function removeFromFavorites() {
  $favoritesButton.textContent = 'Add to favorites';
  $favoritesButton.className = 'favorites-button';
  for (var i = 0; i < data.favorites.length; i++) {
    if (data.favorites[i].name === data.selected.name) {
      data.favorites.splice(i, 1);
      data.selected.favorited = false;
    }
  }
}

function viewSwapping(data) {
  var view = data.view;
  for (var i = 0; i < $dataViews.length; i++) {
    $dataViews[i].className = 'data-view hidden';
    if (view === $dataViews[i].getAttribute('data-view')) {
      $dataViews[i].className = 'data-view';
      if ($dataViews[i].getAttribute('data-view') === 'favorites') {
      $headerName.textContent = 'Favorites';
      if (data.favorites.length !== 0) {
        $favoritesList.innerHTML = '';
        for (var f = 0; f < data.favorites.length; f++) {
          $emptyFavoritesMessage.className = 'gray-text empty-favorites-message hidden'
          $favoritesList.appendChild(renderFavorites(data.favorites[f]))
        }
      }
       else {
        $emptyFavoritesMessage.className = 'gray-text empty-favorites-message';
        $favoritesList.innerHTML = ''
      }
    }
       else if ($dataViews[i].getAttribute('data-view') === 'brewery-options') {
        $headerName.textContent = 'Breweries in ' + capitalizeWords(data.location);
      } else if ($dataViews[i].getAttribute('data-view') === 'welcome') {
        $welcomeGreeting.textContent = "Let's Grab a drink!";
        $welcomeMessage.textContent = "Enter your city for a list of all the great brewery options near you!";
        $headerName.textContent = 'Brew Find'
      } else {
        $headerName.textContent = 'Brew Find';
        }
      }
    }
  }

function renderOptions(data) {
    var $colHalfDiv = document.createElement('div');
    $colHalfDiv.className = 'col-half';

    var $imageDiv = document.createElement('div');
    $imageDiv.className = 'image-div';

    var $brewInfoCol = document.createElement('div');
    $brewInfoCol.className = 'column brew-info text-center';

    var $brewName = document.createElement('p');
    $brewName.textContent = data.name;
    $brewName.className = 'brewName';

    var $brewAddress = document.createElement('p');
    $brewAddress.textContent = data.street + ', ' + data.city + ' ' + data.state + ' ' + data.postal_code;
    $brewAddress.className = 'brewAddress';

    $colHalfDiv.appendChild($imageDiv);
    $imageDiv.appendChild($brewInfoCol);
    $brewInfoCol.appendChild($brewName);
    $brewInfoCol.appendChild($brewAddress);

    return $colHalfDiv;
}

function renderFavorites(data) {

  var $favorieColHalfDiv = document.createElement('div');
  $favorieColHalfDiv.className = 'col-half';

  var $favoriteImageDiv = document.createElement('div');
  $favoriteImageDiv.className = 'image-div';

  var $favoriteBrewInfoCol = document.createElement('div');
  $favoriteBrewInfoCol.className = 'column brew-info text-center';

  var $favoriteBrewName = document.createElement('p');
  $favoriteBrewName.textContent = data.name;
  $favoriteBrewName.className = 'brewName';

  var $favoriteBrewAddress = document.createElement('p');
  $favoriteBrewAddress.textContent = data.address
  $favoriteBrewAddress.className = 'brewAddress';

  $favorieColHalfDiv.appendChild($favoriteImageDiv);
  $favoriteImageDiv.appendChild($favoriteBrewInfoCol);
  $favoriteBrewInfoCol.appendChild($favoriteBrewName);
  $favoriteBrewInfoCol.appendChild($favoriteBrewAddress);

  return $favorieColHalfDiv;
}

function renderReviews (data) {
  $reviewBox = document.createElement('div');
  $reviewBox.className = 'review-box';

  $reviewParagraph = document.createElement('p');
  $reviewQuote = document.createElement('q');
  $reviewQuote.textContent = data.reviewText;

  $reviewBox.appendChild($reviewParagraph);
  $reviewParagraph.appendChild($reviewQuote);

  return $reviewBox;
}

function capitalizeWords(string) {
  var firstChar = string[0].toUpperCase();
  var phrase = '';
  for (var i = 1; i < string.length; i++) {
    phrase += string[i].toLowerCase();
    if (string[i] === ' ') {
      phrase += string[i + 1].toUpperCase();
      i++;
    }
  }
  return firstChar + phrase;
}
