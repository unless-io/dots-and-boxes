import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ 
    "state", 
    "turn", 
    "display", 
    "button",
    "playerOneScore", 
    "playerTwoScore",
    "playerOneName",
    "playerTwoName"
  ]

  connect() {
    this.size = this.element.dataset.size
    this.playerOne = this.element.dataset.playerOne
    this.playerTwo = this.element.dataset.playerTwo
    this.gameId = this.element.dataset.gameId
    this.currentPlayer = this.setCurrentPlayer()
    this.element.classList.add(this.currentPlayer === this.playerOne ? 'current-p1' : 'current-p2')
    this.notAPlayer = false

    if (this.stateTarget.value !== '') {
      this.game = JSON.parse(this.stateTarget.value)
      this.repopulateBoard()
    } else {
      this.populateBoard()
    }
    this.displayTurn()
    this.updateScore()
  }

  displayTurn() {
    if (this.canMove()) {
      this.displayTarget.innerHTML = "It is your turn"
      this.buttonTarget.classList.remove('d-none')
    } else if (this.notAPlayer) {
      this.displayTarget.innerHTML = "You are not a player in this game"
      this.buttonTarget.classList.add('d-none')
    } else {
      this.displayTarget.innerHTML = "Waiting for the other player..."
      this.buttonTarget.classList.add('d-none')
    }
  }

  populateBoard() {
    const game = []

    for(let i = 0; i < this.size; i++){
      const row = []
      for(let i = 0; i < this.size; i++){
        row.push({ value: false })
      }
      game.push(row)
    }
    this.game = game
  }

  repopulateBoard() {
    this.game.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        const input = document.querySelector(`input[data-row="${rowIndex}"][data-column="${columnIndex}"]`)
        if (column['value']) {
          input.checked = true
          input.disabled = true
        }
      })
    })
    this.updateField(this.game)
  }

  setCurrentPlayer() {
    if (this.getCookie(this.gameId) !== 'undefined') {
      return this.currentPlayer = JSON.parse(this.getCookie(this.gameId))
    }
  }

  handleMove(event) {
    const input = event.currentTarget
    const row = Number.parseInt(input.dataset.row)
    const column = Number.parseInt(input.dataset.column)
    const game = JSON.parse(JSON.stringify(this.game));


    if (!this.canMove()) {
      event.preventDefault()
      return
    }

    if (input.checked && this.choice) {
      this.choice.checked = false
      this.choice = input
    } else if (input.checked) {
      this.choice = input
    } else {
      this.choice = undefined
    }
    game[row][column]['value'] = true
    game[row][column]['move'] = this.currentPlayer
    this.updateField(game)
  }

  handleSubmit(event) {
    if (this.choice === undefined) return;
    const row = Number.parseInt(this.choice.dataset.row)
    const column = Number.parseInt(this.choice.dataset.column)
    const game = this.game
    const moveNumber = this.checkMoveNumber()

    if (!this.canMove()) {
      event.preventDefault()
      return
    }
    if (moveNumber === 0) {
      this.setPlayer(this.playerOne)
    }

    if (moveNumber === 1 && !this.currentPlayer) {
      this.setPlayer(this.playerTwo)
    }

    if (this.choice.checked) {
      this.choice.disabled = true
      game[row][column]['value'] = true
      game[row][column]['move'] = this.currentPlayer
      this.hasCreatedBox(game, row, column)
      this.turnTarget.value = this.currentPlayer
      this.updateField(this.game)
    }


    this.game = game
    this.stateTarget.value = JSON.stringify(this.game)
    this.displayTurn()
    this.updateScore()
    this.choice = undefined
    console.log(this.game)
  }

  checkMoveNumber() {
    let moveNumber = 0
    this.game.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        if(column['value']) {
          moveNumber += 1
        }
      })
    })
    this.moveNumber = moveNumber
    return moveNumber
  }

  canMove() {
    this.checkMoveNumber()
    if (this.turnTarget.value === 'undefined' && this.moveNumber !== 0) return false;
    if (this.turnTarget.value === this.currentPlayer) return false;
    if (this.moveNumber > 2 && this.currentPlayer === undefined) {
      this.notAPlayer = true
      return false
    }
    return true
  }

  hasCreatedBox(game, row, column) {
    const origin = game?.[row]?.[column]
    const topLeft = game?.[row - 1]?.[column - 1]
    const top = game?.[row - 1]?.[column]
    const topRight = game?.[row - 1]?.[column + 1]
    const middleLeft = game?.[row]?.[column - 1]
    const middleRight = game?.[row]?.[column + 1]
    const bottomLeft = game?.[row + 1]?.[column - 1]
    const bottom = game?.[row + 1]?.[column]
    const bottomRight = game?.[row + 1]?.[column + 1]

    // TOP LEFT QUADRANT
    if (topLeft?.['value'] && top?.['value'] && middleLeft?.['value']) {
      topLeft['conquered'] = this.currentPlayer
    }

    // TOP RIGHT QUADRANT
    if (topRight?.['value'] && top?.['value'] && middleRight?.['value']) {
      top['conquered'] = this.currentPlayer
    }

    // BOTTOM LEFT QUADRANT
    if (middleLeft?.['value'] && bottomLeft?.['value'] && bottom?.['value']) {
      middleLeft['conquered'] = this.currentPlayer
    }

    // BOTTOM RIGHT QUADRANT
    if (middleRight?.['value'] && bottomRight?.['value'] && bottom?.['value']) {
      origin['conquered'] = this.currentPlayer
    }
  }

  setPlayer(player) {
    this.updateCookie(this.gameId, player)
    this.currentPlayer = player
  }

  clearCookies() {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + `;path=${window.location.pathname}`); });
  }

  updateCookie(name, cookieData) {
    const updatedCookieString = new URLSearchParams(JSON.stringify(cookieData)).toString().replace(/=+$/, "");
    const formattedCookieString = `${name}=${updatedCookieString};path=${window.location.pathname}`
    this.clearCookies()
    document.cookie = formattedCookieString;
  }

  getCookie(cookieName) {
    let cookie = {};
    document.cookie.split(';').forEach((element) => {
      let [key,value] = element.split('=');
      cookie[key.trim()] = value;
    })
    return decodeURIComponent(cookie[cookieName]);
  }

  updateField(game) {
    game.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        const input = document.querySelector(`input[data-row="${rowIndex}"][data-column="${columnIndex}"]`)
        let rightComplete = false
        let belowComplete = false
        let belowRightComplete = false
        input.parentElement.classList = 'field-column'
        input.parentElement.classList.add(column['move'] === this.playerOne ? 'p1' : 'p2' )

        // CHECK FIELD TO THE RIGHT
        const fieldRight = game[rowIndex][columnIndex + 1]
        if (fieldRight && fieldRight['value']) {
          input.parentElement.classList.add('right-active')
          rightComplete = true
        }
        // CHECK FIELD BELOW
        const fieldBelow = game[rowIndex + 1] ? game[rowIndex + 1][columnIndex] : undefined
        if (fieldBelow && fieldBelow['value']) {
          input.parentElement.classList.add('below-active')
          belowComplete = true
        }
        // CHECK FIELD BELOW RIGHT
        const fieldBelowRight = game[rowIndex + 1] ? game[rowIndex + 1][columnIndex + 1] : undefined
        if (fieldBelowRight && fieldBelowRight['value']) {
          input.parentElement.classList.add('below-right-complete')
          belowRightComplete = true
        }

        if (rightComplete && belowComplete && belowRightComplete) {
          input.parentElement.classList.add('field-complete')
          if (this.playerOne === column['conquered']) {
            input.parentElement.classList.add('win-p1')
          } else if (this.playerTwo === column['conquered']) {
            input.parentElement.classList.add('win-p2')
          } else {
            const current = this.currentPlayer === this.playerOne ? 'p1' : 'p2' 
            input.parentElement.classList.add(`win-${current}`)
          }
        }
      })
    })
  }

  updateScore() {
    let playerOneScore = 0
    let playerTwoScore = 0
    this.game.flat().forEach(column => {
      if (column['conquered'] === this.playerOne) {
        playerOneScore += 1
      } else if (column['conquered'] === this.playerTwo) {
        playerTwoScore += 1
      }
    });
    this.playerOneScoreTarget.innerHTML = playerOneScore
    this.playerOneNameTarget.innerHTML = this.currentPlayer === this.playerOne ? 'Player 1' : 'Player 2'
    this.playerTwoScoreTarget.innerHTML = playerTwoScore
    this.playerTwoNameTarget.innerHTML = this.currentPlayer === this.playerTwo ? 'Player 1' : 'Player 2'  }

}
