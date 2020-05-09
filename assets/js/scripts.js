const categoryWhitelist = ['General Knowledge', 'Entertainment: Books', 'Entertainment: Film', 'Entertainment: Music', 'Entertainment: Television', 'Entertainment: Video Games', 'Science & Nature', 'Science: Computers', 'Sports', 'Geography', 'History', 'Entertainment: Japanese Anime & Manga']
const gamePlayer = {
    'username': '',
    'scores': []
}
const correctAnswers = []
const gameContent = $('#gameContentWrapper')
const gameTitle = $('#gameTitle')
const categoryPanel = $('#gameCategoryPanel')
const difficultyPanel = $('#gameDifficultyPanel')
const triviaWrapper = $('#triviaWrapper')
const triviaPanels = $('#triviaPanelDisplay')
const loadingSpinner = $('#loadingSpinner')

let currentCategory = ''
let difficultyMultiplier = 1
let checkAnswer = 0
let correctTotal = 0
let currentScore = 0

/**
 * Uses fetch API to return JSON data
 * @param {string} url takes an API address to fetch data
 */
const getData = async url => {
    try {
        return await (await fetch(url)).json()
    }
    catch {
        console.log('error')
    }
}

/**
 * Filters a list of chosen categories out of the complete list from the API
 * @param {array} completeList The API category list
 * @param {array} filterList Chosen category whitelist
 */
const filterCategories = (completeList, filterList) => {
    return completeList.filter(item => {
        return filterList.includes(item.name)
    })
}

/**
 * Displays a list of categories in the DOM
 * @param {array} categoryList The list of categories to display
 */
const displayCategories = categoryList => {
    rowNum = 0
    colNum = 4
    rowID = 1
    for (i=0; i<categoryList.length; i++) {
        if (rowNum % colNum === 0) {
            categoryPanel.append(`<div class='row game--category-row' id='row${rowID}'>`)
        }
        rowNum++
        $(`#row${rowID}`).append(`<button class='btn col-4 col-md-3 mx-auto game--category-select' id='${categoryList[i].id}'>${categoryList[i].name}</button>`)
        if (rowNum % colNum === 0) {
            categoryPanel.append(`</div>`)
            rowID++
        }
    }
}

/**
 * Loads a list of categories in the DOM, retreived and filtered from the API
 */
const loadCategories = async () => {
    try {
        const data = await getData('./categories.json')
        const categories = data.trivia_categories
        filteredCategories = filterCategories(categories, categoryWhitelist)
        displayCategories(filteredCategories)
        gameContent.fadeIn(1000)
        loadingSpinner.hide()
    }
    
    catch {
        console.log('error')
    }
}

/**
 * Generate a URL to fetch the specific trivia the user selects from the API
 * @param {number} categoryID the id of the category
 * @param {string} difficulty the selected difficulty
 */
function generateURL(categoryID, difficulty) {
    let urlDefault = 'https://opentdb.com/api.php?amount=10&type=multiple'
    let urlCategory = '&category=' + categoryID
    let urlDifficulty = '&difficulty=' + difficulty
    // return urlDefault + urlCategory + urlDifficulty
    return './trivia.json'
}

/**
 * Process array of data returned from the API
 * @param {string} triviaUrl address to fetch specific data from the API, generated by user selection
 */
const processTrivia = async (triviaUrl) => {
    const data = await getData(triviaUrl)
    triviaData = data.results
    triviaData.forEach((_, index) => {
        correctAnswers.push(triviaData[index].correct_answer)
        triviaData[index].incorrect_answers.push(triviaData[index].correct_answer)
    })
    for (i=0; i<triviaData[i].incorrect_answers.length; i++) {
        triviaData[i].incorrect_answers.sort(() => Math.random() - 0.5)
    }
    displayTrivia()
    gameContent.hide()
    loadingSpinner.show()
}

const displayTrivia = () => {
    triviaData.forEach((trivia, index) => {
        triviaPanels.append(`<div class='trivia--panel game--panel__hidden' id='gamePanel${index}'>
        <div class='row mx-0 game--question'>
            <div class='col-12 mx-auto my-auto'>
                <h3 id='trivia${index}Question'>${trivia.question}</h3>
            </div>
        </div>
        <div class='row mx-0 mb-1'>
            <button class='col-4 mx-auto game--answer--single game--answer--outline btn btn-default' id='trivia${index}Answer0'>${trivia.incorrect_answers[0]}</button>
            <button class='col-4 mx-auto game--answer--single game--answer--outline btn btn-default' id='trivia${index}Answer1'>${trivia.incorrect_answers[1]}</button>
        </div>
        <div class='row mx-0'>
            <button class='col-4 mx-auto game--answer--single game--answer--outline btn btn-default' id='trivia${index}Answer2'>${trivia.incorrect_answers[2]}</button>
            <button class='col-4 mx-auto game--answer--single game--answer--outline btn btn-default' id='trivia${index}Answer3'>${trivia.incorrect_answers[3]}</button>
        </div>
        </div>`)
    })
    correctAnswers.forEach((answer, index) => {
       for (i=0; i<4; i++) {
           if ($(`#trivia${index}Answer${i}`).text() === answer) {
            $(`#trivia${index}Answer${i}`).addClass(`correct-answer${index}`)
           }
       }
    })
}

const loadGame = async () => {
    await processTrivia(generateURL(userCategory, userDiff))
    $('#gamePanel0').show()
    gameContent.fadeIn(1000)
    triviaWrapper.fadeIn(1000)
    loadingSpinner.hide()
}



// Update scoreboard
function updateScoreboard() {
    $('#scoreboardBody').empty()
    for (const property in gamePlayer.scores) {
        $('#scoreboardBody').append(`<p>${property}: ${gamePlayer.scores[property]}</p>`)
    }
    localStorage.setItem(`${gamePlayer.username}`, JSON.stringify(gamePlayer))
    console.log('scoreboard updated');
}


// testing button
$(document).on('click', '#testClick', function () {
    console.log('click')
    // console.log($('#endgameScore p').last());
})

const checkUsernameExists = () => {
    if (typeof($('#usernameInput').val()) === 'string') {
        gamePlayer.username = $('#usernameInput').val()
        localStorage.setItem(`${gamePlayer.username}`, JSON.stringify(gamePlayer))
    }
}

$(document).on('click', '#welcomePlayButton', function () {
    checkUsernameExists()
    $('#welcomePanel').hide()
    loadingSpinner.show()
    setTimeout(() => {
        loadCategories()
    }, 2000);
})


$(document).on('click', '.game--category-select', function() {
    return $(this).attr('id')
})

$(document).on('click', '.game--category-select', function(event) {
    userCategory = event.result
    categoryPanel.hide()
    difficultyPanel.fadeIn(1000)
    gameTitle.text($(this).text())
})

$(document).on('click', '.game--difficulty-select', function() {
    return $(this).attr('id')
})

$(document).on('click', '.game--difficulty-select', function (event) {
    userDiff = event.result
    enableButton('#begin')
})

$(document).on('click', '#changeCategory', function() {
    gameTitle.text('Choose Your Category')
    difficultyPanel.hide()
    categoryPanel.fadeIn(1000)
    disableButton('#begin')
})

const setDifficultyMultiplier = () => {
    if (userDiff === 'hard') {
        difficultyMultiplier = 3
    } else if (userDiff === 'medium') {
        difficultyMultiplier = 2
    } else {
        difficultyMultiplier = 1
    }
}

$(document).on('click', '#begin', function() {
    difficultyPanel.hide()
    gameContent.hide()
    loadingSpinner.show()
    setTimeout(() => {
        loadGame()
    }, 2000);
    currentCategory = gameTitle.text()
    $('#currentQuestion').text(`${checkAnswer + 1}/10`)
    $('#displayUsername').text(gamePlayer.username)
    setDifficultyMultiplier()
})

$(document).on('click', '.game--answer--single', function (event) {
    console.log($(this).text())
    if ($(this).is(`.correct-answer${checkAnswer}`)) {
        $(this).addClass('btn-success')
        console.log('correct')
        correctTotal++
        currentScore = (correctTotal * difficultyMultiplier)
    } else {
        console.log('incorrect')
        $(this).addClass('btn-danger')
        $(`.correct-answer${checkAnswer}`).addClass('btn-outline-success').removeClass('game--answer--outline')
    }
    // disable answer buttons after selection is made to prevent multiple clicks
    disableButton('.game--answer--single')
    // display selection for 1.5 seconds before moving on
    setTimeout(() => {
        $(`#gamePanel${checkAnswer}`).hide()
        $(`#gamePanel${(checkAnswer + 1)}`).fadeIn(1000)
        checkAnswer++
        enableButton('.game--answer--single')
        $('#currentQuestion').text(`${checkAnswer + 1}/10`)
        // After all panels have been completed, show end game panel with score displayed
        if (checkAnswer === correctAnswers.length) {
            triviaWrapper.hide()
            gameTitle.hide()
            $('#endgamePanel').fadeIn(1000)
            if (typeof(gamePlayer.username) === 'string') {
                $('#endgameScore').children().children('h2').text(`${gamePlayer.username}!`)
            }
            $('#endgameScore').children().children('h4').text(currentCategory)
            $('#endgameScore p').first().text(`Correct answers: ${correctTotal}`)
            $('#endgameScore p').last().text(`Difficulty multiplier: ${difficultyMultiplier}`)
            $('#endgameScore').children().children('h5').text(`Total score: ${currentScore}`)
            Object.assign(gamePlayer.scores, {[currentCategory]: currentScore})
            updateScoreboard()
        }
    }, 1500)
    // update current score display
    if (currentScore === 1) {
        $('#playerScore').text(`${currentScore} point`)
    } else {
        $('#playerScore').text(`${currentScore} points`)
    }
})

// Reset from end game panel back to category select screen so it can be played again
$('#endgameButton').on('click', function() {
    console.log('click')
    resetGame()
})

function resetGame() {
    triviaPanels.empty()
    correctArray = []
    checkAnswer = 0
    difficultyMultiplier = 1
    currentScore = 0
    correctTotal = 0
    $('#endgamePanel').hide()
    categoryPanel.fadeIn(1000)
    gameTitle.fadeIn(1000).text(`Choose Your Category`)
    $('#playerScore').text(`Score`)
    disableButton('#begin')
    updateScoreboard()
}

function disableButton(selector) {
    $(selector).attr('disabled', true)
}

function enableButton(selector) {
    $(selector).removeAttr('disabled')
}


$(document).ready(function () {


})
